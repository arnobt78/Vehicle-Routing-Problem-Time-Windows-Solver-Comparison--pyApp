"""
Instance Loader for Simulated Annealing (SA)

This module defines the data structures (Customer, Vehicle, Instance) used by
the SA algorithm. These classes encapsulate the problem data and provide
methods for solution construction and manipulation.

Key Classes:
- Customer: Represents a customer location with demand and time window
- Vehicle: Represents a vehicle that can serve customers along a route
- Instance: Represents the complete problem with multiple vehicles and customers

Author: Arnob Mahmud
"""

from math import ceil
import random

from sa.util import distance


class Customer:
    """
    Represents a customer in the VRPTW problem.
    
    Each customer has:
    - Location (x, y coordinates)
    - Demand (load to be delivered/picked up)
    - Time window (ready_time to due_date: when service can start)
    - Service time (time required to serve the customer)
    - Status (whether it's been served and by which vehicle)
    
    The time window constraint is critical: service must start between
    ready_time and due_date. If the vehicle arrives early, it must wait.
    """
    def __init__(self, cust_no, x, y, demand, ready_time, due_date, service_time):
        """
        Initialize a customer.
        
        Parameters
        ----------
        cust_no : int
            Customer ID (0 = depot, 1+ = customers)
        x, y : float
            Coordinates of customer location
        demand : float
            Customer demand (load to be delivered)
        ready_time : float
            Earliest time service can start (time window start)
        due_date : float
            Latest time service can start (time window end)
        service_time : float
            Time required to serve this customer
        """
        self.cust_no = cust_no
        self.x = x
        self.y = y
        self.demand = demand
        self.ready_time = ready_time
        self.due_date = due_date
        self.service_time = service_time
        self.is_served = False      # Whether this customer has been assigned to a route
        self.vehicle_num = None     # ID of vehicle serving this customer (if served)

    def copy(self):
        return Customer(self.cust_no, self.x, self.y, self.demand, self.ready_time, self.due_date, self.service_time)

    def served(self, vehicle_num):
        self.is_served = True
        self.vehicle_num = vehicle_num

    def unserve(self):
        self.is_served = False
        self.vehicle_num = None

    def __str__(self):
        return f'Customer NO. : {self.cust_no}; X : {self.x}; Y : {self.y}; Demand : {self.demand}; Ready Time : {self.ready_time}; Due Date : {self.due_date}; Service Time : {self.service_time}; Vehichle num: {self.vehicle_num}'

    def __eq__(self, other):
        return self.cust_no == other.cust_no

