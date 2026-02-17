# Guided Local Search (GLS)

## Overview

GLS is a metaheuristic that augments local search with a penalty mechanism to escape local optima. It is often used with OR-Tools for VRPTW.

## How it works

1. **Initial solution**: Build a feasible solution (e.g. with a greedy or insertion heuristic).
2. **Local search**: Improve the solution with moves (relocate, exchange, etc.) until a local optimum is reached.
3. **Features and penalties**: Identify "features" (e.g. edges or arcs used). When stuck, penalize features that appear often in the current solution, and add these penalties to the objective.
4. **Continue**: Resume local search with the modified (penalized) objective so the search is guided away from overused structures.
5. **Stopping**: Stop after a time limit or when no improvement is found.

## Parameters

- **runtime** (seconds): Time limit for the solver.
- **time_precision_scaler**: Internal scaling of time values (e.g. 10) for OR-Tools integer formulation.

## Time windows

GLS with OR-Tools respects time windows via constraint propagation. The solver ensures that each visit is scheduled within [ready_time, due_time] and computes arrival and waiting times along routes.

## When to use

GLS is effective for finding good solutions quickly and often uses fewer vehicles. It suits instances where you want a balance between quality and speed.
