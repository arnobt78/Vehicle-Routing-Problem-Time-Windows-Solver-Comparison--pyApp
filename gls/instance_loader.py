"""
Instance Loader for Guided Local Search (GLS)

This module loads VRPTW problem instances from Solomon benchmark format
and converts them to the format required by OR-Tools (Google's optimization library).

Solomon format files contain:
- Header information (vehicle count, capacity)
- Customer data (coordinates, demand, time windows, service time)

The loader processes this data and creates:
- Time matrix (travel + service times between all pairs)
- Time windows (adjusted for service times)
- Demand list
- Vehicle capacity information

Author: Arnob Mahmud
"""

import math
import re

import pandas as pd

from gls.data_model import ProblemInstance


def load_instance(problem_path: str, time_precision_scaler: int) -> ProblemInstance:
    """
    Load a VRPTW instance from Solomon benchmark format and convert for OR-Tools.

    This function reads a Solomon format file (.txt) and processes it into
    a format suitable for OR-Tools optimization. Key transformations:
    1. Converts floating-point times to integers (OR-Tools requirement)
    2. Builds time matrix (travel time + service time between all pairs)
    3. Adjusts time windows to account for service times
    4. Extracts vehicle and capacity information

    Parameters
    ----------
    problem_path : str
        Path to the Solomon format problem file (.txt).
        Format: First 8 lines are header, then customer data with columns:
        customer_id x_coord y_coord demand ready_time due_time service_time
    
    time_precision_scaler : int
        Scaling factor to convert floating-point times to integers.
        Example: scaler=10 means 0.1 time units become 1 integer unit.
        Higher values = more precision but slower computation.
        Typical values: 10 (1 decimal) to 100 (2 decimals).

    Returns
    -------
    ProblemInstance
        Dictionary-like object containing:
        - depot: Depot index (always 0)
        - num_vehicles: Number of available vehicles
        - vehicle_capacities: List of capacities (same for all vehicles)
        - demands: List of customer demands
        - time_matrix: 2D list of travel+service times between all pairs
        - time_windows: List of (start, end) tuples for each customer
        - service_times: List of service times for each customer
        - xcord, ycord: Lists of x and y coordinates

    Example
    -------
    >>> data = load_instance("dataset/r101.txt", time_precision_scaler=10)
    >>> print(f"Loaded {data['num_vehicles']} vehicles with capacity {data['vehicle_capacities'][0]}")

    Notes
    -----
    - OR-Tools requires integer values, hence the precision scaler
    - Time matrix includes both travel time and service time at destination
    - Time windows are adjusted to account for service time
    - All vehicles have the same capacity in Solomon instances
    """
    # ========================================================================
    # INITIALIZE DATA STRUCTURE
    # ========================================================================
    data = {}
    data["depot"] = 0  # Depot is always at index 0 in Solomon format
    # ========================================================================
    # READ CUSTOMER DATA FROM FILE
    # ========================================================================
    # Read the Solomon format file
    # skiprows=8: Skip header lines (Solomon format has 8 header lines)
    # sep="\s+": Whitespace-separated values
    # The file contains: customer_id x y demand ready_time due_time service_time
    df = pd.read_csv(
        problem_path,
        sep="\s+",
        skiprows=8,
        names=[
            "customer",      # Customer ID (0 = depot, 1+ = customers)
            "xcord",         # X-coordinate
            "ycord",         # Y-coordinate
            "demand",        # Customer demand (load to be delivered)
            "ready_time",    # Earliest service start time (time window start)
            "due_date",      # Latest service start time (time window end)
            "service_time",  # Time required to serve the customer
        ],
    )
    
    # ========================================================================
    # CONVERT TIMES TO INTEGERS (OR-Tools requirement)
    # ========================================================================
    # OR-Tools works with integers, so we scale floating-point times
    # Multiply by precision scaler and convert to int
    # Example: 0.5 * 10 = 5 (represents 0.5 time units)
    df["service_time"] = df["service_time"] * time_precision_scaler
    df["ready_time"] = df["ready_time"] * time_precision_scaler
    df["due_date"] = df["due_date"] * time_precision_scaler

    # Store service times for later use
    data["service_times"] = list(df.service_time)

    # ========================================================================
    # BUILD TIME MATRIX
    # ========================================================================
    # Time matrix: travel time + service time from location i to location j
    # This is a key component - OR-Tools uses this to calculate route costs
    # 
    # For each pair (i, j):
    #   time[i][j] = travel_time(i->j) + service_time(j)
    # 
    # Travel time is Euclidean distance (straight-line distance)
    # We add service time at destination because service happens after arrival
    travel_times = df[["xcord", "ycord", "service_time"]].to_dict()
    time_matrix = []
    
    # Build time matrix row by row
    for i in df.customer:
        time_vector = []
        for j in df.customer:
            if i == j:
                # Same location: no travel time needed
                time_vector.append(0)
            else:
                # Calculate Euclidean distance (travel time, assuming unit speed)
                # math.hypot calculates sqrt((x2-x1)² + (y2-y1)²)
                time = int(
                    time_precision_scaler
                    * math.hypot(
                        (travel_times["xcord"][i] - travel_times["xcord"][j]),
                        (travel_times["ycord"][i] - travel_times["ycord"][j]),
                    )
                )
                # Add service time at destination
                # Total time = travel time + service time at j
                time += travel_times["service_time"][j]
                time_vector.append(time)
        time_matrix.append(time_vector)
    data["time_matrix"] = time_matrix

    # ========================================================================
    # READ VEHICLE INFORMATION FROM HEADER
    # ========================================================================
    # Solomon format: Line 4 (0-indexed) contains vehicle count and capacity
    # Format: "VEHICLE_NUMBER CAPACITY"
    with open(problem_path) as f:
        lines = f.readlines()
    
    # Extract vehicle number and capacity from line 4
    # re.findall finds all numbers in the line
    # [0] = vehicle count, [1] = capacity
    data["num_vehicles"] = int(re.findall("[0-9]+", lines[4])[0])
    data["vehicle_capacities"] = [int(re.findall("[0-9]+", lines[4])[1])] * data[
        "num_vehicles"
    ]
    
    # Store customer demands
    data["demands"] = list(df.demand)

    # ========================================================================
    # BUILD TIME WINDOWS
    # ========================================================================
    # Time windows define when service can start at each customer
    # We adjust them to account for service time
    # 
    # Original window: [ready_time, due_time] (when service can START)
    # Adjusted window: [ready_time + service_time, due_time + service_time]
    #                  (when service will FINISH)
    # 
    # This adjustment ensures the time window constraint is properly handled
    windows = df[["ready_time", "due_date", "service_time"]].to_dict()
    time_windows = []
    for i in df.customer:
        time_windows.append(
            (
                windows["ready_time"][i] + windows["service_time"][i],  # Adjusted start
                windows["due_date"][i] + windows["service_time"][i],    # Adjusted end
            )
        )
    data["time_windows"] = time_windows

    # ========================================================================
    # STORE COORDINATES
    # ========================================================================
    # Store coordinates for visualization and distance calculations
    data["xcord"] = list(df.xcord)
    data["ycord"] = list(df.ycord)

    # Return the complete problem instance data
    return data