class Vehicle:
    """
    Represents a vehicle that can serve customers along a route.
    
    A vehicle:
    - Starts and ends at the depot
    - Has a capacity limit (maximum load it can carry)
    - Maintains a route (sequence of customers to visit)
    - Tracks current location, capacity, and time
    
    Key constraints checked:
    1. Capacity: Vehicle cannot exceed max_capacity
    2. Time windows: Service must start within customer's time window
    3. Depot deadline: Vehicle must return to depot before depot closes
    """
    def __init__(self, id, depo, max_capacity, min_capacity=0):
        """
        Initialize a vehicle.
        
        Parameters
        ----------
        id : int
            Vehicle identifier
        depo : Customer
            Depot object (where vehicle starts and ends)
        max_capacity : float
            Maximum load capacity of the vehicle
        min_capacity : float, default=0
            Minimum capacity threshold (used for optimization)
        """
        self.id = id
        self.x = depo.x                    # Current x-coordinate (starts at depot)
        self.y = depo.y                    # Current y-coordinate (starts at depot)
        self.max_capacity = max_capacity   # Maximum load capacity
        self.min_capacity = min_capacity   # Minimum capacity threshold
        self.capacity = max_capacity        # Current remaining capacity
        self.last_service_time = 0         # Time when last service completed
        self.service_route = [(depo, 0)]   # Route: list of (customer, arrival_time) tuples
        self.total_distance = 0             # Total distance traveled so far
        self.depo = depo                   # Reference to depot

    def serve_customer(self, customer):
        """
        Attempt to serve a customer, checking all VRPTW constraints.
        
        This is a critical method that enforces all problem constraints:
        1. Time window: Service must start between ready_time and due_date
        2. Capacity: Vehicle must have enough capacity for customer demand
        3. Depot deadline: Vehicle must be able to return to depot on time
        
        Parameters
        ----------
        customer : Customer
            Customer to serve
            
        Returns
        -------
        bool
            True if customer can be served (all constraints satisfied)
            False if constraints would be violated
            
        Notes
        -----
        - If vehicle arrives early, it waits until ready_time
        - Service time is added after arrival
        - Vehicle position and capacity are updated if service succeeds
        - Route and distance are updated
        """
        # ====================================================================
        # CONSTRAINT CHECK 1: Time Window and Capacity
        # ====================================================================
        # Check if service can start within customer's time window
        # Arrival time = current time + travel time to customer
        # Service must start between ready_time and due_date
        # Also check if vehicle has enough capacity
        arrival_time = ceil(distance(customer, self)) + self.last_service_time
        time_window_ok = customer.ready_time <= arrival_time <= customer.due_date
        capacity_ok = self.capacity > customer.demand  # Note: > not >= (strict)
        
        if not time_window_ok or not capacity_ok:
            return False
        
        # ====================================================================
        # CONSTRAINT CHECK 2: Can Return to Depot on Time
        # ====================================================================
        # After serving customer, vehicle must be able to return to depot
        # before depot closes (depot.due_date)
        # Total time = arrival + service + return travel time
        total_time = arrival_time + customer.service_time + distance(customer, self.depo)
        if self.depo.due_date < total_time:
            return False
        
        # ====================================================================
        # ALL CONSTRAINTS SATISFIED - SERVE THE CUSTOMER
        # ====================================================================
        # Calculate travel distance
        dist = distance(customer, self)
        
        # Update vehicle position (move to customer location)
        self.x = customer.x
        self.y = customer.y
        
        # Update capacity (subtract customer demand)
        self.capacity -= customer.demand
        
        # Update time (add travel time, wait if needed, add service time)
        # ceil() rounds up travel time to integer
        self.last_service_time += ceil(dist)
        # Add customer to route with arrival time
        self.service_route += [(customer, self.last_service_time)]
        # Add service time
        self.last_service_time += customer.service_time
        
        # Mark customer as served
        customer.served(self.id)
        
        # Update total distance traveled
        self.total_distance += dist
        
        # If capacity drops below minimum threshold, return to depot
        # (This is an optimization to encourage route completion)
        if self.capacity < self.min_capacity:
            self.return_home()
        
        return True

    def serve_customer_force(self, customer):
        if customer.ready_time > ceil(distance(customer, self)) + self.last_service_time:
            last_service_time = self.last_service_time
            self.last_service_time = customer.ready_time - ceil(distance(customer, self))
            if self.serve_customer(customer):
                return True
            else:
                self.last_service_time = last_service_time
        return False

    def return_home(self):
        if self.x != self.depo.x or self.y != self.depo.y:
            self.capacity = self.max_capacity
            self.last_service_time += ceil(distance(self, self.depo))
            self.service_route += [(self.depo, self.last_service_time)]
            self.total_distance += distance(self, self.depo)
            self.x = self.depo.x
            self.y = self.depo.y

    def remove_customer(self, customer):
        customer_idx = [route_node[0] for route_node in self.service_route].index(customer)
        del self.service_route[customer_idx]
        self.capacity += customer.demand
        customer.unserve()

        for i, (curr_customer, curr_time) in enumerate(self.service_route[customer_idx :]):
            prev_customer, prev_time = self.service_route[customer_idx + i - 1]
            new_time = prev_time + prev_customer.service_time + ceil(distance(prev_customer, curr_customer))
            new_time = max(new_time, curr_customer.ready_time)
            self.service_route[customer_idx + i] = (curr_customer, new_time)
            
        next_customer = self.service_route[customer_idx][0]
        prev_customer = self.service_route[customer_idx - 1][0]
        self.total_distance -= (distance(customer, next_customer) + distance(customer, prev_customer))
        self.total_distance += distance(prev_customer, next_customer)
        self.last_service_time = self.service_route[-1][1]

        self.reset_vehicle_used()

    def try_to_serve_customer(self, new_customer):
        if len(self.service_route) == 1:
            return self.serve_customer(new_customer) or self.serve_customer_force(new_customer)
        shuffled = list(range(1, len(self.service_route)))
        random.shuffle(shuffled)
        for i in shuffled:
            vehicle = Vehicle(self.id, self.depo, self.max_capacity, self.min_capacity)
            vehicle.hard_reset_vehicle()
            index = i
            should_use_route = True
            new_customer.is_served = False
            for e, (customer, curr_time) in enumerate(self.service_route[1:]):
                if e + 1 == index:
                    if not vehicle.serve_customer(new_customer):
                        if not vehicle.serve_customer_force(new_customer):
                            should_use_route = False
                            break
                if not vehicle.serve_customer(customer):
                    if not vehicle.serve_customer_force(customer):
                        should_use_route = False
                        break
            if not should_use_route or not new_customer.is_served:
                new_customer.is_served = False
                continue
            self.service_route = vehicle.service_route[:]
            self.last_service_time = vehicle.last_service_time
            self.capacity = vehicle.capacity
            self.total_distance = vehicle.total_distance
            return True
        return False

    def hard_reset_vehicle(self):
        self.service_route = [(self.depo, 0)]
        self.last_service_time = 0
        self.capacity = self.max_capacity
        self.total_distance = 0

    def reset_vehicle_used(self):
        if self.service_route[0] == self.service_route[1]:
            self.hard_reset_vehicle()

    def __str__(self):
        return f'self.id = {self.id}; x={self.x}; y={self.y}; capacity={self.capacity}; last_service_time={self.last_service_time}; {self.service_route}'


