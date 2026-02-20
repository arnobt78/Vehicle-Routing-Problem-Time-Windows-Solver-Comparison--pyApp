from fastapi import APIRouter

from app.core.config import SUPPORTED_ALGOS

router = APIRouter(prefix="/health", tags=["health"])


def _pyvrp_version() -> str:
    try:
        from importlib.metadata import version
        return version("pyvrp")
    except Exception:
        return "unknown"


@router.get("")
def health():
    return {
        "status": "ok",
        "algorithms": sorted(SUPPORTED_ALGOS),
        "pyvrp_version": _pyvrp_version(),
    }
