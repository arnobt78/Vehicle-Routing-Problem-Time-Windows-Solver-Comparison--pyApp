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
    """Solve VRPTW with PyVRP 0.13+ ILS; returns (routes, cost). Routes are normalized to 1-based for plot."""
    INSTANCE = read_solomon(input_path)
    model = Model.from_data(INSTANCE)
    result = model.solve(stop=MaxRuntime(runtime), seed=0)
    cost_val = result.best.distance() / 10
    print("ILS cost:", cost_val)
    print("ILS solution:")
    print(result.best)
    routes_fn = getattr(result.best, "routes", None) or getattr(result.best, "get_routes")
    # Ensure list of list of int; pyvrp 0.13 may return 0-based client indices
    route_list = routes_fn() if callable(routes_fn) else routes_fn
    routes = []
    for r in route_list:
        visits = r.visits() if hasattr(r, "visits") else r
        try:
            ids = [int(x) for x in visits]
        except (TypeError, ValueError):
            ids = []
        if ids:
            routes.append(ids)
    # If client indices are 0-based (0..num_clients-1), convert to 1-based for plot compatibility
    num_clients = INSTANCE.num_clients
    if routes and num_clients > 0:
        all_vals = [v for route in routes for v in route]
        if min(all_vals) == 0 and max(all_vals) < num_clients:
            routes = [[v + 1 for v in route] for route in routes]
    return routes, round(cost_val, 1)
