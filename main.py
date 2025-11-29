"""
Main execution script for VRPTW Solver Comparison

This script orchestrates the execution of all four metaheuristic algorithms
(HGS, GLS, ACO, SA) on a VRPTW dataset and compares their results against
the Best-Known Solution (BKS). It also generates visualizations and a
comparison table.

Author: Arnob Mahmud
"""

import time
from matplotlib import pyplot as plt
from tabulate import tabulate
from aco.solve import solve_with_aco
from bks import bks_solution
from hgs.solve import solve_with_hgs
from gls.solve import solve_with_gls
from plot import plot_my_solution
from sa.solve import solve_using_sa
from pyvrp import read

# ============================================================================
# CONFIGURATION: Dataset and Runtime Settings
# ============================================================================
# Change these parameters to test different datasets or adjust runtime limits
dataset = "r211"  # Dataset name (e.g., "r101", "c101", "rc101")
INPUT_PATH = f"data/{dataset}.txt"  # Path to problem instance file (Solomon format)
BKS_PATH = f"data/{dataset}.sol"  # Path to Best-Known Solution file
RUNTIME = 120  # Maximum runtime in seconds for algorithms that support time limits

# ============================================================================
# LOAD PROBLEM INSTANCE
# ============================================================================
# Read the VRPTW instance from Solomon format file
# instance_format="solomon": Specifies the file format (Solomon benchmark format)
# round_func="trunc1": Rounding function for distances (truncate to 1 decimal)
INSTANCE = read(INPUT_PATH, instance_format="solomon", round_func="trunc1")

# ============================================================================
# INITIALIZE RESULTS DICTIONARY
# ============================================================================
# Dictionary to store results from all algorithms and BKS
# Each algorithm will have: routes (list of customer sequences), cost (total distance), runtime (seconds)
result = {
    "bks": {},  # Best-Known Solution (optimal or best-known solution)
    "hgs": {},  # Hybrid Genetic Search results
    "gls": {},  # Guided Local Search results
    "aco": {},  # Ant Colony Optimization results
    "sa": {},   # Simulated Annealing results
}

print("Running Algorithms on dataset:", dataset)

# ============================================================================
# LOAD BEST-KNOWN SOLUTION (BKS)
# ============================================================================
# BKS serves as the benchmark for comparison
# It represents the optimal or best-known solution for this instance
result["bks"]["routes"], result["bks"]["cost"] = bks_solution(BKS_PATH)

# ============================================================================
# RUN HYBRID GENETIC SEARCH (HGS)
# ============================================================================
# HGS combines genetic algorithm operators (crossover, mutation) with local search
# It's one of the state-of-the-art algorithms for VRPTW
# Uses pyVRP library internally
print("\n[1/4] Running Hybrid Genetic Search (HGS)...")
start = time.time()
result["hgs"]["routes"], result["hgs"]["cost"] = solve_with_hgs(INPUT_PATH, RUNTIME)
result["hgs"]["runtime"] = time.time() - start
print(f"HGS completed in {result['hgs']['runtime']:.2f} seconds")

# ============================================================================
# RUN GUIDED LOCAL SEARCH (GLS)
# ============================================================================
# GLS enhances local search by penalizing features that appear in local optima
# This helps escape from local minima and explore better solutions
# Uses Google OR-Tools with Guided Local Search metaheuristic
print("\n[2/4] Running Guided Local Search (GLS)...")
start = time.time()
result["gls"]["routes"], result["gls"]["cost"] = solve_with_gls(INPUT_PATH, RUNTIME)
result["gls"]["runtime"] = time.time() - start
print(f"GLS completed in {result['gls']['runtime']:.2f} seconds")

# ============================================================================
# RUN ANT COLONY OPTIMIZATION (ACO)
# ============================================================================
# ACO simulates ant foraging behavior using pheromone trails
# Ants probabilistically construct solutions based on pheromone intensity and heuristic information
# Multiple colonies explore different aspects (minimize vehicles vs. minimize distance)
print("\n[3/4] Running Ant Colony Optimization (ACO)...")
start = time.time()
result["aco"]["routes"], result["aco"]["cost"] = solve_with_aco(INPUT_PATH)
result["aco"]["runtime"] = time.time() - start
print(f"ACO completed in {result['aco']['runtime']:.2f} seconds")

