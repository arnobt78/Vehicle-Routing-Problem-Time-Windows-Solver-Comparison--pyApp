# Iterated Local Search (ILS)

## Overview

ILS is a metaheuristic that repeatedly applies local search from perturbed solutions. It is implemented in PyVRP (v0.13+) as an alternative to the older HGS-style solver.

## How it works

1. **Initial solution**: Build an initial solution (e.g. greedy or from a previous run).
2. **Local search**: Improve the solution to a local optimum using moves (relocate, exchange, 2-opt, etc.).
3. **Perturbation**: Apply a perturbation to escape the local optimum (e.g. destroy and repair a part of the solution).
4. **Repeat**: From the perturbed solution, run local search again. Accept the new solution based on some criterion (e.g. always accept better; accept worse with a probability or threshold).
5. **Stopping**: Stop after a time limit or number of iterations.

## Parameters

- **runtime** (seconds): Time limit.
- **seed**: Random seed for reproducibility.

## Time windows

ILS in PyVRP respects time windows the same way as HGS: time is propagated along routes, and waiting at customers is allowed when arriving before the ready time.

## When to use

ILS is available when using PyVRP 0.13 or later (separate from the HGS stack). It is a strong baseline and often compares well to genetic algorithms on VRPTW benchmarks.
