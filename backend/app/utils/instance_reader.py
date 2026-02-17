"""
Compatibility layer for reading Solomon-format VRPTW instances.

pyvrp 0.6.3: read(path, instance_format="solomon", round_func="trunc1")
pyvrp 0.13+: read() no longer accepts instance_format; use vrplib directly
and pyvrp internals to build ProblemData.
"""
from pathlib import Path

import numpy as np

from pyvrp import ProblemData


def read_solomon(path: str | Path, round_func: str = "trunc1") -> ProblemData:
    """
    Read a VRPTW instance in Solomon format (.txt) and return ProblemData.

    Parameters
    ----------
    path : str | Path
        Path to the Solomon-format instance file.
    round_func : str, default "trunc1"
        Rounding: "trunc1" / "dimacs" scales by 10 (for Solomon 1-decimal).

    Returns
    -------
    ProblemData
        PyVRP ProblemData instance.
    """
    path = Path(path)

    # pyvrp 0.6.3: read() accepts instance_format
    try:
        from pyvrp import read
        return read(str(path), instance_format="solomon", round_func=round_func)
    except TypeError:
        pass

    # pyvrp 0.13+: use vrplib and pyvrp internals
    import vrplib
    from pyvrp.read import ROUND_FUNCS, _InstanceParser, _ProblemDataBuilder

    inst = vrplib.read_instance(str(path), instance_format="solomon")
    inst["dimension"] = len(inst["node_coord"])
    inst.setdefault("depot", np.array([0]))

    rf_name = "dimacs" if round_func == "trunc1" else round_func
    rf = ROUND_FUNCS.get(rf_name, ROUND_FUNCS["dimacs"])
    parser = _InstanceParser(inst, rf)
    builder = _ProblemDataBuilder(parser)
    return builder.data()
