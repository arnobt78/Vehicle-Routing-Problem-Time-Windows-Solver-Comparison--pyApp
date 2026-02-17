from fastapi import APIRouter, HTTPException

from app.api.models.request_models import DEFAULT_PARAMS

router = APIRouter(prefix="/parameters", tags=["parameters"])

ALGOS = {"aco", "gls", "sa", "hgs", "ils"}


@router.get("/{algo}")
def get_parameters(algo: str):
    if algo.lower() not in ALGOS:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm. Use: {list(ALGOS)}")
    return DEFAULT_PARAMS.get(algo.lower(), {})


@router.put("/{algo}")
def put_parameters(algo: str, body: dict):
    if algo.lower() not in ALGOS:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm. Use: {list(ALGOS)}")
    current = DEFAULT_PARAMS.get(algo.lower(), {}).copy()
    for k, v in body.items():
        if k in current:
            current[k] = v
    DEFAULT_PARAMS[algo.lower()] = current
    return current
