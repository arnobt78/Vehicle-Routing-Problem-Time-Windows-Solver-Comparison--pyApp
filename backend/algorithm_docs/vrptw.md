# Vehicle Routing Problem with Time Windows (VRPTW)

## Definition

VRPTW extends the classic Vehicle Routing Problem (VRP) by adding time windows: each customer must be served within a given time interval [ready_time, due_time]. The depot also has an operating time window. The objective is typically to minimize total travel distance or number of vehicles while respecting capacity and time-window constraints.

## Constraints

- **Capacity**: Each vehicle has a maximum load; the sum of demands on a route cannot exceed it.
- **Time windows**: Service at each customer must start within [ready_time, due_time]. Arriving early implies waiting.
- **Depot**: All routes start and end at the depot; depot has its own time window.

## Solomon benchmark

The Solomon benchmark (1987) defines 56 instances of 100 customers. Instance names encode type:

- **C (Clustered)**: Customers in geographic clusters; narrow (C1xx) or wide (C2xx) time windows.
- **R (Random)**: Randomly distributed customers; narrow (R1xx) or wide (R2xx) time windows.
- **RC (Mixed)**: Mix of clustered and random; narrow (RC1xx) or wide (RC2xx) time windows.

Type 1 (xx1–xx9/xx8): narrow time windows, smaller vehicle capacity. Type 2: wider windows, larger capacity.

## Complexity

VRP and VRPTW are NP-hard. Exact methods do not scale; metaheuristics (genetic algorithms, local search, ant colony, simulated annealing, etc.) are used in practice.
