"""
Datasets API: list instance names, get metadata (BKS cost/routes), download single instance or all as zip.
Instance files are expected in DATASET_PATH (Solomon .txt); optional .sol files for known best cost/routes.
"""
import io
import zipfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

from app.core.config import DATASET_PATH

router = APIRouter(prefix="/datasets", tags=["datasets"])


def _get_base() -> Path:
    base = Path(DATASET_PATH)
    if not base.exists():
        raise HTTPException(status_code=404, detail="Dataset folder not found")
    return base


def _parse_plain_bks(sol_path: Path):
    routes = []
    cost = None
    with sol_path.open() as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            if line.lower().startswith("route"):
                parts = line.split(":", 1)
                if len(parts) == 2:
                    nodes = [int(x) for x in parts[1].strip().split() if x.isdigit()]
                    if nodes:
                        routes.append(nodes)
            elif line.lower().startswith("cost"):
                parts = line.split(":", 1)
                if len(parts) == 2:
                    try:
                        cost = float(parts[1].strip())
                    except ValueError:
                        pass
    return routes or None, cost


@router.get("")
def list_datasets():
    """Return sorted list of dataset names (stem of each .txt file in DATASET_PATH)."""
    base = Path(DATASET_PATH)
    if not base.exists():
        return {"datasets": []}
    names = set()
    for f in base.glob("*.txt"):
        names.add(f.stem)
    return {"datasets": sorted(names)}


@router.get("/download-all")
def download_all_instances():
    """Download all Solomon instance (.txt) files as a zip archive."""
    base = _get_base()
    txt_files = sorted(base.glob("*.txt"))
    if not txt_files:
        raise HTTPException(status_code=404, detail="No instance files found")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in txt_files:
            zf.write(p, arcname=p.name)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=vrptw-instances.zip"},
    )


@router.get("/bks/download-all")
def download_all_bks():
    """Download all best-known solution (.sol) files as a zip archive."""
    base = _get_base()
    sol_files = sorted(base.glob("*.sol"))
    if not sol_files:
        raise HTTPException(status_code=404, detail="No BKS files found")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sol_files:
            zf.write(p, arcname=p.name)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=vrptw-bks.zip"},
    )


@router.get("/{name}")
def get_dataset(name: str):
    base = Path(DATASET_PATH)
    txt_path = base / f"{name}.txt"
    sol_path = base / f"{name}.sol"
    if not txt_path.exists():
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    bks_routes = None
    bks_cost = None
    if sol_path.exists():
        try:
            from vrplib import read_solution
            bks = read_solution(str(sol_path))
            bks_routes = bks.get("routes", [])
            bks_cost = bks.get("cost")
        except Exception:
            bks_routes, bks_cost = _parse_plain_bks(sol_path)
    coords = None
    try:
        with open(txt_path) as f:
            lines = [l.strip() for l in f if l.strip()]
        idx = 0
        while idx < len(lines) and "CUST NO" not in lines[idx]:
            idx += 1
        if idx + 1 < len(lines):
            idx += 1
            depot = None
            customers = []
            while idx < len(lines):
                parts = lines[idx].split()
                if len(parts) >= 3:
                    cid, x, y = int(parts[0]), float(parts[1]), float(parts[2])
                    if cid == 0:
                        depot = [x, y]
                    else:
                        customers.append({"id": cid, "x": x, "y": y})
                idx += 1
            if depot and customers:
                coords = {"depot": depot, "customers": customers}
    except Exception:
        pass

    return {
        "name": name,
        "txt_path": str(txt_path),
        "has_bks": sol_path.exists(),
        "bks_routes": bks_routes,
        "bks_cost": bks_cost,
        "coordinates": coords,
    }


@router.get("/{name}/download")
def download_instance(name: str):
    """Download a single instance (.txt) file."""
    base = _get_base()
    txt_path = base / f"{name}.txt"
    if not txt_path.exists():
        raise HTTPException(status_code=404, detail=f"Instance '{name}' not found")
    return FileResponse(
        txt_path,
        media_type="text/plain",
        filename=f"{name}.txt",
    )


@router.get("/{name}/bks/download")
def download_bks(name: str):
    """Download a single best-known solution (.sol) file."""
    base = _get_base()
    sol_path = base / f"{name}.sol"
    if not sol_path.exists():
        raise HTTPException(status_code=404, detail=f"BKS for '{name}' not found")
    return FileResponse(
        sol_path,
        media_type="application/octet-stream",
        filename=f"{name}.sol",
    )
