"""
Simulated Annealing (SA) Solver Interface

Simulated Annealing is a probabilistic optimization technique inspired by
the annealing process in metallurgy. It works by:
- Starting with an initial solution
- Generating neighbor solutions (small modifications)
- Accepting better solutions always
- Accepting worse solutions with probability that decreases over time (temperature)
- Gradually "cooling down" (reducing temperature) to focus on exploitation

This allows the algorithm to escape local optima early and converge to
good solutions later.

Author: Arnob Mahmud
"""

from sa.instance_loader import load_from_file
from sa.simulated_annealing import sa_algorithm

# ============================================================================
# SA PARAMETERS
# ============================================================================
# Initial temperature: Controls how likely we are to accept worse solutions
# Higher temperature = more exploration (accept more worse solutions)
# Lower temperature = more exploitation (accept fewer worse solutions)
# Rule of thumb: Should allow ~50% acceptance of worse solutions initially
INIT_TEMP = 700

# Temperature update function: How temperature decreases over time
# This is the "cooling schedule"
# lambda t: 0.9999 * t means temperature decreases by 0.01% each iteration
# Slower cooling (0.9999) = more thorough search but slower convergence
# Faster cooling (0.99) = quicker convergence but may miss global optimum
UPDATE_TEMP = lambda t: 0.9999 * t

# Stopping criterion: When to stop the algorithm
# lambda t: t <= 0.01 means stop when temperature drops below 0.01
# Lower threshold = more thorough search but longer runtime
STOP_CRITERIA = lambda t: t <= 0.01


def solve_using_sa(input_path, logger=None):
    """
    Solve a VRPTW instance using Simulated Annealing (SA) algorithm.

    SA Algorithm Flow:
    1. Start with an initial solution (found using a heuristic)
    2. Set initial temperature (high, for exploration)
    3. Repeat until stopping criterion:
       a. Generate a neighbor solution (small random modification)
       b. Calculate change in objective value (delta)
       c. If better: accept it
       d. If worse: accept with probability exp(-delta/temperature)
       e. Update temperature (cool down)
    4. Return best solution found

    The probability of accepting worse solutions decreases as temperature
    decreases, allowing the algorithm to explore early and exploit later.

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
    >>> routes, cost = solve_using_sa("dataset/r101.txt")
    >>> print(f"SA found {len(routes)} routes with cost {cost}")

    Notes
    -----
    - SA is good at balancing exploration and exploitation
    - It can find good solutions relatively quickly
    - The cooling schedule significantly affects performance
    - Results may vary between runs (stochastic algorithm)
    - The algorithm returns the best solution found during the search
    """
    # ========================================================================
    # LOAD PROBLEM INSTANCE
    # ========================================================================
    # Load the VRPTW instance from file
    # This creates an Instance object with Customer and Vehicle objects
    instance = load_from_file(input_path)
    
    # ========================================================================
    # FIND INITIAL SOLUTION
    # ========================================================================
    # SA needs a starting solution
    # find_initial_solution() uses a greedy heuristic to create a feasible solution
    # The heuristic typically:
    # - Sorts customers by ready time or distance
    # - Assigns customers to vehicles greedily
    # - Ensures all constraints are satisfied (capacity, time windows)
    instance.find_initial_solution()

    # ========================================================================
    # RUN SIMULATED ANNEALING
    # ========================================================================
    # Execute the SA algorithm with specified parameters
    # INIT_TEMP: Starting temperature (high for exploration)
    # UPDATE_TEMP: Cooling schedule (how temperature decreases)
    # STOP_CRITERIA: When to stop (temperature threshold)
    # 
    # Returns a list of tuples: [(solution_after_1min, iterations), 
    #                            (solution_after_5min, iterations),
    #                            (final_solution, iterations)]
    results = sa_algorithm(
        instance,
        INIT_TEMP,
        UPDATE_TEMP,
        STOP_CRITERIA,
        logger=logger,
    )

    # ========================================================================
    # EXTRACT FINAL SOLUTION
    # ========================================================================
    # results[2] contains the final solution (after full algorithm run)
    # results[2][0] is the solution object
    # results[2][1] is the number of iterations performed
    # 
    # Get routes and cost from the final solution
    routes = results[2][0].get_solution()
    cost = results[2][0].get_total_distance()

    # ========================================================================
    # DISPLAY RESULTS
    # ========================================================================
    print(f"SA cost: {cost}")
    print("SA solution:")
    
    # Display each route with its customer sequence
    for i, route in enumerate(routes, start=1):
        # Convert customer IDs to string and join with spaces
        # Example: "Route #1: 1 2 3 4 5"
        print(f"Route #{i}: {' '.join(str(node) for node in route)}")

    # Return routes and cost (rounded to 1 decimal place)
    return routes, round(cost, 1)
