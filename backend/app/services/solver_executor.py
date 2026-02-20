import sys
import threading
import time

from app.api.models.request_models import DEFAULT_PARAMS
from app.core.config import DATASET_PATH, DEFAULT_RUNTIME
from app.services.job_store import append_log, get_job, set_error, set_result, set_running


def _progress_reporter(job_id: str, algo: str, interval: float = 2.0) -> None:
    """Print live progress lines to stdout so they stream to the frontend."""
    start = time.time()
    algo_upper = algo.upper()
    while True:
        time.sleep(interval)
        job = get_job(job_id)
        if not job or job.get("status") != "running":
            return
        elapsed = int(time.time() - start)
        print(f"{algo_upper}: {elapsed}s elapsed, optimizing...")
        sys.stdout.flush()


def _run_algo(job_id: str, algo: str, input_path: str, runtime: int, params: dict | None) -> None:
    class LogCapture:
        """Captures stdout/stderr line-by-line for live streaming to frontend."""

        def __init__(self, inner, is_stderr: bool = False):
            self.inner = inner
            self.buf = []
            self.is_stderr = is_stderr

        def write(self, s):
            if not isinstance(s, str):
                s = str(s)
            # Normalize \r (carriage return) so overwrites become new lines
            s = s.replace("\r\n", "\n").replace("\r", "\n")
            for line in s.split("\n"):
                line = line.rstrip()
                if line:
                    append_log(job_id, line)
            self.inner.write(s)
            self.inner.flush()

        def flush(self):
            self.inner.flush()

    p = {**(DEFAULT_PARAMS.get(algo, {})), **(params or {})}
    # Progress bar window only (does not change actual algo runtime)
    runtime_limit_sec: int | None
    if algo == "aco":
        # ACO often runs 10+ min for better results; show bar over 12 min
        runtime_limit_sec = 800  # 12+ min
    elif algo == "sa":
        runtime_limit_sec = p.get("runtime", runtime)
    elif algo == "gls":
        # GLS typically completes around 8 min; show bar over 8 min
        runtime_limit_sec = 500  # 8+ min
    else:
        runtime_limit_sec = p.get("runtime", runtime)
    set_running(job_id, runtime_limit_sec)
    append_log(job_id, f"Starting {algo.upper()}...")
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    sys.stdout = LogCapture(old_stdout)
    sys.stderr = LogCapture(old_stderr, is_stderr=True)
    progress_thread = threading.Thread(
        target=_progress_reporter,
        args=(job_id, algo, 2.0),
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
            from aco.vrptw_base import VrptwGraph
            from aco.multiple_ant_colony_system import MultipleAntColonySystem
            from aco.solve import get_best_route_from_path
            rho = p.get("rho", 0.1)
            graph = VrptwGraph(input_path, rho)
            macs = MultipleAntColonySystem(
                graph,
                ants_num=p.get("ants_num", 30),
                beta=p.get("beta", 0.9),
                q0=p.get("q0", 0.9),
                whether_or_not_to_show_figure=False,
                runtime_in_minutes=p.get("runtime_minutes", 5),
            )
            macs.run_multiple_ant_colony_system(logger=print, log_every_seconds=1.0)
            routes = get_best_route_from_path(macs.best_path)
            cost = round(macs.best_path_distance.value, 1)
        elif algo == "sa":
            from sa.instance_loader import load_from_file
            from sa.simulated_annealing import sa_algorithm
            init_temp = p.get("init_temp", 700)
            cr = p.get("cooling_rate", 0.9999)
            sa_runtime = p.get("runtime", runtime)
            instance = load_from_file(input_path)
            instance.find_initial_solution()
            results = sa_algorithm(
                instance,
                temp_start=init_temp,
                update_temp=lambda t: cr * t,
                stop_criterion=lambda t: t <= 0.01,
                logger=print,
                log_every_seconds=1.0,
                max_runtime_sec=sa_runtime,
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
        sys.stdout = old_stdout
        sys.stderr = old_stderr


def run_solve(job_id: str, dataset: str, algo: str, runtime: int | None = None, params: dict | None = None) -> None:
    runtime = runtime or DEFAULT_RUNTIME
    input_path = str(DATASET_PATH / f"{dataset}.txt")
    t = threading.Thread(target=_run_algo, args=(job_id, algo, input_path, runtime, params))
    t.start()
