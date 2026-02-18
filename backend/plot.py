"""
Visualization Module for VRPTW Solutions

This module provides functions to visualize vehicle routing solutions.
It creates 2D plots showing:
- Depot location (red star)
- Customer locations (colored dots)
- Vehicle routes (colored lines connecting customers)
- Route connections to/from depot (dashed grey lines)

Visualizations help understand:
- Route structure and efficiency
- Geographic distribution of customers
- How different algorithms organize routes
- Solution quality at a glance

Author: Arnob Mahmud
"""

from typing import Any, Optional

from matplotlib.axes import Axes
import matplotlib.pyplot as plt
import numpy as np

from pyvrp import ProblemData


def plot_my_solution(
    solution: Any,
    data: ProblemData,
    ax: Optional[Axes] = None,
    dataset: str = "c101",
    algo: str = "HGS",
):
    """
    Visualize a VRPTW solution by plotting routes on a 2D coordinate plane.

    This function creates a graphical representation of vehicle routes showing:
    - Depot location (marked with a red star)
    - Customer locations (marked with colored dots, one color per route)
    - Route paths (colored lines connecting customers in sequence)
    - Connections to/from depot (dashed grey lines)

    Parameters
    ----------
    solution : dict
        Solution dictionary containing:
        - "routes": List of routes, where each route is a list of customer IDs
                   Example: [[1, 2, 3], [4, 5, 6]] means two routes
        - "cost": Total travel distance/cost of the solution (used in title)
    
    data : ProblemData
        Problem instance data from pyVRP containing:
        - Customer coordinates (x, y)
        - Depot location
        - Problem metadata
    
    ax : Optional[plt.Axes], default=None
        Matplotlib axes object to draw on. If None, a new figure and axes are created.
        This allows plotting multiple solutions on the same figure or customizing the plot.
    
    dataset : str, default="c101"
        Dataset name (e.g., "r101", "c101", "rc101") used in the plot title.
        Helps identify which problem instance is being visualized.
    
    algo : str, default="HGS"
        Algorithm name (e.g., "HGS", "GLS", "ACO", "SA") used in the plot title.
        Helps identify which algorithm generated this solution.

    Returns
    -------
    None
        The function modifies the provided axes object (or creates a new one) but doesn't return anything.
        Use plt.show() or plt.savefig() after calling this function to display or save the plot.

    Example
    -------
    >>> from pyvrp import read
    >>> import matplotlib.pyplot as plt
    >>> 
    >>> # Load problem instance
    >>> instance = read("dataset/r101.txt", instance_format="solomon")
    >>> 
    >>> # Your solution
    >>> solution = {
    ...     "routes": [[1, 2, 3], [4, 5, 6]],
    ...     "cost": 1234.5
    ... }
    >>> 
    >>> # Create plot
    >>> fig, ax = plt.subplots(figsize=(10, 10))
    >>> plot_my_solution(solution, instance, ax=ax, dataset="r101", algo="HGS")
    >>> plt.savefig("solution.png")
    >>> plt.show()

    Notes
    -----
    - Each route is assigned a different color automatically by matplotlib
    - The depot is always shown as a red star at coordinates (x[0], y[0])
    - Routes are drawn as lines connecting customers in the order they appear in the route list
    - Dashed grey lines show the connection from depot to first customer and from last customer back to depot
    - The plot uses equal aspect ratio to preserve geographic relationships
    """
    # Create a new figure and axes if none provided
    # This allows the function to work standalone or as part of a larger plot
    if not ax:
        _, ax = plt.subplots()

    # ========================================================================
    # EXTRACT COORDINATES
    # ========================================================================
    # Get total number of locations (depot + customers)
    # data.num_clients gives number of customers, +1 for depot
    dim = data.num_clients + 1
    
    # Extract x and y coordinates for all locations (depot + customers)
    # pyvrp 0.13+ uses data.location(i); older pyvrp used data.client(i)
    loc_getter = getattr(data, "location", None) or getattr(data, "client")
    x_coords = np.array([loc_getter(i).x for i in range(dim)])
    y_coords = np.array([loc_getter(i).y for i in range(dim)])

    # ========================================================================
    # PLOT DEPOT
    # ========================================================================
    # The depot is location 0, marked with a red star
    # zorder=3 ensures it appears on top of other elements
    # s=500 makes it larger and more visible
    ax.scatter(x_coords[0], y_coords[0], label="Depot", c="tab:red", marker="*", zorder=3, s=500)

    # ========================================================================
    # PLOT ROUTES
    # ========================================================================
    # Normalize to list of list of int (pyvrp 0.13 may return different types)
    routes_raw = solution.get("routes") or []
    routes_list = []
    for r in routes_raw:
        try:
            route = [int(v) for v in r]
        except (TypeError, ValueError):
            route = []
        if route:
            routes_list.append(route)

    for idx, route in enumerate(routes_list, 1):
        # Get coordinates for customers in this route
        # route is a list of customer IDs, e.g., [1, 2, 3] (1-based; 0 = depot)
        # x_coords[route] uses NumPy fancy indexing to get x-coordinates for these customers
        x = x_coords[route]
        y = y_coords[route]

        # Plot customers as colored dots
        # Each route gets a different color automatically
        # zorder=3 ensures customers appear above grid lines
        # s=75 sets the size of the dots
        ax.scatter(x, y, label=f"Route {idx}", zorder=3, s=75)
        
        # Draw the route path (line connecting customers in sequence)
        # This shows the order in which customers are visited
        ax.plot(x, y)

        # ====================================================================
        # DRAW CONNECTIONS TO/FROM DEPOT
        # ====================================================================
        # Draw dashed line from depot to first customer in route
        # ls=(0, (5, 15)) creates a dashed pattern: 5 units on, 15 units off
        # linewidth=0.25 makes it thin and subtle
        # color="grey" makes it less prominent than the main route
        # Line from depot (x_coords[0], y_coords[0]) to first customer (x[0], y[0])
        ax.plot([x_coords[0], x[0]], [y_coords[0], y[0]], ls=(0, (5, 15)), linewidth=0.25, color="grey")
        # Line from last customer (x[-1], y[-1]) back to depot
        # This completes the route cycle: depot -> customers -> depot
        ax.plot([x[-1], x_coords[0]], [y[-1], y_coords[0]], ls=(0, (5, 15)), linewidth=0.25, color="grey")

    if not routes_list:
        ax.text(0.5, 0.5, "No routes to display", transform=ax.transAxes,
                ha="center", va="center", fontsize=14, color="gray")

    # ========================================================================
    # FORMATTING
    # ========================================================================
    # Add grid for easier reading of coordinates
    ax.grid(color="grey", linestyle="solid", linewidth=0.2)

    # Set title with dataset, algorithm, and solution cost
    # This provides context: which problem, which algorithm, how good is the solution
    ax.set_title(f"Solution - {dataset} - {algo} - {solution['cost']:.1f}")
    
    # Set equal aspect ratio to preserve geographic relationships
    # Without this, the plot might be distorted (e.g., circles appear as ellipses)
    ax.set_aspect("equal", "datalim")
    
    # Add legend showing depot and route colors
    # frameon=False removes the legend box border for cleaner look
    # ncol=2 arranges legend items in 2 columns to save space
    ax.legend(frameon=False, ncol=2)
