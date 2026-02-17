import os
from pathlib import Path

_here = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = _here / os.getenv("DATASET_PATH", "dataset")
DEFAULT_RUNTIME = int(os.getenv("DEFAULT_RUNTIME", "120"))

# Option A (two backends): set BACKEND_ALGOS so this instance only runs specific algos.
# Main backend: BACKEND_ALGOS=hgs,gls,aco,sa
# ILS backend:  BACKEND_ALGOS=ils
# If unset: we support hgs, gls, aco, sa, and ils only if pyvrp>=0.13 is available.
def _has_ils() -> bool:
    try:
        from ils.solve import solve_with_ils  # noqa: F401
        return True
    except ImportError:
        return False


def get_supported_algos() -> set[str]:
    raw = os.getenv("BACKEND_ALGOS", "").strip()
    if raw:
        return {a.strip().lower() for a in raw.split(",") if a.strip()}
    # Default: 4 algos + ils only when pyvrp 0.13+ is available
    algos = {"hgs", "gls", "aco", "sa"}
    if _has_ils():
        algos.add("ils")
    return algos


SUPPORTED_ALGOS = get_supported_algos()
