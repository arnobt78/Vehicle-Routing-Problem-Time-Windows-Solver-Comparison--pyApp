# Vehicle Routing Problem with Time Windows (VRPTW) Solver Comparison - Python Project (strategies for solving NP-hard optimization problems using multiple metaheuristic algorithms)

A comprehensive Python implementation comparing multiple metaheuristic algorithms for solving the **Vehicle Routing Problem with Time Windows (VRPTW)**. This project provides a detailed comparison of four state-of-the-art optimization algorithms: Hybrid Genetic Search (HGS), Guided Local Search (GLS), Ant Colony Optimization (ACO), and Simulated Annealing (SA).

---

## The Comparison results of different NP metaheuristic algorithms for VRPTW

Running Algorithms on dataset: rc108.txt

---

Best-Known Solution (BKS) Route Cost: 1114.2

BKS solution:

Route #1: 2 6 7 8 46 4 45 5 3 1 100

Route #2: 12 14 47 17 16 15 13 9 11 10

Route #3: 33 32 30 28 26 27 29 31 34 93

Route #4: 41 42 44 43 40 38 37 35 36 39

Route #5: 61 81 94 71 72 54 96

Route #6: 64 51 76 89 18 48 19 20 66

Route #7: 65 83 57 24 22 49 21 23 25 77

Route #8: 69 98 88 53 78 73 79 60 55 70 68

Route #9: 82 99 52 86 87 59 97 75 58 74

Route #10: 90

Route #11: 92 95 67 62 50 63 85 84 56 91 80

---

Hybrid Genetic Search (HGS) Route Cost: 1114.2

HGS solution:

Route #1: 12 14 47 17 16 15 13 9 11 10

Route #2: 82 99 52 86 87 59 97 75 58 74

Route #3: 65 83 57 24 22 49 21 23 25 77

Route #4: 64 51 76 89 18 48 19 20 66

Route #5: 92 95 67 62 50 63 85 84 56 91 80

Route #6: 33 32 30 28 26 27 29 31 34 93

Route #7: 61 81 94 71 72 54 96

Route #8: 41 42 44 43 40 38 37 35 36 39

Route #9: 2 6 7 8 46 4 45 5 3 1 100

Route #10: 90

Route #11: 69 98 88 53 78 73 79 60 55 70 68

---

Guided Local Search (GLS) Route Cost: 1266.9

GLS solution:

Route #1: 71 72 44 43 40 38 37 35 36 39

Route #2: 98 82 90 53 78 73 79 2 60

Route #3: 92 67 32 30 28 26 27 29 31 34 93

Route #4: 65 99 24 22 20 49 21 23 25 77

Route #5: 95 51 76 89 33 50 62 91 80

Route #6: 12 14 47 17 16 15 13 9 11 10

Route #7: 88 6 7 8 46 4 45 5 3 1 100 55

Route #8: 69 70 61 81 94 96 54 41 42 68

Route #9: 83 52 57 86 87 59 97 75 58 74

Route #10: 64 19 48 18 63 85 84 56 66

---

Ant Colony Optimization (ACO) Route Cost: 1321.8459204561746

ACO solution:

Route #1: 69 98 88 82 99 52 86 74 57 83 66 91

Route #2: 65 64 51 76 89 85 63 62 56 80

Route #3: 90 53 73 79 78 60 55 68

Route #4: 33 28 30 32 34 31 29 27 26

Route #5: 72 71 93 94 81 61 54 96 100 70

Route #6: 2 45 5 8 7 6 46 4 3 1

Route #7: 41 42 44 38 39 40 36 35 37 43

Route #8: 19 21 23 18 48 49 22 20 24 25

Route #9: 12 14 47 17 16 15 11 10 9 13

Route #10: 59 58 87 97 75 77

Route #11: 92 95 84 50 67

---

Simulated Annealing (SA) Route Cost: 1237.620141359753

SA solution:

Route #1: 7 8 46 4 45 5 3 1 100 55

Route #2: 64 51 76 89 63 85 84 56 91

Route #3: 69 98 53 12 15 16 17 47 14

Route #4: 90 82 9 13 11 10

Route #5: 61 42 44 40 39 38 37 35 36 43

Route #6: 65 52 86 77 25 23 57

Route #7: 88 60 78 73 79 6 2 70 68

Route #8: 92 67 62 34 50 94 96

Route #9: 99 87 59 97 75 58 74

Route #10: 83 24 22 19 18 48 21 49 20 66

Route #11: 81 93 71 72 41 54

Route #12: 95 33 32 30 28 26 27 29 31 80

---

