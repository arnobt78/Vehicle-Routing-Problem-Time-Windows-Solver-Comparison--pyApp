"""
Solver executor: runs VRPTW algorithms (HGS, GLS, ILS, ACO, SA) in background threads.
Each run is bound to a job_id; stdout and logs are routed to that job for the frontend.
Supports runtime limits, early stop (ACO/SA when runtime empty), and user-initiated stop.
"""
import sys
import threading
import time

from app.api.models.request_models import DEFAULT_PARAMS
from app.core.config import DATASET_PATH, DEFAULT_RUNTIME
from app.services.job_store import append_log, get_job, set_error, set_result, set_running

# Thread-local routing: each solver run's stdout goes only to its own job.
_solver_thread_job: dict[int, str] = {}
_solver_stdout_lock = threading.Lock()
_real_stdout = None
_real_stderr = None


class _ThreadAwareStdout:
    """Single global stdout that routes each thread's output to that thread's job_id."""

    def __init__(self, real):
        self.real = real

    def write(self, s: str) -> None:
        if not isinstance(s, str):
            s = str(s)
        s = s.replace("\r\n", "\n").replace("\r", "\n")
        with _solver_stdout_lock:
            job_id = _solver_thread_job.get(threading.get_ident())
        if job_id:
            for line in s.split("\n"):
                line = line.rstrip()
                if line:
                    append_log(job_id, line)
        self.real.write(s)
        self.real.flush()

    def flush(self) -> None:
        self.real.flush()


def _progress_reporter(job_id: str, algo: str, interval: float = 2.0) -> None:
    """Append live progress lines to the job log so they stream to the frontend."""
    start = time.time()
    algo_upper = algo.upper()
    while True:
        time.sleep(interval)
        job = get_job(job_id)
        if not job or job.get("status") != "running":
            return
        elapsed = int(time.time() - start)
        append_log(job_id, f"{algo_upper}: {elapsed}s elapsed, optimizing...")


