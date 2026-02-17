import asyncio
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.api.models.request_models import SolveRequest
from app.core.config import SUPPORTED_ALGOS
from app.services.job_store import append_log, create_job, get_job, set_stopped
from app.services.solver_executor import run_solve

router = APIRouter(prefix="/solve", tags=["solve"])


def _get_compare_params_for_algo(params: dict | None, algo: str) -> dict | None:
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
    job_ids = {}
    for algo in sorted(SUPPORTED_ALGOS):
        job_id = create_job(body.dataset, algo)
        params = _get_compare_params_for_algo(body.params, algo)
        run_solve(job_id, body.dataset, algo, body.runtime, params)
        job_ids[algo] = job_id
    return {"job_ids": job_ids}


@router.post("/{algo}")
def post_solve(algo: str, body: SolveRequest):
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
