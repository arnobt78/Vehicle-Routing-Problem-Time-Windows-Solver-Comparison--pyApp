"""
Results API: get job status/result (polling), generate route plot image.
Plot normalizes route indices (0-based vs 1-based) for compatibility with different solvers.
"""
import io
import time

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.core.config import DATASET_PATH
from app.services.job_store import get_job
from app.utils.instance_reader import read_solomon
from plot import plot_my_solution
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

router = APIRouter(prefix="/results", tags=["results"])


def _to_jsonable(obj):
    """Convert numpy/scalar types to native Python so FastAPI can serialize."""
    try:
        import numpy as np
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
    except ImportError:
        pass
    if isinstance(obj, dict):
        return {k: _to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_jsonable(v) for v in obj]
    return obj


def _job_progress(job: dict) -> dict:
    """Build progress from elapsed / runtime_limit (same as Solver). Cap at 99.9% until completed."""
    out = {}
    started_at = job.get("started_at")
    runtime_limit = job.get("runtime_limit")
    if started_at is not None:
        elapsed = max(0, time.time() - started_at)
        out["elapsed_sec"] = round(elapsed, 1)
    if runtime_limit is not None and runtime_limit > 0:
        out["runtime_limit"] = runtime_limit
        if "elapsed_sec" in out:
            pct = min(100, round(100 * out["elapsed_sec"] / runtime_limit, 1))
            if job.get("status") == "running" and pct >= 100:
                pct = 99.9
            out["progress_pct"] = pct
    return out


@router.get("/{job_id}")
def get_results(job_id: str):
    """Return job status; if completed, include result (routes, cost, runtime). If running, include progress (elapsed, limit, progress_pct)."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "failed":
        return {"status": "failed", "error": job.get("error")}
    if job["status"] == "stopped":
        return {"status": "stopped", "error": job.get("error")}
    if job["status"] != "completed":
        resp = {"status": job["status"], "result": None}
        resp.update(_job_progress(job))
        return resp
    result = job["result"]
    return {"status": "completed", "result": _to_jsonable(result)}


@router.get("/{job_id}/plot")
def get_plot(job_id: str):
    """Generate a PNG route plot for a completed job; normalizes 0-based routes to 1-based for display."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not yet completed")
    result = job["result"]
    dataset = job["dataset"]
    algo = job["algo"]
    input_path = str(DATASET_PATH / f"{dataset}.txt")
    instance = read_solomon(input_path)
    num_clients = instance.num_clients
    dim = num_clients + 1  # 0 = depot, 1..num_clients = clients

    # Normalize routes to list of list of int; support 0-based client indices (e.g. pyvrp 0.13)
    raw_routes = result.get("routes") or []
    routes = []
    for r in raw_routes:
        try:
            route = [int(v) for v in r]
        except (TypeError, ValueError):
            route = []
        if route:
            routes.append(route)

    # If indices look 0-based (min 0, max num_clients-1), convert to 1-based for plot
    if routes:
        all_vals = [v for route in routes for v in route]
        lo, hi = min(all_vals), max(all_vals)
        if lo == 0 and hi <= num_clients and dim > 1:
            routes = [[v + 1 for v in route] for route in routes]

    fig, ax = plt.subplots(figsize=(10, 10))
    plot_my_solution({"routes": routes, "cost": result["cost"]}, instance, ax=ax, dataset=dataset, algo=algo.upper())
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return Response(content=buf.read(), media_type="image/png")
