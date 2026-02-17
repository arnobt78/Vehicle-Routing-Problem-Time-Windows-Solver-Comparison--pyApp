import os
import threading
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend/ so it works regardless of CWD (root vs backend)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Fix SSL certificate verification on macOS (avoids CERTIFICATE_VERIFY_FAILED for AI APIs, etc.)
try:
    import certifi
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
except ImportError:
    pass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.api.routes import ai, algorithms, datasets, health, parameters, results, test_results
from app.services.rag_service import rag_available, rag_ensure_index

app = FastAPI(title="VRPTW Solver API", version="0.1.0")

# CORS: localhost for dev; add production frontend via CORS_ORIGINS (comma-separated, e.g. https://vrptw-solver.vercel.app).
_cors_origins = [o.strip() for o in (os.getenv("CORS_ORIGINS") or "").split(",") if o and o.strip()]
_origins = ["http://localhost:5173", "http://localhost:3000"] + _cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(algorithms.router, prefix="/api")
app.include_router(results.router, prefix="/api")
app.include_router(parameters.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(test_results.router, prefix="/api")


def _run_rag_bootstrap() -> None:
    """Run RAG index build in background (slow: downloads model, builds index)."""
    ok, reason = rag_available()
    if ok:
        return
    result = rag_ensure_index()
    if not result.get("ok", False):
        print(
            "[RAG] Startup bootstrap failed:",
            result.get("reason") or reason or "unknown error",
        )
    else:
        print(
            "[RAG] Startup bootstrap completed:",
            f"indexed_files={result.get('indexed_files', 0)}",
            f"pdf_files={result.get('pdf_files', 0)}",
            f"persist_dir={result.get('persist_dir', '')}",
        )


@app.on_event("startup")
def bootstrap_rag_index_on_startup():
    """
    Build RAG index automatically once when missing.
    Runs in a background thread so the API is ready immediately (avoids Bad Gateway
    while embedding model downloads/loads). Controlled by env: RAG_BOOTSTRAP_ON_STARTUP (default: true).
    """
    enabled = os.getenv("RAG_BOOTSTRAP_ON_STARTUP", "1").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    if not enabled:
        return
    thread = threading.Thread(target=_run_rag_bootstrap, daemon=True)
    thread.start()


@app.get("/test_results.zip")
def download_test_results_zip():
    zip_path = Path(__file__).resolve().parent.parent / "test_results.zip"
    if not zip_path.exists() or not zip_path.is_file():
        raise HTTPException(status_code=404, detail="test_results.zip not found")
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename="test_results.zip",
    )
