import numpy as np
import random
from aco.vprtw_aco_figure import VrptwAcoFigure
from aco.vrptw_base import VrptwGraph, PathMessage
from aco.ant import Ant
from threading import Thread
from queue import Queue
import time


class BasicACO:
    def __init__(
        self,
        graph: VrptwGraph,
        ants_num=10,
        max_iter=200,
        beta=2,
        q0=0.1,
        whether_or_not_to_show_figure=True,
    ):
        super()
        # Graph node location and service time information
        self.graph = graph
        # ants_num: Number of ants
        self.ants_num = ants_num
        # max_iter maximum number of iterations
        self.max_iter = max_iter
        # vehicle_capacity represents the maximum load capacity of each vehicle
        self.max_load = graph.vehicle_capacity
        # The Importance of Beta Heuristics
        self.beta = beta
        # q0 represents the probability of directly choosing the next point with the highest probability
        self.q0 = q0
        # best path
        self.best_path_distance = None
        self.best_path = None
        self.best_vehicle_num = None

        self.whether_or_not_to_show_figure = whether_or_not_to_show_figure

    def run_basic_aco(self):
        # Start a separate thread to run _basic_aco, and use the main thread for drawing
        path_queue_for_figure = Queue()
        basic_aco_thread = Thread(target=self._basic_aco, args=(path_queue_for_figure,))
        basic_aco_thread.start()

        # Whether to display the figure
        if self.whether_or_not_to_show_figure:
            figure = VrptwAcoFigure(self.graph.nodes, path_queue_for_figure)
            figure.run()
        basic_aco_thread.join()

        # Pass None as the end marker
        # if self.whether_or_not_to_show_figure:
        #     path_queue_for_figure.put(PathMessage(None, None))

    def _basic_aco(self, path_queue_for_figure: Queue):
        """
        The most basic ant colony algorithm
        :return:
        """
        start_time_total = time.time()

        # Maximum number of iterations
        start_iteration = 0
        for iter in range(self.max_iter):
            # Set the current vehicle load, current travel distance, and current time for each ant
            ants = list(Ant(self.graph) for _ in range(self.ants_num))
            for k in range(self.ants_num):
                # Ant Group needs to visit all customers
                while not ants[k].index_to_visit_empty():
                    next_index = self.select_next_index(ants[k])
                    # Determine if the constraints are still met after adding the element to that position. If not, select the element again and perform the check
                    if not ants[k].check_condition(next_index):
                        next_index = self.select_next_index(ants[k])
                        if not ants[k].check_condition(next_index):
                            next_index = 0

                    # Update ant paths
                    ants[k].move_to_next_index(next_index)
                    self.graph.local_update_pheromone(ants[k].current_index, next_index)

                # Finally returned to position 0
                ants[k].move_to_next_index(0)
                self.graph.local_update_pheromone(ants[k].current_index, 0)

            # Calculate the path length of all ants
            paths_distance = np.array([ant.total_travel_distance for ant in ants])

            # Record the current best path      
            best_index = np.argmin(paths_distance)
            if (
                self.best_path is None
                or paths_distance[best_index] < self.best_path_distance
            ):
                self.best_path = ants[int(best_index)].travel_path
                self.best_path_distance = paths_distance[best_index]
                self.best_vehicle_num = self.best_path.count(0) - 1
                start_iteration = iter

                # Graphical display
                # if self.whether_or_not_to_show_figure:
                #     path_queue_for_figure.put(
                #         PathMessage(self.best_path, self.best_path_distance)
                #     )

                print("\n")
                print(
                    "[iteration %d]: find a improved path, its distance is %f"
                    % (iter, self.best_path_distance)
                )
                print(
                    "it takes %0.3f second multiple_ant_colony_system running"
                    % (time.time() - start_time_total)
                )

            # Update pheromone table
            self.graph.global_update_pheromone(self.best_path, self.best_path_distance)

            given_iteration = 100
            if iter - start_iteration > given_iteration:
                print("\n")
                print(
                    "iteration exit: can not find better solution in %d iteration"
                    % given_iteration
                )
                break

        print("\n")
        print(
            "final best path distance is %f, number of vehicle is %d"
            % (self.best_path_distance, self.best_vehicle_num)
        )
        print(
            "it takes %0.3f second multiple_ant_colony_system running"
            % (time.time() - start_time_total)
        )
    
    def get_best_route(self):
        routes = []
        route = []
        if self.best_path is None:
            return routes
        for node in self.best_path:
            if node != 0:
                route.append(node)
            else:
                if route:
                    routes.append(route)
                    route = []
        return routes


    def select_next_index(self, ant):
        """
        Select the next node
        :param ant:
        :return:
        """
        current_index = ant.current_index
        index_to_visit = ant.index_to_visit

        transition_prob = self.graph.pheromone_mat[current_index][
            index_to_visit
        ] * np.power(
            self.graph.heuristic_info_mat[current_index][index_to_visit], self.beta
        )
        transition_prob = transition_prob / np.sum(transition_prob)

        if np.random.rand() < self.q0:
            max_prob_index = np.argmax(transition_prob)
            next_index = index_to_visit[max_prob_index]
        else:
            # Using the roulette wheel algorithm
            next_index = BasicACO.stochastic_accept(index_to_visit, transition_prob)
        return next_index

    @staticmethod
    def stochastic_accept(index_to_visit, transition_prob):
        """
        轮盘赌
        :param index_to_visit: a list of N index (list or tuple)
        :param transition_prob:
        :return: selected index
        """
        # calculate N and max fitness value
        N = len(index_to_visit)

        # normalize
        sum_tran_prob = np.sum(transition_prob)
        norm_transition_prob = transition_prob / sum_tran_prob

        # select: O(1)
        while True:
            # randomly select an individual with uniform probability
            ind = int(N * random.random())
            if random.random() <= norm_transition_prob[ind]:
                return index_to_visit[ind]
