"""
Best-Known Solution (BKS) Processor

This module handles loading and processing of Best-Known Solutions (BKS) for VRPTW instances.
BKS represents the optimal or best-known solution found for a particular problem instance.
It serves as a benchmark for comparing algorithm performance.

The BKS files are typically in .sol format and contain:
- routes: List of routes, where each route is a list of customer IDs
- cost: Total travel distance/cost of the solution

Author: Arnob Mahmud
"""

from vrplib import read_solution


def bks_solution(bks_path):
    """
    Load and process the Best-Known Solution (BKS) from a .sol file.
    
    BKS is used as a reference point to evaluate algorithm performance.
    The gap between an algorithm's solution and BKS indicates how close
    the algorithm gets to the optimal solution.
    
    Parameters
    ----------
    bks_path : str
        Path to the .sol file containing the Best-Known Solution.
        The file should be in VRPLIB format (standard format for VRP solutions).
    
    Returns
    -------
    tuple
        A tuple containing:
        - BKS_ROUTES (list): List of routes, where each route is a list of customer IDs.
                            Routes represent the sequence of customers visited by each vehicle.
        - BKS_COST (float): Total travel distance/cost of the BKS solution.
    
    Example
    -------
    >>> routes, cost = bks_solution("dataset/r101.sol")
    >>> print(f"BKS has {len(routes)} routes with cost {cost}")
    
    Notes
    -----
    - BKS files are typically provided with benchmark datasets (e.g., Solomon instances)
    - If BKS is not available, you can use a very good solution as a reference
    - The gap percentage is calculated as: ((algorithm_cost - bks_cost) / bks_cost) * 100
    """
    # Read the solution file using vrplib library
    # This library handles parsing of standard VRP solution formats
    BKS = read_solution(bks_path)
    
    # Extract routes and cost from the solution dictionary
    # routes: List of lists, where each inner list represents one vehicle's route
    #         Each route contains customer IDs in the order they are visited
    BKS_ROUTES = BKS["routes"]
    
    # cost: Total distance traveled by all vehicles in the solution
    #       This is the objective value we want to minimize
    BKS_COST = BKS["cost"]
    
    # Display BKS information for user reference
    print("BKS cost:", BKS_COST)
    print("BKS solution:")
    
    # Print each route with its customer sequence
    # enumerate with start=1 makes route numbers start from 1 (more intuitive)
    for i, route in enumerate(BKS_ROUTES, start=1):
        # Convert customer IDs to string and join with spaces for readability
        # Example output: "Route #1: 1 2 3 4 5"
        print(f"Route #{i}: {' '.join(str(node) for node in route)}")
    print()

    # Return routes and cost for use in comparison
    return BKS_ROUTES, BKS_COST
