import uuid
from threading import Lock

_jobs: dict[str, dict] = {}
_lock = Lock()


def create_job(dataset: str, algo: str) -> str:
    job_id = str(uuid.uuid4())
    with _lock:
        _jobs[job_id] = {
            "status": "pending",
            "dataset": dataset,
            "algo": algo,
            "logs": [],
            "result": None,
            "error": None,
        }
    return job_id


def append_log(job_id: str, line: str) -> None:
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["logs"].append(line)


def set_result(job_id: str, routes: list, cost: float, runtime: float) -> None:
    with _lock:
        if job_id in _jobs:
            if _jobs[job_id].get("status") == "stopped":
                return
            _jobs[job_id]["status"] = "completed"
            _jobs[job_id]["result"] = {"routes": routes, "cost": cost, "runtime": runtime}


def set_error(job_id: str, error: str) -> None:
    with _lock:
        if job_id in _jobs:
            if _jobs[job_id].get("status") == "stopped":
                return
            _jobs[job_id]["status"] = "failed"
            _jobs[job_id]["error"] = error


def set_running(job_id: str) -> None:
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["status"] = "running"


def set_stopped(job_id: str, reason: str | None = None) -> None:
    with _lock:
        if job_id in _jobs:
            _jobs[job_id]["status"] = "stopped"
            if reason:
                _jobs[job_id]["error"] = reason


def get_job(job_id: str) -> dict | None:
    with _lock:
        return _jobs.get(job_id)
