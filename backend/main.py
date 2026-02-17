"""
Main execution script for VRPTW Solver Comparison

This script orchestrates the execution of five metaheuristic algorithms
(HGS, GLS, ACO, SA, ILS) on a VRPTW dataset and compares their results against
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

# ILS requires pyvrp>=0.13; HGS uses pyvrp 0.6.3
solve_with_ils = None
try:
    from ils.solve import solve_with_ils as _solve_with_ils
    solve_with_ils = _solve_with_ils
    HAS_ILS = True
except ImportError:
    HAS_ILS = False

from app.utils.instance_reader import read_solomon

# ============================================================================
# CONFIGURATION: Dataset and Runtime Settings
# ============================================================================
# Change these parameters to test different datasets or adjust runtime limits
dataset = "r211"  # Dataset name (e.g., "r101", "c101", "rc101")
INPUT_PATH = f"dataset/{dataset}.txt"  # Path to problem instance file (Solomon format)
BKS_PATH = f"dataset/{dataset}.sol"  # Path to Best-Known Solution file
RUNTIME = 120  # Maximum runtime in seconds for algorithms that support time limits

# ============================================================================
# LOAD PROBLEM INSTANCE
# ============================================================================
INSTANCE = read_solomon(INPUT_PATH)

# ============================================================================
# INITIALIZE RESULTS DICTIONARY
# ============================================================================
# Dictionary to store results from all algorithms and BKS
ALGOS = ["hgs", "gls", "aco", "sa"]
if HAS_ILS:
    ALGOS.append("ils")
result = {"bks": {}}
for a in ALGOS:
    result[a] = {}

print("Running Algorithms on dataset:", dataset)

# ============================================================================
# LOAD BEST-KNOWN SOLUTION (BKS)
# ============================================================================
# BKS serves as the benchmark for comparison
# It represents the optimal or best-known solution for this instance
result["bks"]["routes"], result["bks"]["cost"] = bks_solution(BKS_PATH)

# Algorithm runners: (algo_id, label, solver_fn, use_runtime)
ALGO_RUNNERS = [
    ("hgs", "Hybrid Genetic Search", lambda: solve_with_hgs(INPUT_PATH, RUNTIME), True),
    ("gls", "Guided Local Search", lambda: solve_with_gls(INPUT_PATH, RUNTIME), True),
    ("aco", "Ant Colony Optimization", lambda: solve_with_aco(INPUT_PATH), False),
    ("sa", "Simulated Annealing", lambda: solve_using_sa(INPUT_PATH), False),
]
if HAS_ILS and solve_with_ils is not None:
    _ils_fn = solve_with_ils
    ALGO_RUNNERS.append(("ils", "Iterated Local Search", lambda: _ils_fn(INPUT_PATH, RUNTIME), True))

for i, (aid, label, fn, _) in enumerate(ALGO_RUNNERS, 1):
    print(f"\n[{i}/{len(ALGO_RUNNERS)}] Running {label} ({aid.upper()})...")
    start = time.time()
    result[aid]["routes"], result[aid]["cost"] = fn()
    result[aid]["runtime"] = time.time() - start
    print(f"{aid.upper()} completed in {result[aid]['runtime']:.2f} seconds")

# ============================================================================
# GENERATE VISUALIZATIONS
# ============================================================================
# Create route visualizations for each algorithm
# Each plot shows: depot (red star), customers (colored dots), routes (colored lines)
print("\n" + "="*60)
print("Generating visualizations...")
print("="*60)

# Plot each algorithm's solution
for aid in ALGOS:
    _, ax = plt.subplots(figsize=(10, 10))
    plot_my_solution(result[aid], INSTANCE, ax=ax, dataset=dataset, algo=aid.upper())
    plt.savefig(f"{dataset}_{aid.upper()}.png", dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {dataset}_{aid.upper()}.png")

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
rows = [
    ["BKS", len(result["bks"]["routes"]), result["bks"]["cost"], "-", "-"],
]
for aid in ALGOS:
    rows.append([
        aid.upper(),
        len(result[aid]["routes"]),
        result[aid]["cost"],
        gap(result["bks"]["cost"], result[aid]["cost"]),
        round(result[aid]["runtime"], 2),
    ])

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
costs = [result[a]["cost"] for a in ALGOS]
runtimes = [(a, result[a]["runtime"]) for a in ALGOS]
print(f"Best solution cost: {min(costs)}")
print(f"Fastest algorithm: {min(runtimes, key=lambda x: x[1])[0].upper()}")
print("="*60)