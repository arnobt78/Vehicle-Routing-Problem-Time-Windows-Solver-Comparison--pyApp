"""
Agent-based parameter tuning: autonomous loop of suggest → run → evaluate → suggest again.
Uses existing get_ai_suggestion, job_store, and solver_executor.
"""
import time

from app.api.models.request_models import DEFAULT_PARAMS
from app.services.ai_provider import _extract_json, get_ai_suggestion
from app.services.job_store import create_job, get_job
from app.services.solver_executor import run_solve


def run_tune_loop(
    algo: str,
    dataset: str,
    max_iterations: int = 3,
    runtime_per_run: int = 60,
    goal: str | None = None,
) -> dict:
    """
    Run up to max_iterations: get AI params → run solver → record cost → ask AI again with history.
    Returns { "best_params", "best_cost", "iterations": [ {"params", "cost"} ], "error" if any }.
    """
    best_cost: float | None = None
    best_params: dict | None = None
    history: list[dict] = []
    normalized_algo = (algo or "").strip().lower()

    bounds: dict[str, tuple[float, float]] = {
        "ants_num": (10, 60),
        "beta": (0.5, 2.0),
        "q0": (0.1, 1.0),
        "rho": (0.01, 0.3),
        "runtime_minutes": (1, 10),
        "runtime": (120, 600),
        "init_temp": (300, 1200),
        "cooling_rate": (0.99, 0.99999),
    }

    allowed_by_algo: dict[str, set[str]] = {
        "aco": {"ants_num", "beta", "q0", "rho", "runtime_minutes"},
        "hgs": {"runtime"},
        "gls": {"runtime"},
        "ils": {"runtime"},
        "sa": {"init_temp", "cooling_rate"},
    }

    baseline_goal = (
        goal.strip()
        if (goal or "").strip()
        else "Balance speed and solution quality using practical, stable defaults."
    )

    prompt_suffix = (
        f"User tuning goal: {baseline_goal}. "
        "Return JSON only with valid keys for this algorithm and values in allowed ranges."
    )

    for iteration in range(max_iterations):
        # 1. Get AI suggestion (with history of previous runs)
        try:
            raw = get_ai_suggestion(algo, dataset, prompt_suffix)
        except Exception as e:
            return {
                "best_params": best_params,
                "best_cost": best_cost,
                "iterations": history,
                "error": f"AI suggestion failed at iteration {iteration + 1}: {e}",
            }
        obj = _extract_json(raw)
        if not obj:
            return {
                "best_params": best_params,
                "best_cost": best_cost,
                "iterations": history,
                "error": f"Could not parse AI response as JSON at iteration {iteration + 1}",
            }
        # Restrict to known param keys and numeric values
        params = {}
        allowed_keys = allowed_by_algo.get(normalized_algo, set())
        for k, v in obj.items():
            if k not in allowed_keys:
                continue
            try:
                numeric = float(v)
            except (TypeError, ValueError):
                continue

            min_v, max_v = bounds.get(k, (-10**9, 10**9))
            numeric = max(min_v, min(max_v, numeric))
            if k in {"ants_num", "runtime_minutes", "runtime"}:
                params[k] = int(round(numeric))
            else:
                params[k] = float(numeric)

        if not params:
            params = dict(DEFAULT_PARAMS.get(normalized_algo, {}))

        # 2. Run solver
        job_id = create_job(dataset, algo)
        run_solve(job_id, dataset, algo, runtime_per_run, params)

        # 3. Poll until completed or failed
        cost: float | None = None
        for _ in range(600):
            job = get_job(job_id)
            if not job:
                cost = None
                break
            status = job.get("status")
            if status == "completed":
                res = job.get("result")
                cost = res.get("cost") if res else None
                break
            if status == "failed":
                cost = None
                break
            time.sleep(1)
        else:
            return {
                "best_params": best_params,
                "best_cost": best_cost,
                "iterations": history,
                "error": f"Run timed out at iteration {iteration + 1}",
            }

        history.append({"params": params, "cost": cost})

        if cost is not None and (best_cost is None or cost < best_cost):
            best_cost = cost
            best_params = params

        # 4. Build prompt for next iteration
        cost_str = f"{cost}" if cost is not None else "failed"
        prompt_suffix = (
            f"User tuning goal: {baseline_goal}. "
            f"Previous iteration used params {params} and got cost {cost_str}. "
            "Suggest a different valid JSON parameter set for this algorithm to improve cost while respecting ranges."
        )

    return {
        "best_params": best_params,
        "best_cost": best_cost,
        "iterations": history,
    }