def _run_algo(job_id: str, algo: str, input_path: str, runtime: int, params: dict | None) -> None:
    """Run a single algorithm in the current thread; merges DEFAULT_PARAMS with request params."""
    global _real_stdout, _real_stderr
    with _solver_stdout_lock:
        if _real_stdout is None:
            _real_stdout = sys.stdout
            _real_stderr = sys.stderr
            sys.stdout = _ThreadAwareStdout(_real_stdout)
            sys.stderr = _ThreadAwareStdout(_real_stderr)
        _solver_thread_job[threading.get_ident()] = job_id

    try:
        p = {**(DEFAULT_PARAMS.get(algo, {})), **(params or {})}
        # Progress bar window only (does not change actual algo runtime)
        runtime_limit_sec: int | None
        if algo == "aco":
            rmin = p.get("runtime_minutes")
            if rmin is None or rmin == 0:
                runtime_limit_sec = None  # run naturally, no progress cap
            else:
                runtime_limit_sec = int(rmin) * 60
        elif algo == "sa":
            rmin = p.get("runtime_minutes")
            if rmin is None or rmin == 0:
                # Legacy: allow runtime in seconds
                rsec = p.get("runtime")
                if rsec is not None and rsec > 0:
                    runtime_limit_sec = int(rsec)
                else:
                    runtime_limit_sec = None  # run naturally
            else:
                runtime_limit_sec = int(rmin) * 60
        elif algo == "gls":
            # Use requested limit for progress bar; OR-Tools GLS may run past it
            runtime_limit_sec = p.get("runtime", runtime)
        else:
            runtime_limit_sec = p.get("runtime", runtime)
        set_running(job_id, runtime_limit_sec)
        append_log(job_id, f"Starting {algo.upper()}...")
        progress_thread = threading.Thread(
            target=_progress_reporter,
            args=(job_id, algo, 5.0),
            daemon=True,
        )
        progress_thread.start()
        try:
            start = time.time()
            if algo == "ils":
                try:
                    from ils.solve import solve_with_ils
                    routes, cost = solve_with_ils(input_path, p.get("runtime", runtime))
                except ImportError:
                    raise ValueError("ILS requires pyvrp>=0.13. Install with: pip install 'pyvrp>=0.13'")
            elif algo == "hgs":
                from hgs.solve import solve_with_hgs
                routes, cost = solve_with_hgs(input_path, p.get("runtime", runtime))
            elif algo == "gls":
                from gls.solve import solve_with_gls
                routes, cost = solve_with_gls(input_path, p.get("runtime", runtime))
            elif algo == "aco":
                # ACO/SA runtime (empty vs set): Leave empty to run until the algorithm stops
                # naturally (stops after 50 checks of 5 s each, i.e. 250 s, with no improvement
                # in cost or vehicle count), or set a time limit (e.g. 5–15+ min) for predictable results.
                from aco.vrptw_base import VrptwGraph
                from aco.multiple_ant_colony_system import MultipleAntColonySystem
                from aco.solve import get_best_route_from_path
                rho = p.get("rho", 0.1)
                graph = VrptwGraph(input_path, rho)
                rmin = p.get("runtime_minutes")
                aco_minutes = int(rmin) if (rmin is not None and rmin > 0) else 60  # 60 min cap when "run naturally"
                aco_natural_run = rmin is None or rmin == 0  # early stop only when runtime is empty
                macs = MultipleAntColonySystem(
                    graph,
                    ants_num=p.get("ants_num", 30),
                    beta=p.get("beta", 0.9),
                    q0=p.get("q0", 0.9),
                    whether_or_not_to_show_figure=False,
                    runtime_in_minutes=aco_minutes,
                )
                aco_logger = lambda msg: append_log(job_id, msg)
                should_stop = lambda: (get_job(job_id) or {}).get("status") == "stopped"
                macs.run_multiple_ant_colony_system(
                    logger=aco_logger,
                    log_every_seconds=5.0,
                    should_stop=should_stop,
                    no_improvement_iters=50 if aco_natural_run else None,
                )
                routes = get_best_route_from_path(macs.best_path)
                cost = round(macs.best_path_distance.value, 1)
            elif algo == "sa":
                # Same runtime semantics as ACO (see comment above): empty = natural run with
                # early stop after 50×5s with no improvement; otherwise use time limit.
                from sa.instance_loader import load_from_file
                from sa.simulated_annealing import sa_algorithm
                init_temp = p.get("init_temp", 700)
                cr = p.get("cooling_rate", 0.9999)
                rmin = p.get("runtime_minutes")
                if rmin is not None and rmin > 0:
                    sa_runtime_sec = int(rmin) * 60
                else:
                    rsec = p.get("runtime")
                    sa_runtime_sec = int(rsec) if (rsec is not None and rsec > 0) else None  # natural
                sa_natural_run = sa_runtime_sec is None  # early stop only when runtime is empty
                instance = load_from_file(input_path)
                instance.find_initial_solution()
                sa_logger = lambda msg: append_log(job_id, msg)
                should_stop = lambda: (get_job(job_id) or {}).get("status") == "stopped"
                results = sa_algorithm(
                    instance,
                    temp_start=init_temp,
                    update_temp=lambda t: cr * t,
                    stop_criterion=lambda t: t <= 0.01,
                    logger=sa_logger,
                    log_every_seconds=5.0,
                    max_runtime_sec=sa_runtime_sec,
                    should_stop=should_stop,
                    no_improvement_logs=50 if sa_natural_run else None,
                )
                routes = results[2][0].get_solution()
                cost = round(results[2][0].get_total_distance(), 1)
            else:
                raise ValueError(f"Unknown algorithm: {algo}")
            elapsed = time.time() - start
            set_result(job_id, routes, cost, round(elapsed, 2))
        except Exception as e:
            set_error(job_id, str(e))
    finally:
        with _solver_stdout_lock:
            _solver_thread_job.pop(threading.get_ident(), None)


def run_solve(job_id: str, dataset: str, algo: str, runtime: int | None = None, params: dict | None = None) -> None:
    """Start a solve in a background thread; returns immediately. Job state is updated via job_store."""
    runtime = runtime or DEFAULT_RUNTIME
    input_path = str(DATASET_PATH / f"{dataset}.txt")
    t = threading.Thread(target=_run_algo, args=(job_id, algo, input_path, runtime, params))
    t.start()
