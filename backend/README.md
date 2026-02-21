# Vehicle Routing Problem with Time Windows (VRPTW) Solver Comparison — Python/FastAPI Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green)](https://fastapi.tiangolo.com/)
[![pyVRP](https://img.shields.io/badge/pyVRP-0.6.3%20%7C%200.13+-blue)](https://github.com/PyVRP/PyVRP)
[![OR-Tools](https://img.shields.io/badge/OR--Tools-9.12+-orange)](https://developers.google.com/optimization)

Python/FastAPI backend for the **VRPTW Solver Comparison** project. It runs metaheuristic algorithms (HGS, GLS, ACO, SA, and optionally ILS), serves datasets and parameters, provides solve/compare jobs with streaming logs and route plots, and optional AI/RAG endpoints.

- **Live demo:** [https://vrptw-solver.vercel.app/](https://vrptw-solver.vercel.app/)
- **Backend (pyvrp 0.6.3):** [https://vrptw-api.arnobmahmud.com/](https://vrptw-api.arnobmahmud.com/)
- **Backend (pyvrp 0.13+ ILS):** [https://vrptw-ils.arnobmahmud.com/](https://vrptw-ils.arnobmahmud.com/)

For full project overview, how to run, and environment variables, see the **[root README](../README.md)** and **[RUN.md](../RUN.md)**. This document focuses on **backend structure, algorithms, parameter tuning, code examples, and reusability** for teaching and extension.

---

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
- [Web Application (Current)](#web-application-current)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [Contact](#contact)

---

## Project Overview

This backend is an educational and research-oriented implementation that benchmarks and compares different metaheuristic algorithms for solving VRPTW problems. The VRPTW is a classic NP-hard combinatorial optimization problem that extends the Vehicle Routing Problem (VRP) by adding time window constraints for customer service.

**Key objectives:**

- Compare performance of different metaheuristic algorithms (HGS, GLS, ACO, SA, ILS)
- Provide a **FastAPI web API** used by the React frontend: solve (single or compare), results, plots, datasets, parameters, optional AI/RAG
- Support **standalone batch runs** via `main.py` (run all algorithms on one dataset and print comparison table)
- Use standard Solomon benchmark datasets
- Enable easy extension with new algorithms or datasets

**Two ways to use the backend:**

1. **Web API:** Run `uvicorn app.main:app` and use the React app or any HTTP client to trigger solves, stream logs, and fetch results/plots.
2. **Standalone script:** Run `python main.py` after setting `dataset`, `INPUT_PATH`, `BKS_PATH`, and `RUNTIME` in `main.py` to compare all algorithms on one instance.

---

## Project Details

### Problem Definition

The Vehicle Routing Problem with Time Windows (VRPTW) involves:

- **Depot:** A central location where vehicles start and end their routes
- **Customers:** Locations that must be visited with specific demands
- **Time windows:** Each customer has a ready time (earliest service start) and due time (latest service start)
- **Vehicle capacity:** Each vehicle has a maximum load capacity
- **Objective:** Minimize total travel distance/cost while respecting all constraints

### Algorithms Compared

1. **Hybrid Genetic Search (HGS)** — State-of-the-art genetic algorithm with local search (pyvrp 0.6.3)
2. **Iterated Local Search (ILS)** — Implemented in pyvrp ≥0.13 (separate venv/backend in Option A)
3. **Guided Local Search (GLS)** — Local search with penalty mechanisms (OR-Tools)
4. **Ant Colony Optimization (ACO)** — Population-based metaheuristic (custom implementation)
5. **Simulated Annealing (SA)** — Probabilistic optimization (custom implementation)

### Benchmark Datasets

The project uses **Solomon benchmark instances** (e.g. C-series, R-series, RC-series). Instance files (`.txt`) and optional Best-Known Solution files (`.sol`) live in `dataset/` (or the path set by `DATASET_PATH` in `.env`).

---

## Features

- **FastAPI web app:** REST API for datasets, parameters, solve (single/compare), results, route plot images, optional AI suggest/explain/tune and RAG Q&A
- **Modular algorithms:** Each algorithm in its own module (`hgs/`, `ils/`, `gls/`, `aco/`, `sa/`)
- **Background execution:** Solve jobs run in threads; state stored in memory via `job_store`; logs streamed via SSE
- **Two-backend option (Option A):** Main backend runs HGS, GLS, ACO, SA (pyvrp 0.6.3); second backend runs ILS only (pyvrp ≥0.13) because the two pyvrp versions cannot coexist in one process
- **Standalone batch:** `main.py` runs all algorithms on one dataset and prints a comparison table
- **Route visualization:** `plot.py` generates 2D route plots (used by API and by `main.py`)
- **Extensible design:** Easy to add new algorithms or datasets

---

## Technologies Used

### Core

- **Python 3.11 or 3.12**
- **FastAPI** — Web framework
- **Uvicorn** — ASGI server
- **Pydantic** — Request/response and config validation
- **python-dotenv** — Load `.env` in `app.main`

### Optimization & Solvers

- **pyvrp 0.6.3** — Hybrid Genetic Search (HGS)
- **pyvrp ≥0.13** — Iterated Local Search (ILS), used in a separate venv/backend in Option A
- **OR-Tools** — Guided Local Search (GLS)
- **Custom** — ACO (`aco/`), SA (`sa/`)

### Data & Viz

- **pandas** — Data handling where used
- **matplotlib** — Route plots in `plot.py`
- **app.utils.instance_reader** — Solomon → pyvrp `ProblemData` (supports pyvrp 0.6.3 and 0.13+)

### Optional

- **Chroma, sentence-transformers, PyPDF2** — RAG (see `requirements-rag.txt`)
- **Google Gemini** — AI suggest/explain/tune (set `GOOGLE_GEMINI_API_KEY`)

---

## Project Structure

```text
backend/
├── app/                          # FastAPI application
│   ├── main.py                   # FastAPI app, CORS, routers, RAG bootstrap
│   ├── core/
│   │   └── config.py             # DATASET_PATH, DEFAULT_RUNTIME, SUPPORTED_ALGOS (BACKEND_ALGOS)
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py         # GET /api/health
│   │   │   ├── datasets.py       # List, metadata, download datasets/BKS
│   │   │   ├── algorithms.py     # POST /api/solve/{algo}, /api/solve/compare, stop, stream
│   │   │   ├── results.py        # GET /api/results/{job_id}, /api/results/{job_id}/plot
│   │   │   ├── parameters.py     # GET/PUT /api/parameters/{algo}
│   │   │   ├── ai.py             # Suggest, explain, RAG status/reindex/ask, tune
│   │   │   └── test_results.py   # Pre-generated experiment result sets
│   │   └── models/
│   │       └── request_models.py # SolveRequest, DEFAULT_PARAMS, etc.
│   ├── services/
│   │   ├── solver_executor.py   # Runs HGS/GLS/ACO/SA/ILS in threads; job_id routing
│   │   ├── job_store.py         # In-memory job state (logs, result, status)
│   │   ├── rag_service.py      # Optional RAG index and query
│   │   ├── ai_provider.py      # Optional Gemini client
│   │   └── tune_agent.py       # Optional auto-tune
│   ├── utils/
│   │   └── instance_reader.py  # read_solomon() for pyvrp 0.6.3 / 0.13+
│   └── log_config.py           # Logging config
├── aco/                         # Ant Colony Optimization
│   ├── vrptw_base.py           # Node, VrptwGraph, PathMessage
│   ├── ant.py                  # Ant agent
│   ├── basic_aco.py            # Basic ACO (alternative)
│   ├── multiple_ant_colony_system.py  # MACS (used by executor)
│   ├── solve.py                # solve_with_aco, get_best_route_from_path
│   └── vprtw_aco_figure.py     # ACO visualization
├── gls/                         # Guided Local Search (OR-Tools)
│   ├── instance_loader.py      # load_instance (Solomon → ProblemInstance)
│   ├── data_model.py           # ProblemInstance (Pydantic)
│   ├── solver_model.py         # SolverSetting (time_limit)
│   ├── base_solver.py          # Solver (create_model, solve_model, get_solution)
│   └── solve.py                # solve_with_gls
├── sa/                          # Simulated Annealing
│   ├── instance_loader.py      # load_from_file, Instance, Customer, Vehicle
│   ├── simulated_annealing.py  # sa_algorithm
│   ├── solve.py                # solve_using_sa
│   └── util.py                 # distance()
├── hgs/                         # Hybrid Genetic Search (pyvrp 0.6.3)
│   └── solve.py                # solve_with_hgs
├── ils/                         # Iterated Local Search (pyvrp ≥0.13)
│   └── solve.py                # solve_with_ils
├── plot.py                      # plot_my_solution (matplotlib)
├── bks.py                       # bks_solution (load .sol files)
├── main.py                      # Standalone: run all algos on one dataset, print table
├── run_server.py               # Optional: run uvicorn from backend root
├── requirements.txt            # Main deps (pyvrp 0.6.3, ortools, fastapi, …)
├── requirements-ils.txt        # ILS-only backend (pyvrp ≥0.13)
├── requirements-rag.txt       # Optional RAG
├── .env.example
└── README.md                    # This file
```

---

## Algorithms Implemented

### 1. Hybrid Genetic Search (HGS)

**Description:** State-of-the-art genetic algorithm that combines evolutionary operators with local search. Uses the **pyVRP** library (pyvrp 0.6.3).

**Entry point used by web API:** `app.services.solver_executor` calls `hgs.solve.solve_with_hgs(input_path, runtime)`.

**Code example (direct use):**

```python
from hgs.solve import solve_with_hgs

routes, cost = solve_with_hgs("dataset/r101.txt", runtime=120)
# routes: list of lists of customer IDs; cost: total distance (float)
```

**Parameters:**

- `runtime`: Maximum runtime in seconds (default 120)
- Instance is read via `app.utils.instance_reader.read_solomon` in the API path; in `hgs/solve.py` the project uses the same Solomon format.

---

### 2. Iterated Local Search (ILS)

**Description:** Implemented in **pyvrp ≥0.13**. Used when a second backend (Option A) runs with `BACKEND_ALGOS=ils` and a separate venv that has `pyvrp>=0.13` installed.

**Entry point:** `ils.solve.solve_with_ils(input_path, runtime)`.

**Code example:**

```python
from ils.solve import solve_with_ils

routes, cost = solve_with_ils("dataset/r101.txt", runtime=120)
```

---

### 3. Guided Local Search (GLS)

**Description:** Local search metaheuristic that uses penalty mechanisms to escape local optima. Implemented with **Google OR-Tools** (Guided Local Search).

**Entry point:** `gls.solve.solve_with_gls(input_path, runtime)`.

**Code example:**

```python
from gls.solve import solve_with_gls

routes, cost = solve_with_gls("dataset/r101.txt", runtime=120)
```

**Parameters:**

- `runtime`: Maximum runtime in seconds (OR-Tools may run slightly longer; see root README)
- `time_precision_scaler`: In `gls/solve.py` set to 10 (integer time units for OR-Tools)

---

### 4. Ant Colony Optimization (ACO)

**Description:** Population-based metaheuristic. This codebase uses **Multiple Ant Colony System (MACS)**: two colonies (one for distance, one for vehicle count). Supports runtime limit, optional early stop after 250 s with no improvement, and user stop via `should_stop` callback when run through the API.

**Entry point:** Executor builds `VrptwGraph`, `MultipleAntColonySystem`, then calls `macs.run_multiple_ant_colony_system(...)` and `aco.solve.get_best_route_from_path(macs.best_path)`.

**Code example (direct use):**

```python
from aco.vrptw_base import VrptwGraph
from aco.multiple_ant_colony_system import MultipleAntColonySystem
from aco.solve import get_best_route_from_path

graph = VrptwGraph("dataset/r101.txt", rho=0.1)
macs = MultipleAntColonySystem(
    graph,
    ants_num=30,
    beta=0.9,
    q0=0.9,
    whether_or_not_to_show_figure=False,
    runtime_in_minutes=5,
)
macs.run_multiple_ant_colony_system()
routes = get_best_route_from_path(macs.best_path)
cost = macs.best_path_distance.value
```

**Parameters:**

- `ants_num`: Number of ants (default 30)
- `beta`: Heuristic importance (default 0.9)
- `q0`: Exploitation probability (default 0.9)
- `rho`: Pheromone evaporation (default 0.1)
- `runtime_in_minutes`: Time limit; when runtime is “empty” in the API, natural run with early stop after 250 s no improvement is used.

---

### 5. Simulated Annealing (SA)

**Description:** Probabilistic optimization with temperature-based acceptance. Supports `max_runtime_sec`, optional early stop after 50 log intervals with no improvement when run with “empty” runtime from the API, and `should_stop` for user stop.

**Entry point:** Executor loads instance with `sa.instance_loader.load_from_file`, then calls `sa.simulated_annealing.sa_algorithm(...)`.

**Code example (direct use):**

```python
from sa.instance_loader import load_from_file
from sa.simulated_annealing import sa_algorithm

instance = load_from_file("dataset/r101.txt")
instance.find_initial_solution()
results = sa_algorithm(
    instance,
    temp_start=700,
    update_temp=lambda t: 0.9999 * t,
    stop_criterion=lambda t: t <= 0.01,
    max_runtime_sec=300,
)
routes = results[2][0].get_solution()
cost = results[2][0].get_total_distance()
```

**Parameters:**

- `temp_start`: Initial temperature (default 700)
- `update_temp`: Cooling schedule (default `lambda t: 0.9999 * t`)
- `stop_criterion`: Stop when temperature below threshold (default `lambda t: t <= 0.01`)
- `max_runtime_sec`: Time limit in seconds (optional)

---

## Parameter Tuning Guide

### ACO

- **ants_num:** Small instances 10–20, medium 20–40, large 40–60. More ants = more exploration, slower.
- **beta:** 0.5–2.0; lower = more pheromone (exploitation), higher = more heuristic (exploration). Recommended 0.9–1.2.
- **q0:** 0.0–1.0; higher = more greedy. Recommended 0.7–0.9.
- **rho:** 0.01–0.3; higher = faster evaporation. Recommended 0.1–0.15.

### SA

- **Initial temperature:** Small instances 300–500, medium 500–800, large 800–1200. Aim for ~50% acceptance of worse solutions initially.
- **Cooling:** Slower (e.g. 0.9999) = thorough search; faster (e.g. 0.99) = quicker convergence.
- **Stopping temperature:** Lower = more thorough (e.g. 0.01).

### GLS

- **Time limit:** 60–120 s (small), 120–300 s (medium), 300–600 s (large).
- **Time precision scaler:** Default 10; higher = more precision, slower.

### HGS / ILS

- **Runtime:** Main tunable; increase for better quality on larger instances.

**Example configurations per instance type (ACO):**

```python
# Clustered (C-series) — tighter time windows
aco_config_clustered = {"ants_num": 25, "beta": 1.0, "q0": 0.85, "rho": 0.12}

# Random (R-series) — more spread
aco_config_random = {"ants_num": 35, "beta": 0.8, "q0": 0.75, "rho": 0.15}

# Mixed (RC-series)
aco_config_mixed = {"ants_num": 30, "beta": 0.9, "q0": 0.8, "rho": 0.1}
```

**Example SA configurations:**

```python
# Faster, less thorough
SA_FAST = {"temp_start": 500, "update_temp": lambda t: 0.99 * t, "stop_criterion": lambda t: t <= 0.1}

# Slower, more thorough
SA_THOROUGH = {"temp_start": 1000, "update_temp": lambda t: 0.9999 * t, "stop_criterion": lambda t: t <= 0.01}
```

Default parameters are in `app.api.models.request_models.DEFAULT_PARAMS` and can be overridden per request or via PUT `/api/parameters/{algo}`.

---

## Installation & Setup

**Prerequisites:** Python 3.11 or 3.12, pip.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Optional — ILS (second backend for Option A):**

```bash
python3 -m venv venv-ils
source venv-ils/bin/activate
pip install -r requirements-ils.txt
```

**Optional — RAG/AI:** Install deps from `requirements-rag.txt` and set `GOOGLE_GEMINI_API_KEY` in `.env`.

**Verify:**

```bash
python -c "import pyvrp; import ortools; print('OK')"
```

Copy and edit environment (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env
```

---

## How to Run

### Web API (used by React frontend)

**Single backend (HGS, GLS, ACO, SA; ILS if pyvrp ≥0.13 in same venv):**

```bash
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option A — two backends (all 5 algorithms):**

- Terminal 1 — Main backend (HGS, GLS, ACO, SA):

  ```bash
  cd backend && source venv/bin/activate
  export BACKEND_ALGOS=hgs,gls,aco,sa
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```

- Terminal 2 — ILS backend:

  ```bash
  cd backend && source venv-ils/bin/activate
  export BACKEND_ALGOS=ils
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
  ```

Frontend: set `VITE_API_URL=http://localhost:8000` and for Option A set `VITE_ILS_API_URL=http://localhost:8001`. See root [README — How to Run](../README.md#how-to-run).

### Standalone batch (no frontend)

Edit at the top of `main.py`: `dataset`, `INPUT_PATH`, `BKS_PATH`, `RUNTIME`. Then:

```bash
cd backend && source venv/bin/activate
python main.py
```

This runs all available algorithms (HGS, GLS, ACO, SA, and ILS if installed), loads BKS from `.sol`, and prints a comparison table. Optionally it can generate plots if wired in the script.

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`. Full list is in the [root README — Environment Variables](../README.md#environment-variables).

| Variable                   | Required | Description                                                                                      |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `DATASET_PATH`             | No       | Path to dataset folder (default: `dataset`)                                                      |
| `DEFAULT_RUNTIME`          | No       | Default solve runtime in seconds (default: `120`)                                                |
| `BACKEND_ALGOS`            | No       | Comma-separated list this process runs. Main: `hgs,gls,aco,sa`. ILS: `ils`. Omit to auto-detect. |
| `GOOGLE_GEMINI_API_KEY`    | No       | For AI suggest/explain/tune and RAG                                                              |
| `RAG_PERSIST_DIR`          | No       | RAG index persistence directory                                                                  |
| `RAG_BOOTSTRAP_ON_STARTUP` | No       | Set to `0` to disable RAG index build on startup                                                 |

**Example `backend/.env`:**

```env
DATASET_PATH=dataset
DEFAULT_RUNTIME=120
# BACKEND_ALGOS=hgs,gls,aco,sa
# GOOGLE_GEMINI_API_KEY=your_key
# RAG_PERSIST_DIR=./rag_index
```

---

## Project Components & Functionalities

### FastAPI app (`app/`)

- **app.main:** Creates FastAPI app, CORS, mounts routers (health, datasets, algorithms, results, parameters, ai, test_results), optional RAG bootstrap on startup.
- **app.services.solver_executor:** Merges `DEFAULT_PARAMS` with request params, runs the chosen algorithm in a thread, routes stdout to job log, sets progress/runtime limit, calls `job_store.set_result` or `set_error`. Handles ACO/SA “natural” run (early stop, `should_stop`).
- **app.services.job_store:** In-memory store: `create_job`, `append_log`, `set_running`, `set_result`, `set_error`, `set_stopped`, `get_job`.
- **app.api.routes.algorithms:** POST `/api/solve/{algo}`, POST `/api/solve/compare`, POST `/api/solve/{job_id}/stop`, GET `/api/solve/{job_id}/stream` (SSE).
- **app.api.routes.results:** GET `/api/results/{job_id}`, GET `/api/results/{job_id}/plot` (uses `plot.plot_my_solution` and instance from `app.utils.instance_reader`).
- **app.api.routes.datasets:** List datasets, metadata, download instance/BKS.
- **app.api.routes.parameters:** GET/PUT `/api/parameters/{algo}` (uses `DEFAULT_PARAMS` from request_models).
- **app.api.routes.ai:** Suggest, explain, RAG status/reindex/ask, tune (optional).

### Algorithm modules

- **aco:** `VrptwGraph`, `Ant`, `MultipleAntColonySystem`, `solve_with_aco`, `get_best_route_from_path`
- **gls:** `load_instance`, `Solver`, `SolverSetting`, `solve_with_gls`
- **sa:** `load_from_file`, `Instance`, `sa_algorithm`, `solve_using_sa`
- **hgs:** `solve_with_hgs` (pyvrp 0.6.3)
- **ils:** `solve_with_ils` (pyvrp ≥0.13)

### Other

- **plot.py:** `plot_my_solution(solution, data, ax, dataset, algo)` — used by results route and by `main.py` if integrated.
- **bks.py:** `bks_solution(bks_path)` — returns routes and cost for `.sol` files; used by `main.py`.

---

## Code Examples & Reusability

### Run HGS from Python

```python
from hgs.solve import solve_with_hgs
routes, cost = solve_with_hgs("dataset/r101.txt", runtime=120)
```

### Run GLS

```python
from gls.solve import solve_with_gls
routes, cost = solve_with_gls("dataset/r101.txt", runtime=120)
```

### Run ACO with custom params

```python
from aco.vrptw_base import VrptwGraph
from aco.multiple_ant_colony_system import MultipleAntColonySystem
from aco.solve import get_best_route_from_path

graph = VrptwGraph("dataset/r101.txt", rho=0.1)
macs = MultipleAntColonySystem(
    graph, ants_num=40, beta=1.0, q0=0.85,
    whether_or_not_to_show_figure=False, runtime_in_minutes=10
)
macs.run_multiple_ant_colony_system()
routes = get_best_route_from_path(macs.best_path)
cost = macs.best_path_distance.value
```

### Run SA with time limit

```python
from sa.instance_loader import load_from_file
from sa.simulated_annealing import sa_algorithm

instance = load_from_file("dataset/r101.txt")
instance.find_initial_solution()
results = sa_algorithm(
    instance,
    temp_start=700,
    update_temp=lambda t: 0.9999 * t,
    stop_criterion=lambda t: t <= 0.01,
    max_runtime_sec=600,
)
routes = results[2][0].get_solution()
cost = results[2][0].get_total_distance()
```

### Plot a solution

```python
from app.utils.instance_reader import read_solomon
from plot import plot_my_solution
import matplotlib.pyplot as plt

instance = read_solomon("dataset/r101.txt")
solution = {"routes": [[1, 2, 3], [4, 5, 6]], "cost": 1234.5}
fig, ax = plt.subplots(figsize=(10, 10))
plot_my_solution(solution, instance, ax=ax, dataset="r101", algo="Custom")
plt.savefig("solution.png")
plt.close()
```

### Load BKS

```python
from bks import bks_solution
routes, cost = bks_solution("dataset/r101.sol")
```

### Batch: run multiple datasets (e.g. from Python)

```python
import os
from hgs.solve import solve_with_hgs

datasets = ["r101", "r102", "c101", "c102"]
results = {}
for name in datasets:
    path = f"dataset/{name}.txt"
    if os.path.exists(path):
        routes, cost = solve_with_hgs(path, runtime=120)
        results[name] = {"routes": routes, "cost": cost}
```

### Call the web API from Python (e.g. another script)

```python
import requests

BASE = "http://localhost:8000/api"
# Start solve
r = requests.post(f"{BASE}/solve/hgs", json={"dataset": "r101", "runtime": 120})
job_id = r.json()["job_id"]
# Poll result
r = requests.get(f"{BASE}/results/{job_id}")
while r.json().get("status") == "running":
    time.sleep(2)
    r = requests.get(f"{BASE}/results/{job_id}")
result = r.json().get("result")  # routes, cost, runtime
# Plot URL
plot_url = f"http://localhost:8000/api/results/{job_id}/plot"
```

---

## Visualizations

`plot.py` produces 2D route plots: depot (red star), customer points (colored by route), route lines, and solution cost in the title. The API serves these via GET `/api/results/{job_id}/plot` (PNG). Routes are normalized to 1-based indices for display when solvers return 0-based.

---

## Results & Comparison

Typical metrics: solution cost, number of routes, gap from BKS (%), runtime (s). Example comparison (rc108) is in the root README. The Compare page in the frontend runs all algorithms on one dataset and displays a table with these metrics; the backend returns per-job results and plots.

---

## Web Application (Current)

The backend **is** the server for the React frontend. Implemented API (base `/api`):

- **Health:** GET `/api/health`
- **Datasets:** GET `/api/datasets`, GET `/api/datasets/{name}`, download endpoints
- **Solve:** POST `/api/solve/{algo}` (body: `dataset`, `runtime?`, `params?`), POST `/api/solve/compare`, POST `/api/solve/{job_id}/stop`, GET `/api/solve/{job_id}/stream` (SSE)
- **Results:** GET `/api/results/{job_id}`, GET `/api/results/{job_id}/plot`
- **Parameters:** GET/PUT `/api/parameters/{algo}`
- **AI:** GET `/api/ai/suggest`, POST `/api/ai/explain`, GET `/api/ai/rag/status`, POST `/api/ai/rag/reindex`, POST `/api/ai/ask`, POST `/api/ai/tune`
- **Test results:** GET `/api/test-results`, etc.

Frontend (see [root README](../README.md) and `frontend/README.md`) calls these endpoints for Solver, Compare, Datasets, and optional AI/RAG features.

---

## Keywords

VRPTW, vehicle routing, time windows, metaheuristics, HGS, ILS, GLS, ACO, SA, Solomon benchmark, FastAPI, Python, pyvrp, OR-Tools, route optimization, combinatorial optimization, NP-hard, operations research, logistics.

---

## Conclusion

The backend provides both a **web API** for the full-stack app and **standalone scripts** for batch comparison. Algorithms are modular and reusable; default parameters and tuning are documented. For run instructions and env details see the [root README](../README.md) and [RUN.md](../RUN.md).

---

## Contact

**Arnob Mahmud**

- **Portfolio:** [https://www.arnobmahmud.com](https://www.arnobmahmud.com)
- **GitHub:** [https://github.com/arnobt78](https://github.com/arnobt78)

For questions, feedback, or to share your work using this project, feel free to reach out.

---

## Happy Coding! 🎉

Feel free to use and extend this backend. If you have questions or want to share what you’ve built, reach out via GitHub or [portfolio](https://www.arnobmahmud.com). Enjoy building and learning! 🚀