| Algorithm | Routes | Cost   | Gap (%) | Runtime (s) |
| --------- | ------ | ------ | ------- | ----------- |
| BKS       | 11     | 1114.2 | 0.0     | -           |
| HGS       | 11     | 1114.2 | 0.0     | 300.14      |
| GLS       | 10     | 1266.9 | 13.7    | 300.05      |
| ACO       | 11     | 1321.8 | 18.63   | 877.20      |
| SA        | 12     | 1237.6 | 11.08   | 416.81      |

![3 HGS rc108](https://github.com/user-attachments/assets/afac9be9-37a1-4b4d-a7f8-5d346d653e2f) ![3 GLS rc108](https://github.com/user-attachments/assets/b8140b7f-30c2-4f65-9d55-24207754dd0f) ![3 ACO rc108](https://github.com/user-attachments/assets/3643d0e9-c3d4-418c-8ed7-efea8d94ede9) ![3 SA rc108](https://github.com/user-attachments/assets/3632158b-6131-4157-97bd-9cd4116bcecf)

## Table of Contents

- [Project Overview](#project-overview)
- [Project Details](#project-details)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Algorithms Implemented](#algorithms-implemented)
- [Parameter Tuning Guide](#parameter-tuning-guide)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [Environment Variables](#environment-variables)
- [Project Components & Functionalities](#project-components--functionalities)
- [Code Examples & Reusability](#code-examples--reusability)
- [Visualizations](#visualizations)
- [Results & Comparison](#results--comparison)
- [Future Plans: Web Application](#future-plans-web-application)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [Contact](#contact)

---

## Project Overview

This project is an educational and research-oriented implementation that benchmarks and compares different metaheuristic algorithms for solving VRPTW problems. The VRPTW is a classic NP-hard combinatorial optimization problem that extends the Vehicle Routing Problem (VRP) by adding time window constraints for customer service.

**Key Objectives:**

- Compare performance of different metaheuristic algorithms
- Provide reproducible experiments with standard benchmark datasets (Solomon instances)
- Visualize solutions and algorithm performance
- Serve as an educational resource for understanding optimization algorithms
- Enable easy extension with new algorithms or datasets

---

## Project Details

### Problem Definition

The Vehicle Routing Problem with Time Windows (VRPTW) involves:

- **Depot**: A central location where vehicles start and end their routes
- **Customers**: Locations that must be visited with specific demands
- **Time Windows**: Each customer has a ready time (earliest service start) and due time (latest service start)
- **Vehicle Capacity**: Each vehicle has a maximum load capacity
- **Objective**: Minimize total travel distance/cost while respecting all constraints

### Algorithms Compared

1. **Hybrid Genetic Search (HGS)** - State-of-the-art genetic algorithm with local search
2. **Guided Local Search (GLS)** - Local search enhanced with penalty mechanisms
3. **Ant Colony Optimization (ACO)** - Population-based metaheuristic inspired by ant behavior
4. **Simulated Annealing (SA)** - Probabilistic optimization technique

### Benchmark Datasets

The project uses **Solomon benchmark instances**, which are standard test cases for VRPTW:

- **C-series**: Clustered customer locations
- **R-series**: Random customer locations
- **RC-series**: Mixed clustered and random locations

Each dataset includes:

- Customer coordinates (x, y)
- Customer demands
- Time windows (ready_time, due_time)
- Service times
- Vehicle capacity constraints

---

## Features

- ✅ **Modular Architecture**: Each algorithm is implemented in a separate module
- ✅ **Comprehensive Benchmarking**: Comparison against Best-Known Solutions (BKS)
- ✅ **Visual Route Comparison**: Automatic generation of route visualizations
- ✅ **Reproducible Experiments**: Configurable random seeds for reproducibility
- ✅ **Multiple Dataset Support**: Easy switching between different Solomon instances
- ✅ **Performance Metrics**: Detailed runtime and solution quality analysis
- ✅ **Extensible Design**: Easy to add new algorithms or modify existing ones
- ✅ **Interactive Notebook**: Jupyter notebook for step-by-step exploration

---

## Technologies Used

### Core Technologies

- **Python 3.x**: Primary programming language
- **NumPy**: Numerical computations and matrix operations
- **pandas**: Data manipulation and CSV processing
- **matplotlib**: Visualization and plotting

### Optimization Libraries

- **pyVRP**: Framework for Hybrid Genetic Search implementation
- **OR-Tools**: Google's optimization tools for Guided Local Search
- **vrplib**: Library for reading VRPTW problem instances and solutions

### Additional Tools

- **Jupyter Notebook**: Interactive analysis and visualization
- **tabulate**: Formatted table output for results

---

## Project Structure

```bash
.
├── main.py                      # Main execution script
├── solver.ipynb                 # Interactive Jupyter notebook
├── bks.py                       # Best-Known Solutions processor
├── plot.py                      # Visualization utilities
├── requirements.txt             # Python dependencies
├── README.md                    # Project documentation
│
├── aco/                         # Ant Colony Optimization module
│   ├── __init__.py
│   ├── vrptw_base.py           # Node and graph structures
│   ├── basic_aco.py            # Core ACO logic
│   ├── ant.py                  # Ant agent implementation
│   ├── multiple_ant_colony_system.py  # Multi-colony ACO system
│   ├── solve.py                # ACO solver interface
│   └── vprtw_aco_figure.py     # ACO visualization
│
├── gls/                         # Guided Local Search module
│   ├── __init__.py
│   ├── base_solver.py          # GLS solver implementation
│   ├── instance_loader.py      # Data loader for GLS
│   ├── data_model.py           # Data models (Pydantic)
│   ├── solver_model.py         # Solver settings model
│   └── solve.py                # GLS solver interface
│
├── sa/                          # Simulated Annealing module
│   ├── __init__.py
│   ├── simulated_annealing.py  # SA algorithm implementation
│   ├── instance_loader.py      # SA instance loader
│   ├── solve.py                # SA solver interface
│   └── util.py                 # Utility functions
│
├── hgs/                         # Hybrid Genetic Search module
│   └── solve.py                # HGS solver interface (uses pyVRP)
│
└── dataset/                     # Benchmark datasets
    ├── c101.txt, c101.sol      # Clustered instances
    ├── r101.txt, r101.sol      # Random instances
    ├── rc101.txt, rc101.sol    # Mixed instances
    └── ...                      # Additional instances
```

---

## Algorithms Implemented

### 1. Hybrid Genetic Search (HGS)

**Description**: A state-of-the-art genetic algorithm that combines evolutionary operators with local search heuristics. HGS uses population-based search with crossover, mutation, and local improvement operators.

**Implementation**: Uses the `pyVRP` library, which provides an efficient HGS implementation.

**Key Features**:

- Population-based evolution
- Local search improvement
- Adaptive parameter control
- Time-limited optimization

**Code Example**:

```python
from pyvrp import Model, read
from pyvrp.stop import MaxRuntime

def solve_with_hgs(input_path, runtime):
    # Read instance in Solomon format
    INSTANCE = read(input_path, instance_format="solomon", round_func="trunc1")

    # Create model from instance data
    model = Model.from_data(INSTANCE)

    # Solve with time limit
    result = model.solve(stop=MaxRuntime(runtime), seed=0)

    # Extract routes
    routes = []
    for route in result.best.get_routes():
        routes.append(route.visits())

    return routes, result.cost() / 10
```

**Parameters**:

- `runtime`: Maximum runtime in seconds (default: 120)
- `seed`: Random seed for reproducibility (default: 0)

---

### 2. Guided Local Search (GLS)

**Description**: A local search metaheuristic that uses penalty mechanisms to escape local optima. GLS penalizes features that appear frequently in local optima, guiding the search toward unexplored regions.

**Implementation**: Uses Google OR-Tools with Guided Local Search metaheuristic.

**Key Features**:

- Penalty-based diversification
- Time window constraint handling
- Capacity constraint management
- Hierarchical objective (vehicles first, then distance)

**Code Example**:

```python
from gls.base_solver import Solver
from gls.instance_loader import load_instance

def solve_with_gls(input_path, runtime):
    # Load instance with time precision scaler
    time_precision_scaler = 10
    data = load_instance(input_path, time_precision_scaler)

    # Create solver
    solver = Solver(data, time_precision_scaler)
    solver.create_model()

    # Solve with settings
    settings = {"time_limit": runtime}
    solver.solve_model(settings)

    # Get solution
    routes = solver.get_solution()
    cost = solver.get_solution_travel_time()

    return routes, cost
```

**Parameters**:

- `runtime`: Maximum runtime in seconds (default: 120)
- `time_precision_scaler`: Precision for time calculations (default: 10)

---

### 3. Ant Colony Optimization (ACO)

**Description**: A population-based metaheuristic inspired by ant foraging behavior. Artificial ants construct solutions probabilistically based on pheromone trails and heuristic information.

**Key Components**:

- **Node**: Represents customers/depot with coordinates, demand, and time windows
- **VrptwGraph**: Graph structure with distance matrix and pheromone trails
- **Ant**: Agent that constructs routes following pheromone trails
- **MultipleAntColonySystem**: Multi-colony system with parallel exploration

**Code Example**:

```python
from aco.vrptw_base import VrptwGraph
from aco.multiple_ant_colony_system import MultipleAntColonySystem

def solve_with_aco(input_path):
    # Initialize graph with pheromone evaporation rate
    rho = 0.1
    graph = VrptwGraph(input_path, rho)

    # Create multi-colony system
    macs = MultipleAntColonySystem(
        graph,
        ants_num=30,           # Number of ants
        beta=0.9,               # Heuristic importance
        q0=0.9,                 # Exploitation probability
        whether_or_not_to_show_figure=False,
        runtime_in_minutes=5    # Runtime limit
    )

    # Run algorithm
    macs.run_multiple_ant_colony_system()

    # Extract best solution
    routes = get_best_route_from_path(macs.best_path)
    cost = macs.best_path_distance.value

    return routes, cost
```

**Parameters**:

- `ants_num`: Number of ants in the colony (default: 30)
- `beta`: Importance of heuristic information vs. pheromone (default: 0.9)
- `q0`: Probability of choosing best option vs. probabilistic choice (default: 0.9)
- `rho`: Pheromone evaporation rate (default: 0.1)
- `runtime_in_minutes`: Maximum runtime in minutes (default: 5)

**Algorithm Flow**:

1. Initialize pheromone trails using nearest neighbor heuristic
2. Each ant constructs a solution:
   - Selects next customer based on pheromone and heuristic information
   - Respects capacity and time window constraints
   - Uses insertion procedure for unvisited customers
   - Applies local search for improvement
3. Update pheromone trails based on best solutions
4. Repeat until stopping criterion met

---

### 4. Simulated Annealing (SA)

**Description**: A probabilistic optimization technique that accepts worse solutions with decreasing probability, allowing escape from local optima. The "temperature" parameter controls exploration vs. exploitation.

**Key Features**:

- Temperature-based acceptance criterion
- Random neighbor generation
- Hierarchical objective function (vehicles × distance)
- Adaptive cooling schedule

**Code Example**:

```python
from sa.instance_loader import load_from_file
from sa.simulated_annealing import sa_algorithm

def solve_using_sa(input_path):
    # Load instance
    instance = load_from_file(input_path)

    # Find initial solution
    instance.find_initial_solution()

    # Define temperature parameters
    INIT_TEMP = 700
    UPDATE_TEMP = lambda t: 0.9999 * t  # Cooling schedule
    STOP_CRITERIA = lambda t: t <= 0.01  # Stopping condition

    # Run SA algorithm
    results = sa_algorithm(instance, INIT_TEMP, UPDATE_TEMP, STOP_CRITERIA)

    # Extract best solution
    best_solution = results[2][0]  # Final solution
    routes = best_solution.get_solution()
    cost = best_solution.get_total_distance()

    return routes, cost
```

**Parameters**:

- `INIT_TEMP`: Initial temperature (default: 700)
- `UPDATE_TEMP`: Temperature update function (default: `lambda t: 0.9999 * t`)
- `STOP_CRITERIA`: Stopping condition (default: `lambda t: t <= 0.01`)

**Cooling Schedule**: The temperature decreases exponentially, allowing more exploration early and more exploitation later.

---

## Parameter Tuning Guide

### General Parameter Tuning Strategy

Different NP-hard problem instances may require different parameter settings for optimal performance. Here's a comprehensive guide:

### ACO Parameter Tuning

**1. Number of Ants (`ants_num`)**

- **Small instances (< 50 customers)**: 10-20 ants
- **Medium instances (50-100 customers)**: 20-40 ants
- **Large instances (> 100 customers)**: 40-60 ants
- **Trade-off**: More ants = better exploration but slower computation

**2. Beta (Heuristic Importance)**

- **Range**: 0.5 - 2.0
- **Low values (0.5-0.8)**: More emphasis on pheromone trails (exploitation)
- **High values (1.5-2.0)**: More emphasis on distance heuristic (exploration)
- **Recommended**: 0.9-1.2 for balanced search

**3. Q0 (Exploitation Probability)**

- **Range**: 0.0 - 1.0
- **Low values (0.1-0.3)**: More exploration, probabilistic selection
- **High values (0.7-0.9)**: More exploitation, greedy selection
- **Recommended**: 0.7-0.9 for faster convergence

**4. Rho (Pheromone Evaporation)**

- **Range**: 0.01 - 0.3
- **Low values (0.01-0.05)**: Slow evaporation, strong memory
- **High values (0.2-0.3)**: Fast evaporation, quick adaptation
- **Recommended**: 0.1-0.15 for balanced memory

**Example Configuration for Different Instance Types**:

```python
# Clustered instances (C-series) - tighter time windows
aco_config_clustered = {
    "ants_num": 25,
    "beta": 1.0,
    "q0": 0.85,
    "rho": 0.12,
    "runtime_in_minutes": 5
}

# Random instances (R-series) - more spread out
aco_config_random = {
    "ants_num": 35,
    "beta": 0.8,
    "q0": 0.75,
    "rho": 0.15,
    "runtime_in_minutes": 7
}

# Mixed instances (RC-series) - combination
aco_config_mixed = {
    "ants_num": 30,
    "beta": 0.9,
    "q0": 0.8,
    "rho": 0.1,
    "runtime_in_minutes": 6
}
```

### SA Parameter Tuning

**1. Initial Temperature (`INIT_TEMP`)**

- **Small instances**: 300-500
- **Medium instances**: 500-800
- **Large instances**: 800-1200
- **Rule of thumb**: Should allow ~50% acceptance of worse solutions initially

**2. Cooling Schedule (`UPDATE_TEMP`)**

- **Fast cooling**: `lambda t: 0.99 * t` (quick convergence, may miss global optimum)
- **Slow cooling**: `lambda t: 0.9999 * t` (thorough search, slower convergence)
- **Recommended**: `lambda t: 0.999 * t` to `lambda t: 0.9999 * t`

**3. Stopping Temperature**

- **Range**: 0.01 - 1.0
- **Lower values**: More thorough search
- **Recommended**: 0.01 - 0.1

**Example Configuration**:

```python
# Aggressive search (faster, less thorough)
SA_FAST = {
    "INIT_TEMP": 500,
    "UPDATE_TEMP": lambda t: 0.99 * t,
    "STOP_CRITERIA": lambda t: t <= 0.1
}

# Thorough search (slower, more thorough)
SA_THOROUGH = {
    "INIT_TEMP": 1000,
    "UPDATE_TEMP": lambda t: 0.9999 * t,
    "STOP_CRITERIA": lambda t: t <= 0.01
}
```

### GLS Parameter Tuning

**1. Time Limit**

- **Small instances**: 60-120 seconds
- **Medium instances**: 120-300 seconds
- **Large instances**: 300-600 seconds

**2. Time Precision Scaler**

- **Default**: 10 (two decimal precision)
- **Higher values**: More precision but slower computation
- **Recommended**: 10-100 depending on time window granularity

### HGS Parameter Tuning

HGS uses pyVRP's built-in parameter optimization. Main tunable parameter:

- **Runtime**: Adjust based on instance size and desired solution quality

---

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Step-by-Step Installation

**1. Clone the Repository**

```bash
git clone <repository-url>
cd Vehicle-Routing-Problem-Time-Windows-Solver-Comparison
```

**2. Create Virtual Environment**

```bash
# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

**3. Install Dependencies**

```bash
pip install -r requirements.txt
```

**4. Verify Installation**

```bash
python -c "import pyvrp; import ortools; print('Installation successful!')"
```

---

## How to Run

### Basic Usage

**1. Run All Algorithms on Default Dataset**

Edit `main.py` to set your desired dataset:

```python
dataset = "r211"  # Change to your desired dataset
INPUT_PATH = f"dataset/{dataset}.txt"
BKS_PATH = f"dataset/{dataset}.sol"
RUNTIME = 120  # Runtime in seconds
```

Then run:

```bash
python main.py
```

**2. Run Individual Algorithm**

```python
# ACO only
from aco.solve import solve_with_aco
routes, cost = solve_with_aco("dataset/r101.txt")

# GLS only
from gls.solve import solve_with_gls
routes, cost = solve_with_gls("dataset/r101.txt", runtime=120)

# SA only
from sa.solve import solve_using_sa
routes, cost = solve_using_sa("dataset/r101.txt")

# HGS only
from hgs.solve import solve_with_hgs
routes, cost = solve_with_hgs("dataset/r101.txt", runtime=120)
```

**3. Interactive Exploration with Jupyter Notebook**

```bash
jupyter notebook solver.ipynb
```

This allows you to:

- Step through algorithm execution
- Visualize intermediate solutions
- Experiment with parameters
- Analyze results interactively

---

## Environment Variables

Currently, this project does not require a `.env` file as all parameters are configured directly in the code. However, for future web application development, you may want to use environment variables.

### Recommended .env Structure (for future web app)

Create a `.env` file in the project root:

```env
# Dataset Configuration
DEFAULT_DATASET=r101
DATASET_PATH=dataset/

# Algorithm Default Parameters
# ACO Parameters
ACO_ANTS_NUM=30
ACO_BETA=0.9
ACO_Q0=0.9
ACO_RHO=0.1
ACO_RUNTIME_MINUTES=5

# SA Parameters
SA_INIT_TEMP=700
SA_COOLING_RATE=0.9999
SA_STOP_TEMP=0.01

# GLS Parameters
GLS_TIME_PRECISION_SCALER=10
GLS_DEFAULT_RUNTIME=120

# HGS Parameters
HGS_DEFAULT_RUNTIME=120
HGS_SEED=0

# General Settings
DEFAULT_RUNTIME=120
RANDOM_SEED=0
ENABLE_VISUALIZATION=true
OUTPUT_DIR=results/
```

### Loading Environment Variables (Python)

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Access variables
aco_ants_num = int(os.getenv('ACO_ANTS_NUM', 30))
default_runtime = int(os.getenv('DEFAULT_RUNTIME', 120))
```

**Note**: To use `.env` files, install `python-dotenv`:

```bash
pip install python-dotenv
```

---

## Project Components & Functionalities

### Core Components

#### 1. Main Execution (`main.py`)

**Functionality**: Orchestrates execution of all algorithms and generates comparison results.

**Key Features**:

- Runs all four algorithms sequentially
- Compares results against Best-Known Solutions
- Generates visualizations for each algorithm
- Outputs formatted comparison table

**How It Works**:

```python
# 1. Load BKS solution
result["bks"]["routes"], result["bks"]["cost"] = bks_solution(BKS_PATH)

# 2. Run each algorithm with timing
for algo in ["hgs", "gls", "aco", "sa"]:
    start = time.time()
    routes, cost = solve_with_algo(INPUT_PATH, RUNTIME)
    result[algo]["runtime"] = time.time() - start

# 3. Generate visualizations
for algo in ["hgs", "gls", "aco", "sa"]:
    plot_my_solution(result[algo], INSTANCE, dataset=dataset, algo=algo)

# 4. Calculate gaps and display results
gap = lambda bks_cost, algo_cost: 100 * (algo_cost - bks_cost) / bks_cost
```

---

#### 2. Best-Known Solutions Processor (`bks.py`)

**Functionality**: Loads and processes optimal or best-known solutions for comparison.

**Usage**:

```python
from bks import bks_solution

routes, cost = bks_solution("dataset/r101.sol")
```

**Returns**:

- `routes`: List of routes (each route is a list of customer IDs)
- `cost`: Total solution cost

---

#### 3. Visualization Module (`plot.py`)

**Functionality**: Creates visual representations of vehicle routes.

**Features**:

- Plots depot and customer locations
- Draws routes with different colors
- Shows route connections
- Displays solution cost in title

**Usage**:

```python
from plot import plot_my_solution
import matplotlib.pyplot as plt

solution = {"routes": routes, "cost": cost}
fig, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(solution, instance_data, ax=ax, dataset="r101", algo="HGS")
plt.savefig("solution.png")
```

---

### Algorithm-Specific Components

#### ACO Module Components

**1. `vrptw_base.py` - Graph Structure**

- `Node`: Represents a customer or depot
- `VrptwGraph`: Complete problem graph with pheromone matrix
- `PathMessage`: Message structure for inter-thread communication

**2. `ant.py` - Ant Agent**

- `Ant`: Individual ant that constructs solutions
- Methods: `move_to_next_index()`, `check_condition()`, `insertion_procedure()`, `local_search_procedure()`

**3. `multiple_ant_colony_system.py` - Multi-Colony System**

- `MultipleAntColonySystem`: Main ACO orchestrator
- Parallel exploration with `acs_time` and `acs_vehicle` threads

**4. `basic_aco.py` - Basic ACO Implementation**

- Simpler single-colony ACO (alternative to multi-colony system)

---

#### GLS Module Components

**1. `instance_loader.py` - Data Loading**

- `load_instance()`: Loads Solomon format instances
- Converts coordinates to time matrices
- Handles time precision scaling

**2. `base_solver.py` - OR-Tools Solver**

- `Solver`: Main GLS solver class
- Methods: `create_model()`, `solve_model()`, `get_solution()`

**3. `data_model.py` - Data Models**

- `ProblemInstance`: Pydantic model for problem data validation

---

#### SA Module Components

**1. `instance_loader.py` - Instance Loading**

- `load_from_file()`: Loads Solomon instances
- Creates `Instance` object with `Customer` and `Vehicle` objects

**2. `simulated_annealing.py` - SA Algorithm**

- `sa_algorithm()`: Main SA implementation
- Temperature-based acceptance criterion
- Neighbor generation and evaluation

**3. `util.py` - Utilities**

- `distance()`: Euclidean distance calculation

---

#### HGS Module Components

**1. `solve.py` - HGS Interface**

- Wrapper around pyVRP library
- Converts between project format and pyVRP format

---

## Code Examples & Reusability

### Example 1: Using ACO in Your Own Project

```python
from aco.vrptw_base import VrptwGraph
from aco.multiple_ant_colony_system import MultipleAntColonySystem

# Initialize with your problem instance
graph = VrptwGraph("your_problem.txt", rho=0.1)

# Configure ACO parameters
macs = MultipleAntColonySystem(
    graph,
    ants_num=30,
    beta=0.9,
    q0=0.9,
    whether_or_not_to_show_figure=False,
    runtime_in_minutes=5
)

# Solve
macs.run_multiple_ant_colony_system()

# Get solution
best_routes = extract_routes(macs.best_path)
best_cost = macs.best_path_distance.value
```

### Example 2: Using GLS Solver

```python
from gls.base_solver import Solver
from gls.instance_loader import load_instance

# Load your problem
data = load_instance("your_problem.txt", time_precision_scaler=10)

# Create and solve
solver = Solver(data, time_precision_scaler=10)
solver.create_model()
solver.solve_model({"time_limit": 300})

# Extract solution
routes = solver.get_solution()
travel_time = solver.get_solution_travel_time()
```

### Example 3: Custom Visualization

```python
from plot import plot_my_solution
import matplotlib.pyplot as plt
from pyvrp import read

# Load instance
instance = read("dataset/r101.txt", instance_format="solomon")

# Your solution
my_solution = {
    "routes": [[1, 2, 3], [4, 5, 6]],
    "cost": 1234.5
}

# Plot
fig, ax = plt.subplots(figsize=(12, 12))
plot_my_solution(my_solution, instance, ax=ax, dataset="r101", algo="Custom")
plt.savefig("my_solution.png", dpi=300)
plt.show()
```

### Example 4: Batch Processing Multiple Instances

```python
import os
from aco.solve import solve_with_aco

datasets = ["r101", "r102", "r103", "c101", "c102"]

results = {}
for dataset in datasets:
    input_path = f"dataset/{dataset}.txt"
    if os.path.exists(input_path):
        print(f"Processing {dataset}...")
        routes, cost = solve_with_aco(input_path)
        results[dataset] = {"routes": routes, "cost": cost}

# Save results
import json
with open("batch_results.json", "w") as f:
    json.dump(results, f, indent=2)
```

### Example 5: Parameter Sensitivity Analysis

```python
from aco.solve import solve_with_aco
import pandas as pd

# Test different parameter combinations
beta_values = [0.5, 0.7, 0.9, 1.1, 1.3]
q0_values = [0.5, 0.7, 0.9]

results = []
for beta in beta_values:
    for q0 in q0_values:
        # Modify solve_with_aco to accept parameters
        # (You'll need to modify the function)
        routes, cost = solve_with_custom_aco("dataset/r101.txt", beta=beta, q0=q0)
        results.append({"beta": beta, "q0": q0, "cost": cost})

# Analyze results
df = pd.DataFrame(results)
best_params = df.loc[df['cost'].idxmin()]
print(f"Best parameters: beta={best_params['beta']}, q0={best_params['q0']}")
```

---

## Visualizations

The project automatically generates visualizations showing:

- **Depot location** (red star)
- **Customer locations** (colored dots)
- **Vehicle routes** (colored lines connecting customers)
- **Route numbers** (legend)
- **Solution cost** (in title)

**Example Output**:

- Each algorithm generates a separate PNG file
- Files are named: `{experiment_number} {Algorithm} {dataset}.png`
- Example: `1 HGS r101.png`, `1 ACO r101.png`

**Customization**:

```python
# Modify plot.py to customize:
# - Colors
# - Marker sizes
# - Line styles
# - Figure size
# - Title format
```

---

## Results & Comparison

### Performance Metrics

The project compares algorithms on:

1. **Solution Cost**: Total travel distance
2. **Number of Routes**: Vehicles used
3. **Gap from BKS**: Percentage difference from best-known solution
4. **Runtime**: Execution time in seconds

### Typical Results (rc108 instance)

| Algorithm | Routes | Cost   | Gap (%) | Runtime (s) |
| --------- | ------ | ------ | ------- | ----------- |
| BKS       | 11     | 1114.2 | 0.0     | -           |
| HGS       | 11     | 1114.2 | 0.0     | 300.14      |
| GLS       | 10     | 1266.9 | 13.7    | 300.05      |
| ACO       | 11     | 1321.8 | 18.63   | 877.20      |
| SA        | 12     | 1237.6 | 11.08   | 416.81      |

**Observations**:

- **HGS** achieves optimal or near-optimal solutions
- **GLS** uses fewer vehicles but higher cost
- **ACO** provides good solutions but requires more time
- **SA** balances solution quality and runtime

---

## Future Plans: Web Application

### Planned Features

**1. React Frontend**

- Interactive dataset selection
- Real-time parameter tuning interface
- Live visualization of solutions
- Comparison dashboard
- Results export functionality

**2. Python Backend (Flask/FastAPI)**

- RESTful API endpoints
- Algorithm execution service
- Result storage and retrieval
- Batch processing support

**3. Proposed API Endpoints**

```python
# Dataset Management
GET  /api/datasets              # List available datasets
GET  /api/datasets/{name}        # Get dataset details

# Algorithm Execution
POST /api/solve/aco             # Run ACO algorithm
POST /api/solve/gls             # Run GLS algorithm
POST /api/solve/sa              # Run SA algorithm
POST /api/solve/hgs             # Run HGS algorithm
POST /api/solve/compare         # Run all algorithms

# Results
GET  /api/results/{job_id}      # Get solution results
GET  /api/results/{job_id}/plot # Get visualization
GET  /api/history               # Get execution history

# Parameter Management
GET  /api/parameters/aco        # Get ACO default parameters
PUT  /api/parameters/aco        # Update ACO parameters
```

**4. Frontend Components**

```javascript
// React Component Structure
src/
├── components/
│   ├── DatasetSelector.jsx     # Dataset selection dropdown
│   ├── ParameterTuner.jsx       # Algorithm parameter controls
│   ├── SolutionVisualizer.jsx  # Interactive route visualization
│   ├── ComparisonTable.jsx     # Results comparison table
│   └── AlgorithmCard.jsx      # Individual algorithm card
├── services/
│   ├── api.js                  # API client
│   └── websocket.js            # Real-time updates
└── pages/
    ├── Home.jsx                # Main dashboard
    ├── Solver.jsx              # Algorithm execution page
    └── Results.jsx             # Results viewing page
```

**5. Backend Structure**

```python
# Flask/FastAPI Structure
app/
├── api/
│   ├── routes/
│   │   ├── datasets.py         # Dataset endpoints
│   │   ├── algorithms.py        # Algorithm execution
│   │   └── results.py          # Results retrieval
│   ├── models/
│   │   ├── request_models.py   # Request validation
│   │   └── response_models.py # Response schemas
│   └── services/
│       ├── aco_service.py     # ACO execution service
│       ├── gls_service.py     # GLS execution service
│       └── visualization.py   # Plot generation
├── core/
│   ├── config.py               # Configuration
│   └── database.py            # Database models
└── utils/
    ├── validators.py          # Input validation
    └── formatters.py          # Output formatting
```

**6. Environment Variables for Web App**

```env
# Backend Configuration
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///results.db

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000/ws

# Algorithm Defaults
DEFAULT_RUNTIME=120
MAX_RUNTIME=600
ENABLE_PARALLEL=true
```

**7. Deployment Considerations**

- **Backend**: Deploy on Heroku, AWS, or DigitalOcean
- **Frontend**: Deploy on Vercel, Netlify, or AWS S3
- **Database**: Use PostgreSQL for production, SQLite for development
- **Caching**: Redis for job queue and result caching
- **File Storage**: AWS S3 or local storage for visualizations

---

## Keywords

- **Vehicle Routing Problem (VRP)**
- **Time Windows**
- **Metaheuristics**
- **Hybrid Genetic Search (HGS)**
- **Guided Local Search (GLS)**
- **Ant Colony Optimization (ACO)**
- **Simulated Annealing (SA)**
- **Solomon Dataset**
- **Routing Optimization**
- **Combinatorial Optimization**
- **NP-Hard Problems**
- **Heuristic Algorithms**
- **Local Search**
- **Population-Based Algorithms**
- **Pheromone Trails**
- **Time Window Constraints**
- **Vehicle Capacity**
- **Route Optimization**
- **Benchmarking**
- **Performance Comparison**
- **Visualization**
- **Operations Research**
- **Logistics Optimization**

---

## Conclusion

This project provides a comprehensive framework for comparing metaheuristic algorithms on VRPTW problems. It serves multiple purposes:

1. **Educational**: Learn about different optimization algorithms and their implementations
2. **Research**: Benchmark algorithms on standard test instances
3. **Practical**: Use as a foundation for real-world routing applications
4. **Extensible**: Easy to add new algorithms or modify existing ones

**Key Takeaways**:

- Different algorithms excel in different scenarios
- Parameter tuning significantly impacts performance
- HGS generally provides the best solutions but requires more time
- ACO offers good balance between quality and exploration
- GLS is effective for vehicle minimization
- SA provides quick solutions with reasonable quality

**Best Practices**:

- Always compare against BKS when available
- Run multiple experiments with different seeds
- Tune parameters based on instance characteristics
- Use appropriate runtime limits for your use case
- Visualize solutions to understand algorithm behavior

**Extension Ideas**:

- Add more algorithms (Tabu Search, Variable Neighborhood Search)
- Implement hybrid approaches
- Add multi-objective optimization
- Create web interface for easier access
- Add real-time visualization
- Support custom problem instances

---

## Contact

**Arnob Mahmud**

- **Email**: <arnob_t78@yahoo.com>
- **Portfolio**: <https://arnob-mahmud.vercel.app/>
- **GitHub**: [https://github.com/arnobt78]

For questions, feedback, collaboration opportunities, or to share your work using this project, feel free to reach out!

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://arnob-mahmud.vercel.app/](https://arnob-mahmud.vercel.app/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
