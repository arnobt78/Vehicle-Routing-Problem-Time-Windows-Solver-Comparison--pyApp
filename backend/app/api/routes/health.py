from fastapi import APIRouter

from app.core.config import SUPPORTED_ALGOS

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health():
    return {"status": "ok", "algorithms": sorted(SUPPORTED_ALGOS)}
