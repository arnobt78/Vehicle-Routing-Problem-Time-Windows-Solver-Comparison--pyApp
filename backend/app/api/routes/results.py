import io

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


@router.get("/{job_id}")
def get_results(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "failed":
        return {"status": "failed", "error": job.get("error")}
    if job["status"] == "stopped":
        return {"status": "stopped", "error": job.get("error")}
    if job["status"] != "completed":
        return {"status": job["status"], "result": None}
    return {"status": "completed", "result": job["result"]}


@router.get("/{job_id}/plot")
def get_plot(job_id: str):
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
    fig, ax = plt.subplots(figsize=(10, 10))
    plot_my_solution({"routes": result["routes"], "cost": result["cost"]}, instance, ax=ax, dataset=dataset, algo=algo.upper())
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return Response(content=buf.read(), media_type="image/png")
