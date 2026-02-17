"""
Hybrid Genetic Search (HGS) Solver Interface

HGS is a state-of-the-art metaheuristic that combines:
- Genetic Algorithm operators (selection, crossover, mutation)
- Local search improvements
- Adaptive parameter control

This module provides a simple interface to solve VRPTW instances using
the pyVRP library, which implements an efficient HGS algorithm.

Author: Arnob Mahmud
"""

from pyvrp import Model
from pyvrp.stop import MaxIterations, MaxRuntime

from app.utils.instance_reader import read_solomon

# Alternative stopping criterion: maximum number of iterations
# Uncomment to use iteration limit instead of time limit
ITERATIONS = 10


def solve_with_hgs(input_path, runtime):
    """
    Solve a VRPTW instance using Hybrid Genetic Search (HGS) algorithm.

    HGS works by:
    1. Creating an initial population of solutions
    2. Evolving the population using genetic operators (crossover, mutation)
    3. Improving solutions with local search
    4. Selecting best solutions for next generation
    5. Repeating until stopping criterion is met

    Parameters
    ----------
    input_path : str
        Path to the problem instance file in Solomon format (.txt file).
        The file should contain customer coordinates, demands, time windows, etc.
    
    runtime : int
        Maximum runtime in seconds. The algorithm will stop after this time
        even if it hasn't converged. Longer runtime generally gives better solutions.

    Returns
    -------
    tuple
        A tuple containing:
        - routes (list): List of routes, where each route is a list of customer IDs.
                        Example: [[1, 2, 3], [4, 5, 6]] means two routes.
        - cost (float): Total travel distance/cost of the solution.
                       Note: pyVRP uses integer costs internally, so we divide by 10
                       to get the actual distance.

    Example
    -------
    >>> routes, cost = solve_with_hgs("dataset/r101.txt", runtime=120)
    >>> print(f"HGS found {len(routes)} routes with cost {cost}")

    Notes
    -----
    - HGS is generally one of the best-performing algorithms for VRPTW
    - It typically finds optimal or near-optimal solutions
    - Runtime can be significant for large instances
    - The seed=0 ensures reproducibility (same results on each run)
    """
    # ========================================================================
    # LOAD PROBLEM INSTANCE
    # ========================================================================
    # Read the VRPTW instance from Solomon format file
    # instance_format="solomon": Specifies the file format (Solomon benchmark format)
    # round_func="trunc1": Rounding function for distances (truncate to 1 decimal)
    #                      This is needed because pyVRP uses integer arithmetic internally
    INSTANCE = read_solomon(input_path)
    
    # ========================================================================
    # CREATE MODEL
    # ========================================================================
    # Convert the problem instance into a pyVRP model
    # The model contains all problem data and is ready for optimization
    model = Model.from_data(INSTANCE)
    
    # ========================================================================
    # SOLVE WITH HGS
    # ========================================================================
    # Run the HGS algorithm with time limit
    # stop=MaxRuntime(runtime): Stop after 'runtime' seconds
    # seed=0: Random seed for reproducibility (same results each run)
    #         Change this to get different solutions (useful for multiple runs)
    result = model.solve(stop=MaxRuntime(runtime), seed=0)
    
    # Alternative: Stop after a fixed number of iterations
    # Uncomment the line below and comment the line above to use iteration limit
    # result = model.solve(stop=MaxIterations(ITERATIONS), seed=0)

    # ========================================================================
    # EXTRACT AND DISPLAY RESULTS
    # ========================================================================
    # pyVRP stores costs as integers (multiplied by 10 for precision)
    # Divide by 10 to get the actual distance
    cost_val = result.best.distance() / 10
    print("HGS cost:", cost_val)
    print("HGS solution:")
    print(result.best)
    
    # ========================================================================
    # CONVERT TO STANDARD FORMAT
    # ========================================================================
    # Extract routes from pyVRP result format
    # pyvrp 0.6.3: result.best.get_routes(); pyvrp 0.13+: result.best.routes()
    # route.visits() extracts the list of customer IDs in that route
    routes_fn = getattr(result.best, "routes", None) or getattr(result.best, "get_routes")
    routes = []
    for route in routes_fn():
        routes.append(list(route.visits()))

    # Return routes and cost (rounded to 1 decimal place)
    return routes, round(cost_val, 1)
