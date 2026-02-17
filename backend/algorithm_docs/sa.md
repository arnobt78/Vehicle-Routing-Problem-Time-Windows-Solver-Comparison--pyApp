# Simulated Annealing (SA)

## Overview

Simulated annealing is a probabilistic metaheuristic inspired by annealing in metallurgy. It allows occasional acceptance of worse solutions to escape local optima, with acceptance probability decreasing over time (temperature).

## How it works

1. **Initial solution**: Start from a feasible solution (e.g. from a greedy heuristic).
2. **Temperature**: Start with a high temperature T (e.g. 700).
3. **Neighbor**: Generate a neighbor solution (e.g. swap two customers, move a customer to another route).
4. **Acceptance**: If the neighbor is better, accept it. If worse, accept with probability exp(-delta / T), where delta is the increase in cost.
5. **Cooling**: Reduce temperature (e.g. T = 0.9999 * T).
6. **Stopping**: Stop when temperature falls below a threshold (e.g. 0.01).

## Parameters

- **init_temp**: Initial temperature. Higher values allow more exploration early.
- **cooling_rate**: Multiplier per step (e.g. 0.9999). Slower cooling usually improves solution quality but increases runtime.

## Time windows

SA for VRPTW uses a neighbor generator that produces only feasible moves (respecting capacity and time windows), or penalizes infeasible solutions in the objective so the search tends toward feasible ones.

## When to use

SA is simple to implement and tune. It can find good solutions and is useful when you want a balance between implementation effort and solution quality. Results may vary between runs due to randomness.
