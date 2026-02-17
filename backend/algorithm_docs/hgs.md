# Hybrid Genetic Search (HGS)

## Overview

HGS is a state-of-the-art metaheuristic for VRP/VRPTW implemented in the PyVRP library. It combines genetic algorithms with local search and adaptive mechanisms.

## How it works

1. **Population**: Maintains a population of solutions (routes).
2. **Genetic operators**: Selection, crossover, and mutation to create new solutions.
3. **Local search**: Each solution is improved with local search (e.g. relocate, exchange, 2-opt).
4. **Adaptive control**: Parameters adapt during the search.
5. **Stopping**: Stops after a maximum runtime or number of iterations.

## Parameters

- **runtime** (seconds): Time limit for the solver. Longer runtime usually yields better solutions.
- **seed**: Random seed for reproducibility.

## Time windows

PyVRP (and thus HGS) handles time windows natively: arrival time at each customer is computed, and waiting is allowed if the vehicle arrives before the ready time. Late arrivals are penalized or forbidden depending on the model.

## When to use

HGS is one of the best-performing algorithms for VRPTW on Solomon benchmarks. Prefer it when solution quality is the priority and you can afford a few minutes of runtime.
