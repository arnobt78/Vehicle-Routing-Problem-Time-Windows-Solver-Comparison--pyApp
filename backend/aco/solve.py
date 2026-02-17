"""
Ant Colony Optimization (ACO) Solver Interface

ACO is a population-based metaheuristic inspired by ant foraging behavior.
It works by:
- Multiple "ants" (agents) construct solutions probabilistically
- Ants deposit "pheromone" on paths they take
- Pheromone intensity guides future ants (positive feedback)
- Pheromone evaporates over time (prevents stagnation)
- Best solutions reinforce pheromone trails more strongly

This implementation uses Multiple Ant Colony System (MACS), which runs
two colonies in parallel:
- One focuses on minimizing distance (with fixed vehicle count)
- One focuses on minimizing vehicles (trying to use fewer vehicles)

Author: Arnob Mahmud
"""

from aco.vrptw_base import VrptwGraph
from aco.multiple_ant_colony_system import MultipleAntColonySystem


# ============================================================================
# ACO PARAMETERS
# ============================================================================
# Number of ants in the colony
# More ants = better exploration but slower computation
# Typical range: 10-60 depending on problem size
ants_num = 30

# Q0: Exploitation probability (also called "greediness")
# Probability of choosing the best option (highest pheromone * heuristic)
# vs. probabilistic selection (roulette wheel)
# Range: 0.0 (pure exploration) to 1.0 (pure exploitation)
# Higher values (0.7-0.9) = faster convergence, less exploration
q0 = 0.9

# Beta: Heuristic information importance
# Controls the relative importance of heuristic information (distance) 
# vs. pheromone trails
# Higher beta = more emphasis on distance heuristic (exploration)
# Lower beta = more emphasis on pheromone (exploitation)
# Typical range: 0.5 - 2.0
beta = 0.9

# Rho: Pheromone evaporation rate
# How quickly pheromone trails fade over time
# Higher rho = faster evaporation = quicker adaptation to new solutions
# Lower rho = slower evaporation = stronger memory of past solutions
# Typical range: 0.01 - 0.3
rho = 0.1

# Whether to show real-time visualization during execution
# Set to True to see the algorithm progress (slower but educational)
show_figure = False

# Maximum runtime in minutes
# The algorithm will stop after this time even if not converged
runtime_in_minutes = 5


