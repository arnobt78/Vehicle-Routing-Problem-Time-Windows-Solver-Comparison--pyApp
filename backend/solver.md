# VRPTW Solver - Interactive Notebook

This is a markdown version of the `solver.ipynb` Jupyter notebook. This file will render perfectly on GitHub.

## Overview

This notebook runs all four metaheuristic algorithms (HGS, GLS, ACO, SA) on a VRPTW dataset and compares their results against the Best-Known Solution (BKS).

---

## Cell 1: Import Libraries and Setup

```python
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

dataset = "rc108"
INPUT_PATH = f"data/{dataset}.txt"
BKS_PATH = f"data/{dataset}.sol"
RUNTIME = 300  # seconds

INSTANCE = read(INPUT_PATH, instance_format="solomon", round_func="trunc1")
```

---

## Cell 2: Initialize Results Dictionary

```python
result = {
    "bks": {},
    "hgs": {},
    "gls": {},
    "aco": {},
    "sa": {},
}
print("Running Algorithms on dataset:", dataset)
```

---

## Cell 3: Load Best-Known Solution

```python
result["bks"]["routes"], result["bks"]["cost"] = bks_solution(BKS_PATH)
```

---

## Cell 4: Run Hybrid Genetic Search (HGS)

```python
start = time.time()
result["hgs"]["routes"], result["hgs"]["cost"] = solve_with_hgs(INPUT_PATH, RUNTIME)
result["hgs"]["runtime"] = time.time() - start
```

---

## Cell 5: Run Guided Local Search (GLS)

```python
start = time.time()
result["gls"]["routes"], result["gls"]["cost"] = solve_with_gls(INPUT_PATH, RUNTIME)
result["gls"]["runtime"] = time.time() - start
```

---

## Cell 6: Run Ant Colony Optimization (ACO)

```python
start = time.time()
result["aco"]["routes"], result["aco"]["cost"] = solve_with_aco(INPUT_PATH)
result["aco"]["runtime"] = time.time() - start
```

---

## Cell 7: Run Simulated Annealing (SA)

```python
start = time.time()
result["sa"]["routes"], result["sa"]["cost"] = solve_using_sa(INPUT_PATH)
result["sa"]["runtime"] = time.time() - start
```

---

## Cell 8: Generate Visualizations

```python
_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["hgs"], INSTANCE, ax=ax, dataset=dataset, algo="HGS")

_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["gls"], INSTANCE, ax=ax, dataset=dataset, algo="GLS")

_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["aco"], INSTANCE, ax=ax, dataset=dataset, algo="ACO")

_, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(result["sa"], INSTANCE, ax=ax, dataset=dataset, algo="SA")
```

---

## Cell 9: Calculate Results and Create Comparison Table

```python
gap = lambda bks_cost, algo_cost: round(100 * (algo_cost - bks_cost) / bks_cost, 2)
header = ["Algorithms", "No. of Routes", "Costs", "Gap(%)", "Runtime(seconds)"]
rows = [
    ["BKS", len(result["bks"]["routes"]), result["bks"]["cost"], "-", "-"],
    [
        "HGS",
        len(result["hgs"]["routes"]),
        result["hgs"]["cost"],
        gap(result["bks"]["cost"], result["hgs"]["cost"]),
        result["hgs"]["runtime"],
    ],
    [
        "GLS",
        len(result["gls"]["routes"]),
        result["gls"]["cost"],
        gap(result["bks"]["cost"], result["gls"]["cost"]),
        result["gls"]["runtime"],
    ],
    [
        "ACO",
        len(result["aco"]["routes"]),
        result["aco"]["cost"],
        gap(result["bks"]["cost"], result["aco"]["cost"]),
        result["aco"]["runtime"],
    ],
    [
        "SA",
        len(result["sa"]["routes"]),
        result["sa"]["cost"],
        gap(result["bks"]["cost"], result["sa"]["cost"]),
        result["sa"]["runtime"],
    ],
]
print("Algorithm results on dataset:", dataset)
tabulate(rows, header, tablefmt="html")
```

---

## Cell 10: Display Results

```python
result
```

---

## Usage

To run this notebook:

1. **Using Jupyter Notebook:**

   ```bash
   jupyter notebook solver.ipynb
   ```

2. **Using Python script:**

   ```bash
   python main.py
   ```

3. **Using VS Code:**
   - Open `solver.ipynb` in VS Code
   - Install the Jupyter extension if needed
   - Run cells interactively

---

## Expected Output

After running all cells, you should see:

- **BKS Solution**: Best-known solution routes and cost
- **HGS Solution**: Hybrid Genetic Search results
- **GLS Solution**: Guided Local Search results
- **ACO Solution**: Ant Colony Optimization results
- **SA Solution**: Simulated Annealing results
- **Visualizations**: Route plots for each algorithm
- **Comparison Table**: Side-by-side comparison of all algorithms

---

## Notes

- The `RUNTIME` variable controls how long each algorithm runs (default: 300 seconds)
- Change the `dataset` variable to test different Solomon instances
- Results are compared against the Best-Known Solution (BKS) to calculate the gap percentage
- Visualizations are automatically generated and displayed

---

## Related Files

- `main.py` - Main script version of this notebook
- `README.md` - Complete project documentation
- `solver.ipynb` - Original Jupyter notebook (interactive version)

---

**Note:** This markdown file is a readable version of the Jupyter notebook. For interactive execution, use `solver.ipynb` with Jupyter Notebook or VS Code.