# ============================================================================
# RUN SIMULATED ANNEALING (SA)
# ============================================================================
# SA accepts worse solutions with decreasing probability (controlled by temperature)
# This allows exploration of the solution space and escape from local optima
# Temperature decreases over time (cooling schedule)
print("\n[4/4] Running Simulated Annealing (SA)...")
start = time.time()
result["sa"]["routes"], result["sa"]["cost"] = solve_using_sa(INPUT_PATH)
result["sa"]["runtime"] = time.time() - start
print(f"SA completed in {result['sa']['runtime']:.2f} seconds")

# ============================================================================
# GENERATE VISUALIZATIONS
# ============================================================================
# Create route visualizations for each algorithm
# Each plot shows: depot (red star), customers (colored dots), routes (colored lines)
print("\n" + "="*60)
print("Generating visualizations...")
print("="*60)

# Plot HGS solution
_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["hgs"], INSTANCE, ax=ax, dataset=dataset, algo="HGS")
plt.savefig(f"{dataset}_HGS.png", dpi=150, bbox_inches='tight')
print(f"Saved: {dataset}_HGS.png")

# Plot GLS solution
_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["gls"], INSTANCE, ax=ax, dataset=dataset, algo="GLS")
plt.savefig(f"{dataset}_GLS.png", dpi=150, bbox_inches='tight')
print(f"Saved: {dataset}_GLS.png")

# Plot ACO solution
_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["aco"], INSTANCE, ax=ax, dataset=dataset, algo="ACO")
plt.savefig(f"{dataset}_ACO.png", dpi=150, bbox_inches='tight')
print(f"Saved: {dataset}_ACO.png")

# Plot SA solution
_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["sa"], INSTANCE, ax=ax, dataset=dataset, algo="SA")
plt.savefig(f"{dataset}_SA.png", dpi=150, bbox_inches='tight')
print(f"Saved: {dataset}_SA.png")

# ============================================================================
# CALCULATE PERFORMANCE METRICS AND CREATE COMPARISON TABLE
# ============================================================================
# Gap calculation: percentage difference from BKS
# Formula: ((algorithm_cost - bks_cost) / bks_cost) * 100
# Lower gap = better performance (closer to optimal)
gap = lambda bks_cost, algo_cost: round(100 * (algo_cost - bks_cost) / bks_cost, 2)

# Table headers for comparison
header = ["Algorithms", "No. of Routes", "Costs", "Gap(%)", "Runtime(seconds)"]

# Build comparison rows
# Each row contains: algorithm name, number of vehicles used, total cost, gap from BKS, runtime
rows = [
    # BKS row (baseline - no gap or runtime since it's the reference)
    ["BKS", len(result["bks"]["routes"]), result["bks"]["cost"], "-", "-"],
    # HGS row
    [
        "HGS",
        len(result["hgs"]["routes"]),  # Number of vehicles used
        result["hgs"]["cost"],          # Total travel distance/cost
        gap(result["bks"]["cost"], result["hgs"]["cost"]),  # Gap from BKS (%)
        round(result["hgs"]["runtime"], 2),  # Execution time (seconds)
    ],
    # GLS row
    [
        "GLS",
        len(result["gls"]["routes"]),
        result["gls"]["cost"],
        gap(result["bks"]["cost"], result["gls"]["cost"]),
        round(result["gls"]["runtime"], 2),
    ],
    # ACO row
    [
        "ACO",
        len(result["aco"]["routes"]),
        result["aco"]["cost"],
        gap(result["bks"]["cost"], result["aco"]["cost"]),
        round(result["aco"]["runtime"], 2),
    ],
    # SA row
    [
        "SA",
        len(result["sa"]["routes"]),
        result["sa"]["cost"],
        gap(result["bks"]["cost"], result["sa"]["cost"]),
        round(result["sa"]["runtime"], 2),
    ],
]

# ============================================================================
# DISPLAY RESULTS
# ============================================================================
print("\n" + "="*60)
print("Algorithm results on dataset:", dataset)
print("="*60)
# Generate HTML table for easy viewing (can be saved to file or displayed)
# tablefmt="html" creates an HTML table that can be viewed in browsers or notebooks
table_html = tabulate(rows, header, tablefmt="html")
print(table_html)
print("\n" + "="*60)
print("Comparison Summary:")
print("="*60)
print(f"Best solution cost: {min([result['hgs']['cost'], result['gls']['cost'], result['aco']['cost'], result['sa']['cost']])}")
print(f"Fastest algorithm: {min(['HGS', 'GLS', 'ACO', 'SA'], key=lambda x: result[x.lower()]['runtime'])}")
print("="*60)