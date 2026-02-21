"""
In-memory job store for solve runs: status, logs, result, error.
Used by the solver executor and the results API; single process only (no persistence).
"""
import time
import uuid
from threading import Lock

_jobs: dict[str, dict] = {}
_lock = Lock()


def create_job(dataset: str, algo: str) -> str:
    """Create a new job record (pending) and return its job_id."""
    job_id = str(uuid.uuid4())
    with _lock:
        _jobs[job_id] = {
            "status": "pending",
            "dataset": dataset,
            "algo": algo,
            "logs": [],
            "result": None,
            "error": None,
            "started_at": None,
            "runtime_limit": None,
        }
    return job_id


def append_log(job_id: str, line: str) -> None:
    """Append a line to the job's log (streamed to frontend as execution log)."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["logs"].append(line)


def set_result(job_id: str, routes: list, cost: float, runtime: float) -> None:
    """Store solution (routes, cost, wall-clock runtime). If status is already 'stopped', keep it."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["result"] = {"routes": routes, "cost": cost, "runtime": runtime}
            if _jobs[job_id].get("status") != "stopped":
                _jobs[job_id]["status"] = "completed"


def set_error(job_id: str, error: str) -> None:
    """Mark job as failed with an error message; no-op if already stopped by user."""
    with _lock:
        if job_id in _jobs:
            if _jobs[job_id].get("status") == "stopped":
                return
            _jobs[job_id]["status"] = "failed"
            _jobs[job_id]["error"] = error


def set_running(job_id: str, runtime_limit_sec: int | None = None) -> None:
    """Mark job as running; optional runtime_limit_sec drives progress bar in UI."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["status"] = "running"
            _jobs[job_id]["started_at"] = time.time()
            if runtime_limit_sec is not None:
                _jobs[job_id]["runtime_limit"] = runtime_limit_sec


def set_stopped(job_id: str, reason: str | None = None) -> None:
    """Mark job as stopped (e.g. user clicked Stop); optional reason stored in error."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["status"] = "stopped"
            if reason:
                _jobs[job_id]["error"] = reason


def get_job(job_id: str) -> dict | None:
    """Return the job record (status, logs, result, error, etc.) or None."""
    with _lock:
        return _jobs.get(job_id)