def all_served(customers, b=False):
    result = True
    for c in customers:
        if not c.is_served:
            if b:
                print(c)
            result = False

    return result

class Instance:
    def __init__(self, num_vehicles, capacity, customer_list):
        assert (
            num_vehicles > 0 and capacity > 0
        ), f'Number of vehicles and their capacity must be positive! {num_vehicles}, {capacity}'
        self.num_vehicles = num_vehicles
        self.capacity = capacity

        
        depo = customer_list[0]
        self.vehicles = [Vehicle(i, depo, capacity) for i in range(num_vehicles)]
        assert (
            customer_list[0].cust_no == 0 and customer_list[0].ready_time == 0 and customer_list[0].demand == 0
        ), f'Customer list must contain depot with customer number 0!'
        self.customer_list = [customer_list[0]] + sorted(customer_list[1:], key=lambda c: c.ready_time)

    def __getitem__(self, key):
        return self.customer_list[key]

    def sort_by_ready_time(self):
        self.customer_list.sort(key=lambda c: c.ready_time)

    def find_initial_solution(self):
        """
        Construct an initial feasible solution using a greedy heuristic.
        
        This method is called before running Simulated Annealing to provide
        a starting solution. The heuristic:
        1. Uses vehicles one by one
        2. For each vehicle, tries to add customers greedily
        3. Customers are sorted by: distance + ready_time (closer and earlier first)
        4. Tries normal service first, then forced service if needed
        5. Continues until all customers are served or no more can be added
        
        The solution may not be optimal, but it provides a starting point
        for the SA algorithm to improve upon.
        
        Algorithm:
        - For each vehicle:
          - While vehicle can serve more customers:
            - Sort unserved customers by (distance + ready_time)
            - Try to serve each customer (respecting constraints)
            - If no customer can be served normally, try forced service
            - If still no customer can be served, move to next vehicle
          - If all customers served, stop
        - Return all vehicles to depot
        - Verify all customers are served
        
        Notes
        -----
        - This is a constructive heuristic (builds solution from scratch)
        - It prioritizes nearby customers and early time windows
        - The solution quality affects SA's starting point
        - If not all customers can be served, the problem may be infeasible
        """
        # Try to assign customers to each vehicle
        for i, v in enumerate(self.vehicles):
            # Keep trying to add customers to this vehicle
            while True:
                # ============================================================
                # SORT CUSTOMERS BY PRIORITY
                # ============================================================
                # Sort by: distance from vehicle + ready_time
                # This prioritizes:
                # - Nearby customers (lower distance)
                # - Customers with early time windows (lower ready_time)
                # This is a common greedy strategy for VRPTW
                self.customer_list.sort(key = lambda c: distance(c, v) + c.ready_time)
                
                found = False
                
                # ============================================================
                # TRY NORMAL SERVICE (RESPECTING ALL CONSTRAINTS)
                # ============================================================
                # Try to serve each unserved customer in priority order
                for customer in self.customer_list:
                    # Skip already served customers and depot
                    if customer.is_served or customer.cust_no == 0:
                        continue

                    # Try to serve customer (checks all constraints)
                    if v.serve_customer(customer):
                        found = True
                        break  # Successfully added a customer, try to add more

                # ============================================================
                # TRY FORCED SERVICE (IF NORMAL SERVICE FAILED)
                # ============================================================
                # If no customer could be served normally, try forced service
                # Forced service may wait longer or be less optimal, but ensures
                # we can serve more customers
                if not found:
                    for customer in self.customer_list:
                        if customer.is_served or customer.cust_no == 0:
                            continue

                        # Try forced service (may adjust timing to fit constraints)
                        if v.serve_customer_force(customer):
                            found = True
                            break

                # ============================================================
                # NO MORE CUSTOMERS CAN BE ADDED TO THIS VEHICLE
                # ============================================================
                # If we couldn't add any customer, this vehicle is done
                if not found:
                    break

            # Restore customer list order (by customer number)
            self.customer_list.sort(key = lambda c: c.cust_no)
            
            # Check if all customers are served (skip depot at index 0)
            if all_served(self.customer_list[1:]):
                break  # All customers served, no need for more vehicles
        
        # Restore final customer list order
        self.customer_list.sort(key = lambda c: c.cust_no)

        # ====================================================================
        # RETURN ALL VEHICLES TO DEPOT
        # ====================================================================
        # Complete the routes by returning vehicles to depot
        # This updates distances and times
        for vehicle in self.vehicles:
            if vehicle.last_service_time == 0:
                continue  # Vehicle wasn't used, skip
            vehicle.return_home()
        
        # ====================================================================
        # VERIFY SOLUTION COMPLETENESS
        # ====================================================================
        # Check if all customers were successfully served
        # If not, the problem might be infeasible or need more vehicles
        if not all_served(self.customer_list[1:], True):
            print("Not all vehicles has been served!\n")


    def generate_random_neighbour(self):
        #rand_cust = self.customer_list[random.randint(1, len(self.customer_list) - 1)]
        rand_cust = random.choices(self.customer_list[1:], [1./len(self.vehicles[c.vehicle_num].service_route) for c in self.customer_list[1:]], k = 1)[0]
        current_serving_vehicle = self.vehicles[rand_cust.vehicle_num]
        current_serving_vehicle.remove_customer(rand_cust)
        v = None
        while not rand_cust.is_served:
            if self.get_neighbour(rand_cust):
                return
            self.get_neighbour(rand_cust, True)

    def get_neighbour(self, customer, force=False):
        shuffled = [i for i in range(0, len(self.vehicles) - 1)]
        random.shuffle(shuffled)
        for vehicle_num in shuffled:
            vehicle = self.vehicles[vehicle_num]
            if force or vehicle.last_service_time != 0:
                if vehicle.try_to_serve_customer(customer):
                    return True

    def get_output(self):
        dist = 0
        result = ""
        i = 1
        for vehicle in self.vehicles:
            if vehicle.last_service_time == 0:
                continue
            vehicle.return_home()
            dist += vehicle.total_distance
            result += f'{i}: '
            for node in vehicle.service_route:
                result += f'{node[0].cust_no}({node[1]})->'
            result = result[:-2] + '\n'
            i += 1

        print("vehicle count: ", i-1)
        print("distance: ", dist)
        return f'{i-1}\n {result}{dist}\n '
    
    def get_solution(self):
        routes = []
        for vehicle in self.vehicles:
            if vehicle.last_service_time == 0:
                continue
            vehicle.return_home()
            route = []
            for node in vehicle.service_route:
                if node[0].cust_no != vehicle.depo.cust_no:
                    route.append(node[0].cust_no)
            routes.append(route)
        return routes
    
    def get_total_distance(self):
        dist = 0
        for vehicle in self.vehicles:
            if vehicle.last_service_time == 0:
                continue
            vehicle.return_home()
            dist += vehicle.total_distance
        return dist

    def get_total_distance_and_vehicles(self):
        dist = 0
        vehicles_used = 0
        for vehicle in self.vehicles:
            if vehicle.last_service_time == 0:
                continue
            vehicle.return_home()
            vehicles_used += 1
            dist += vehicle.total_distance
        return dist, vehicles_used

    def __str__(self):
        return self.get_output()

def load_from_file(filepath):
    i = 0
    customer_list = []
    num_vehicles = 0
    capacity = 0

    with open(filepath) as f:
        line = f.readline()
        while line:
            if not line.strip(): # skip empty lines
                line = f.readline()
                continue

            if i == 3: # number of vehicles and capacity
                params = [int(p) for p in line.split()]
                num_vehicles = params[0]
                capacity = params[1]
            elif i >= 6: # customer info
                params = [int(p) for p in line.split()]
                customer_list.append(Customer(*params))

            i += 1
            line = f.readline()

    return Instance(num_vehicles, capacity, customer_list)