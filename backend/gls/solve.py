"""
Guided Local Search (GLS) Solver Interface

GLS is a metaheuristic that enhances local search by:
- Starting from an initial solution
- Performing local search to find local optima
- When stuck in local optimum, penalizing features that appear frequently
- This guides the search away from overused solution components
- Repeating until stopping criterion is met

This module uses Google OR-Tools with Guided Local Search metaheuristic
to solve VRPTW instances.

Author: Arnob Mahmud
"""

from gls.base_solver import Solver
from gls.instance_loader import load_instance
from gls.solver_model import SolverSetting


# Time precision scaler: converts floating-point times to integers
# OR-Tools works with integers, so we multiply times by this factor
# Example: time_precision_scaler=10 means 0.1 time units become 1 integer unit
# Higher values = more precision but slower computation
time_precision_scaler = 10


def solve_with_gls(input_path, runtime):
    """
    Solve a VRPTW instance using Guided Local Search (GLS) algorithm.

    GLS works by:
    1. Creating an initial solution (using a heuristic like cheapest insertion)
    2. Performing local search to improve the solution
    3. When reaching a local optimum, identifying "features" (e.g., specific edges)
    4. Penalizing frequently used features to escape local optima
    5. Continuing search with modified objective (original cost + penalties)
    6. Repeating until time limit or convergence

    Parameters
    ----------
    input_path : str
        Path to the problem instance file in Solomon format (.txt file).
        The file should contain customer coordinates, demands, time windows, etc.
    
    runtime : int
        Maximum runtime in seconds. The algorithm will stop after this time.
        GLS typically finds good solutions quickly but can improve with more time.

    Returns
    -------
    tuple
        A tuple containing:
        - routes (list): List of routes, where each route is a list of customer IDs.
                        Example: [[1, 2, 3], [4, 5, 6]] means two routes.
        - cost (float): Total travel distance/cost of the solution.

    Example
    -------
    >>> routes, cost = solve_with_gls("dataset/r101.txt", runtime=120)
    >>> print(f"GLS found {len(routes)} routes with cost {cost}")

    Notes
    -----
    - GLS is effective at finding good solutions quickly
    - It often uses fewer vehicles than other algorithms
    - The penalty mechanism helps escape local optima
    - OR-Tools handles constraint satisfaction (capacity, time windows)
    """
    # ========================================================================
    # CONFIGURE SOLVER SETTINGS
    # ========================================================================
    # Create solver settings
    # time_limit: Maximum time in seconds for the optimization
    settings = SolverSetting(time_limit=runtime)

    # ========================================================================
    # LOAD PROBLEM INSTANCE
    # ========================================================================
    # Load the VRPTW instance and convert to OR-Tools format
    # time_precision_scaler converts floating-point times to integers
    # (required because OR-Tools uses integer arithmetic)
    data = load_instance(input_path, time_precision_scaler)
    
    # ========================================================================
    # CREATE AND CONFIGURE SOLVER
    # ========================================================================
    # Create a GLS solver instance
    # The solver will use Guided Local Search metaheuristic from OR-Tools
    solver = Solver(data, time_precision_scaler)
    
    # Build the optimization model
    # This creates variables, constraints, and objective function
    # Constraints include: vehicle capacity, time windows, route connectivity
    solver.create_model()
    
    # ========================================================================
    # SOLVE THE PROBLEM
    # ========================================================================
    # Run the GLS algorithm with the specified settings
    # The solver will:
    # 1. Find an initial solution
    # 2. Perform local search improvements
    # 3. Apply penalty mechanism when stuck
    # 4. Continue until time limit or convergence
    solver.solve_model(settings)
    
    # ========================================================================
    # EXTRACT RESULTS
    # ========================================================================
    # Get the solution routes (list of customer sequences per vehicle)
    routes = solver.get_solution()
    
    # Get the total travel time (cost) of the solution
    # This is the sum of travel times for all routes
    travel_time = solver.get_solution_travel_time()
    print("GLS cost:", f"{travel_time:.1f}" if travel_time is not None else "N/A")
    print("GLS solution:")
    
    # Display each route with its customer sequence
    for i, route in enumerate(routes, start=1):
        # Convert customer IDs to string and join with spaces
        # Example: "Route #1: 1 2 3 4 5"
        print(f"Route #{i}: {' '.join(str(node) for node in route)}")
    print()

    # Return routes and cost (rounded to 1 decimal place)
    return routes, round(travel_time, 1) if travel_time is not None else 0.0