def solve_with_aco(input_path, logger=None):
    """
    Solve a VRPTW instance using Ant Colony Optimization (ACO) algorithm.

    ACO Algorithm Flow:
    1. Initialize pheromone trails (using a heuristic like nearest neighbor)
    2. For each iteration:
       a. Each ant constructs a solution:
          - Starts at depot
          - Probabilistically selects next customer based on:
            * Pheromone intensity on edge (memory of good paths)
            * Heuristic information (distance, time window urgency)
          - Respects constraints (capacity, time windows)
          - Returns to depot when needed
       b. Apply local search to improve solutions
       c. Update pheromone trails:
          - Evaporate existing pheromone (multiply by (1-rho))
          - Deposit new pheromone on best solutions
    3. Return best solution found

    The Multiple Ant Colony System (MACS) runs two colonies in parallel:
    - ACS-Time: Minimizes distance with fixed vehicle count
    - ACS-Vehicle: Tries to use fewer vehicles

    Parameters
    ----------
    input_path : str
        Path to the problem instance file in Solomon format (.txt file).
        The file should contain customer coordinates, demands, time windows, etc.

    Returns
    -------
    tuple
        A tuple containing:
        - routes (list): List of routes, where each route is a list of customer IDs.
                        Example: [[1, 2, 3], [4, 5, 6]] means two routes.
        - cost (float): Total travel distance/cost of the solution.

    Example
    -------
    >>> routes, cost = solve_with_aco("dataset/r101.txt")
    >>> print(f"ACO found {len(routes)} routes with cost {cost}")

    Notes
    -----
    - ACO is good at exploring the solution space
    - It can find diverse solutions
    - Parameter tuning significantly affects performance
    - Runtime can be longer than other algorithms
    - The multi-colony approach helps balance objectives
    """
    # ========================================================================
    # CREATE PROBLEM GRAPH
    # ========================================================================
    # Build the VRPTW graph structure
    # This includes:
    # - Node information (customers, depot, coordinates, demands, time windows)
    # - Distance matrix (Euclidean distances between all pairs)
    # - Pheromone matrix (initialized with heuristic values)
    # - Heuristic information matrix (inverse of distances)
    # rho: Pheromone evaporation rate (passed to graph for local updates)
    graph = VrptwGraph(input_path, rho)
    
    # ========================================================================
    # CREATE MULTIPLE ANT COLONY SYSTEM
    # ========================================================================
    # Initialize the MACS algorithm
    # This creates the multi-colony system that will run in parallel
    macs = MultipleAntColonySystem(
        graph,                          # Problem graph with pheromone trails
        ants_num=ants_num,              # Number of ants per colony
        beta=beta,                      # Heuristic importance parameter
        q0=q0,                          # Exploitation probability
        whether_or_not_to_show_figure=show_figure,  # Visualization flag
        runtime_in_minutes=runtime_in_minutes,      # Time limit
    )
    
    # ========================================================================
    # RUN THE ALGORITHM
    # ========================================================================
    # Execute the Multiple Ant Colony System
    # This will:
    # 1. Run ACS-Time and ACS-Vehicle colonies in parallel
    # 2. Each colony explores different aspects of the solution space
    # 3. Share best solutions between colonies
    # 4. Continue until time limit or convergence
    macs.run_multiple_ant_colony_system(logger=logger)
    
    # ========================================================================
    # EXTRACT AND DISPLAY RESULTS
    # ========================================================================
    # Get the best solution found (lowest cost)
    # best_path_distance.value: Total distance of best solution
    print("ACO cost:", macs.best_path_distance.value)
    
    # Convert the path (list of nodes with depot markers) to routes
    # The path format: [0, 1, 2, 3, 0, 4, 5, 0] where 0 = depot
    # This represents: depot -> customers 1,2,3 -> depot -> customers 4,5 -> depot
    routes = get_best_route_from_path(macs.best_path)
    
    print("ACO solution:")
    # Display each route with its customer sequence
    for i, route in enumerate(routes, start=1):
        # Convert customer IDs to string and join with spaces
        # Example: "Route #1: 1 2 3 4 5"
        print(f"Route #{i}: {' '.join(str(node) for node in route)}")
    print()

    # Return routes and cost (rounded to 1 decimal place)
    return routes, round(macs.best_path_distance.value, 1)


def get_best_route_from_path(best_path):
    """
    Convert a path representation to a list of routes.
    
    The path format uses depot (node 0) as a separator:
    Example: [0, 1, 2, 3, 0, 4, 5, 0] represents:
    - Route 1: customers 1, 2, 3 (between first and second depot)
    - Route 2: customers 4, 5 (between second and third depot)
    
    Parameters
    ----------
    best_path : list
        List of node IDs where 0 represents the depot.
        Format: [0, customer1, customer2, ..., 0, customer3, ..., 0]
    
    Returns
    -------
    list
        List of routes, where each route is a list of customer IDs.
        Example: [[1, 2, 3], [4, 5]]
    
    Example
    -------
    >>> path = [0, 1, 2, 3, 0, 4, 5, 0]
    >>> routes = get_best_route_from_path(path)
    >>> print(routes)  # [[1, 2, 3], [4, 5]]
    """
    # Handle empty path
    if not best_path:
        return []
    
    routes = []      # List to store all routes
    route = []       # Current route being built
    
    # Iterate through the path
    for node in best_path:
        if node != 0:
            # Not a depot, add customer to current route
            route.append(node)
        else:
            # Depot encountered: end of current route
            if route:
                # If route has customers, save it and start new route
                routes.append(route)
                route = []
    
    # Return the list of routes (depot markers removed)
    return routes
