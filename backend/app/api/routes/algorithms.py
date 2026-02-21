"""
Solve API: start single-algo or compare jobs, stop job, stream logs via SSE.
All solve work runs in background threads; this module only creates jobs and delegates to solver_executor.
"""
import asyncio
import json
import time

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.api.models.request_models import SolveRequest
from app.core.config import SUPPORTED_ALGOS
from app.services.job_store import append_log, create_job, get_job, set_stopped
from app.services.solver_executor import run_solve

router = APIRouter(prefix="/solve", tags=["solve"])


class CompareStatusRequest(BaseModel):
    job_ids: dict[str, str]  # algo -> job_id


def _job_progress(job: dict) -> dict:
    """Build progress from elapsed / runtime_limit (same idea as Solver page). Cap at 99.9% until completed."""
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


def _get_compare_params_for_algo(params: dict | None, algo: str) -> dict | None:
    """Extract params for one algorithm from compare body: body.params can have keys like 'hgs', 'gls', 'aco'; merge shared + per-algo."""
    if not isinstance(params, dict):
        return None

    shared_params: dict = {}
    per_algo_params: dict = {}

    for key, value in params.items():
        if key in SUPPORTED_ALGOS and isinstance(value, dict):
            per_algo_params[key] = value
        else:
            shared_params[key] = value

    selected_algo_params = per_algo_params.get(algo, {})
    merged = {**shared_params, **selected_algo_params}
    return merged or None


@router.post("/compare")
def post_compare(body: SolveRequest):
    """Start one job per supported algorithm (same dataset); returns job_ids keyed by algo name."""
    job_ids = {}
    for algo in sorted(SUPPORTED_ALGOS):
        job_id = create_job(body.dataset, algo)
        params = _get_compare_params_for_algo(body.params, algo)
        run_solve(job_id, body.dataset, algo, body.runtime, params)
        job_ids[algo] = job_id
    return {"job_ids": job_ids}


@router.post("/compare-status")
def post_compare_status(body: CompareStatusRequest):
    """Return status and per-job progress for all given job_ids (one poll for compare page)."""
    jobs: dict[str, dict] = {}
    for algo, job_id in body.job_ids.items():
        try:
            job = get_job(job_id)
            if not job:
                continue
            status = job.get("status", "pending")
            payload: dict = {"status": status}
            if status == "completed":
                payload["result"] = job.get("result")
            elif status == "failed":
                payload["error"] = job.get("error")
            elif status == "stopped":
                payload["error"] = job.get("error")
            else:
                payload["result"] = None
                payload.update(_job_progress(job))
            jobs[algo] = payload
        except Exception:
            # Don't fail entire request if one job fails (e.g. missing key, race)
            jobs[algo] = {"status": "running", "result": None}
    return {"jobs": jobs}


@router.post("/{algo}")
def post_solve(algo: str, body: SolveRequest):
    """Start a single-algorithm solve job; returns job_id for polling and streaming."""
    algo_lower = algo.lower()
    if algo_lower not in SUPPORTED_ALGOS:
        raise HTTPException(status_code=400, detail=f"Algorithm not supported on this backend. Supported: {sorted(SUPPORTED_ALGOS)}")
    job_id = create_job(body.dataset, algo_lower)
    run_solve(job_id, body.dataset, algo_lower, body.runtime, body.params)
    return {"job_id": job_id}


@router.post("/{job_id}/stop")
def stop_solve(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    status = job.get("status")
    if status in ("completed", "failed", "stopped"):
        return {"status": status}

    append_log(job_id, "Stop requested by user")
    set_stopped(job_id, "Stopped by user")
    return {"status": "stopped"}


def _sse_format(event: str, data: str) -> str:
    return f"event: {event}\ndata: {data}\n\n"


@router.get("/{job_id}/stream")
async def stream_solve(job_id: str):
    """SSE stream: new log lines and final status/result when job completes or fails."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def gen():
        last = 0
        while True:
            j = get_job(job_id)
            if not j:
                yield _sse_format("error", json.dumps({"error": "Job not found"}))
                return
            logs = j.get("logs", [])
            for i in range(last, len(logs)):
                yield _sse_format("log", json.dumps({"line": logs[i]}))
            last = len(logs)
            if j["status"] in ("completed", "failed", "stopped"):
                yield _sse_format("done", json.dumps({"status": j["status"], "result": j.get("result"), "error": j.get("error")}))
                return
            await asyncio.sleep(0.2)

    return StreamingResponse(gen(), media_type="text/event-stream")
