"""API for browsing test results (BKS, algorithm outputs, experiment sets)."""
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, PlainTextResponse

_here = Path(__file__).resolve().parent.parent.parent.parent
TEST_RESULTS_PATH = _here / "test_results"

router = APIRouter(prefix="/test-results", tags=["test-results"])


@router.get("")
def list_experiment_sets():
    """List experiment set folders (e.g., experiment_set_1_results)."""
    if not TEST_RESULTS_PATH.exists():
        return {"sets": []}
    sets = []
    for d in sorted(TEST_RESULTS_PATH.iterdir()):
        if d.is_dir() and not d.name.startswith("."):
            sets.append({"id": d.name, "name": d.name.replace("_", " ").title()})
    return {"sets": sets}


@router.get("/{set_id}")
def list_experiments(set_id: str):
    """List experiment folders within a set (e.g., Ex.1 c101)."""
    base = TEST_RESULTS_PATH / set_id
    if not base.exists() or not base.is_dir():
        raise HTTPException(status_code=404, detail="Experiment set not found")
    experiments = []
    for d in sorted(base.iterdir()):
        if d.is_dir():
            txt = next(d.glob("*.txt"), None)
            pngs = list(d.glob("*.png"))
            experiments.append({
                "id": d.name,
                "has_txt": txt is not None,
                "txt_name": txt.name if txt else None,
                "image_count": len(pngs),
                "images": [p.name for p in sorted(pngs)],
            })
    return {"experiments": experiments}


@router.get("/{set_id}/{exp_id}/content")
def get_experiment_content(set_id: str, exp_id: str):
    """Get the .txt file content for an experiment (BKS + algorithm results)."""
    base = TEST_RESULTS_PATH / set_id / exp_id
    if not base.exists():
        raise HTTPException(status_code=404, detail="Experiment not found")
    txt = next(base.glob("*.txt"), None)
    if not txt:
        raise HTTPException(status_code=404, detail="No results file found")
    return PlainTextResponse(txt.read_text(encoding="utf-8", errors="replace"))


@router.get("/{set_id}/{exp_id}/image/{filename}")
def get_experiment_image(
    set_id: str,
    exp_id: str,
    filename: str,
    download: bool = Query(False, description="Return image as downloadable attachment"),
):
    """Serve a PNG image from an experiment folder."""
    base = TEST_RESULTS_PATH / set_id / exp_id
    if not base.exists():
        raise HTTPException(status_code=404, detail="Experiment not found")
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = base / filename
    if not path.exists() or not path.suffix.lower() == ".png":
        raise HTTPException(status_code=404, detail="Image not found")
    if download:
        return FileResponse(path, media_type="image/png", filename=filename)
    return FileResponse(path, media_type="image/png")
