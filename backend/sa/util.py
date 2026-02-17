"""
Utility Functions for Simulated Annealing

This module provides helper functions used by the SA algorithm,
primarily for distance calculations.

Author: Arnob Mahmud
"""

from math import sqrt


def distance(object1, object2):
    """
    Calculate Euclidean distance between two objects with x and y coordinates.
    
    This function computes the straight-line distance between two points
    in 2D space using the Euclidean distance formula:
    distance = sqrt((x2 - x1)² + (y2 - y1)²)
    
    In VRPTW context, this represents the travel distance between:
    - Two customers
    - A customer and the depot
    - Any two locations in the problem
    
    Parameters
    ----------
    object1 : object
        First object with attributes:
        - x (float): X-coordinate
        - y (float): Y-coordinate
        Typically a Customer or Vehicle object.
    
    object2 : object
        Second object with attributes:
        - x (float): X-coordinate
        - y (float): Y-coordinate
        Typically a Customer or Vehicle object.
    
    Returns
    -------
    float
        Euclidean distance between the two objects.
        This represents the travel distance (and time, assuming unit speed).
    
    Example
    -------
    >>> customer1 = Customer(1, 10.0, 20.0, ...)
    >>> customer2 = Customer(2, 15.0, 25.0, ...)
    >>> dist = distance(customer1, customer2)
    >>> print(f"Distance: {dist:.2f}")  # Distance: 7.07
    
    Notes
    -----
    - This assumes Euclidean (straight-line) distance
    - In real-world applications, you might use road network distances
    - The distance is also used as travel time (assuming unit speed)
    - This is a key component in calculating solution cost
    """
    # Calculate differences in x and y coordinates
    diff_x = object1.x - object2.x
    diff_y = object1.y - object2.y
    
    # Euclidean distance formula: sqrt((Δx)² + (Δy)²)
    # This gives the straight-line distance between two points
    return sqrt(diff_x * diff_x + diff_y * diff_y)

