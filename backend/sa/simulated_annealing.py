"""
Simulated annealing loop: neighbour generation, accept by improvement or Metropolis criterion, optional max_runtime_sec and should_stop.
When no_improvement_logs is set (natural run), stops after that many log intervals with no improvement in (distance, vehicles).
"""
import random
from copy import deepcopy
from math import exp
import time

counter = 0


def objective_function(num_vhcls, total_distance):
    global counter
    counter += 1
    return num_vhcls * total_distance


def sa_algorithm(
    instance,
    temp_start=350,
    update_temp=lambda t: 0.9999 * t,
    stop_criterion=lambda t: t <= 0.01,
    logger=None,
    log_every_seconds=2.0,
    max_runtime_sec=None,
    should_stop=None,
    no_improvement_logs: int | None = None,
):
    curr_solution = incumb_solution = deepcopy(instance)
    # print("Inside sa: ", instance.get_total_distance_and_vehicles())
    curr_dist, curr_vhcls = (
        incumb_dist,
        incumb_vhcls,
    ) = curr_solution.get_total_distance_and_vehicles()

    temp = temp_start

    start = time.time()
    last_log_time = start
    iter_count = 0
    afterOneMin, cOneMin = None, 0
    afterFiveMin, cFiveMin = None, 0
    total = None
    incumb_vhcls_o = objective_function(incumb_vhcls, incumb_dist)
    last_logged_incumb = (incumb_dist, incumb_vhcls)
    no_improvement_log_count = 0

    while not stop_criterion(temp):
        if should_stop is not None and callable(should_stop) and should_stop():
            break
        if max_runtime_sec is not None and (time.time() - start) >= max_runtime_sec:
            break
        iter_count += 1
        # print(temp, incumb_vhcls, incumb_dist)
        neighbour = deepcopy(curr_solution)
        neighbour.generate_random_neighbour()

        neighbour_dist, neighbour_vhcls = neighbour.get_total_distance_and_vehicles()

        curr_sol_o = objective_function(curr_vhcls, curr_dist)
        neigh_sol_o = objective_function(neighbour_vhcls, neighbour_dist)

        if neigh_sol_o < curr_sol_o or random.random() < exp(
            -(abs(curr_sol_o - neigh_sol_o)) / temp
        ):
            curr_solution = neighbour
            curr_dist, curr_vhcls = neighbour_dist, neighbour_vhcls

            if objective_function(curr_vhcls, curr_dist) < incumb_vhcls_o:
                incumb_solution = curr_solution
                incumb_dist, incumb_vhcls = curr_dist, curr_vhcls
                incumb_vhcls_o = objective_function(incumb_vhcls, incumb_dist)

        temp = update_temp(temp)
        if logger and (time.time() - last_log_time) >= log_every_seconds:
            elapsed = time.time() - start
            logger(
                f"SA iter {iter_count}: best_cost={incumb_dist:.2f}, "
                f"vehicles={incumb_vhcls}, temp={temp:.4f}, elapsed={elapsed:.1f}s"
            )
            last_log_time = time.time()
            # Early stop: no improvement for N consecutive log lines (only when no fixed runtime)
            if no_improvement_logs is not None:
                if (incumb_dist, incumb_vhcls) == last_logged_incumb:
                    no_improvement_log_count += 1
                    if no_improvement_log_count >= no_improvement_logs:
                        if logger:
                            logger(
                                f"SA: stopping after {no_improvement_logs} log intervals with no improvement"
                            )
                        break
                else:
                    no_improvement_log_count = 0
                    last_logged_incumb = (incumb_dist, incumb_vhcls)
        if not afterOneMin and time.time() - start >= 60:
            afterOneMin, cOneMin = deepcopy(incumb_solution), counter
        if not afterFiveMin and time.time() - start >= 5 * 60:
            afterFiveMin, cFiveMin = deepcopy(incumb_solution), counter

    if not afterOneMin:
        afterOneMin = incumb_solution
    if not afterFiveMin:
        afterFiveMin = incumb_solution

    # print("Algo Time:", time.time() - start)
    return [
        (afterOneMin, cOneMin),
        (afterFiveMin, cFiveMin),
        (incumb_solution, counter),
    ]
