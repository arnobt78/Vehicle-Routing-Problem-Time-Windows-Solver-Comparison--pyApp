# Ant Colony Optimization (ACO)

## Overview

ACO is a population-based metaheuristic inspired by ant foraging. Ants deposit pheromone on paths; pheromone guides future ants while evaporation prevents stagnation.

## How it works

1. **Graph**: The problem is modeled as a graph (nodes = depot + customers; edges have distance and time).
2. **Ants**: Multiple "ants" construct solutions by moving from node to node, choosing the next customer probabilistically based on pheromone and heuristic information (e.g. distance, time-window urgency).
3. **Constraints**: Each ant respects capacity and time windows; when capacity or time is exceeded, it returns to the depot and starts a new route.
4. **Pheromone update**: After all ants have built solutions, pheromone is evaporated and then reinforced on edges used by good solutions (e.g. best or top-k).
5. **Local search**: Optional local search is applied to improve ant solutions before pheromone update.

## Parameters

- **ants_num**: Number of ants per iteration (e.g. 30). More ants improve exploration but increase runtime.
- **beta**: Weight of heuristic information vs pheromone. Higher beta emphasizes distance/urgency.
- **q0**: Probability of choosing the best next move (exploitation) vs probabilistic choice (exploration).
- **rho**: Pheromone evaporation rate. Higher rho means faster forgetting of old trails.
- **runtime_minutes**: Time limit in minutes.

## Time windows

ACO for VRPTW typically uses a heuristic that favors customers with tighter time windows or earlier due times to avoid infeasibility. The construction phase checks time-window feasibility when appending the next customer.

## When to use

ACO is good for exploration and can find diverse solutions. It is often used in hybrid systems (e.g. MACS — Multiple Ant Colony System) that combine one colony minimizing distance and another minimizing the number of vehicles.
