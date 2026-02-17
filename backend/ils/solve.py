"""
ILS (Iterated Local Search) Solver Interface

Uses PyVRP 0.13+ which implements ILS instead of HGS.
Same API as HGS - Model.from_data, model.solve.
When pyvrp>=0.13 is installed, this runs ILS.
"""
from pyvrp import Model
from pyvrp.stop import MaxRuntime

from app.utils.instance_reader import read_solomon


def solve_with_ils(input_path: str, runtime: int):
    INSTANCE = read_solomon(input_path)
    model = Model.from_data(INSTANCE)
    result = model.solve(stop=MaxRuntime(runtime), seed=0)
    cost_val = result.best.distance() / 10
    print("ILS cost:", cost_val)
    print("ILS solution:")
    print(result.best)
    routes_fn = getattr(result.best, "routes", None) or getattr(result.best, "get_routes")
    routes = [list(r.visits()) for r in routes_fn()]
    return routes, round(cost_val, 1)
