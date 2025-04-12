## VRPTW-Solver-Comparison-pyApp

## The Comparison results of different NP metahuristic algorithms for VRPTW

Running Algorithms on dataset: rc108.txt

- - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - -

Best-Known Solution (BKS) Route Cost: 1114.2

BKS solution:

Route #1: 2 6 7 8 46 4 45 5 3 1 100

Route #2: 12 14 47 17 16 15 13 9 11 10

Route #3: 33 32 30 28 26 27 29 31 34 93

Route #4: 41 42 44 43 40 38 37 35 36 39

Route #5: 61 81 94 71 72 54 96

Route #6: 64 51 76 89 18 48 19 20 66

Route #7: 65 83 57 24 22 49 21 23 25 77

Route #8: 69 98 88 53 78 73 79 60 55 70 68

Route #9: 82 99 52 86 87 59 97 75 58 74

Route #10: 90

Route #11: 92 95 67 62 50 63 85 84 56 91 80

- - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - -

Hybrid Genetic Search (HGS) Route Cost: 1114.2

HGS solution:

Route #1: 12 14 47 17 16 15 13 9 11 10 

Route #2: 82 99 52 86 87 59 97 75 58 74 

Route #3: 65 83 57 24 22 49 21 23 25 77 

Route #4: 64 51 76 89 18 48 19 20 66 

Route #5: 92 95 67 62 50 63 85 84 56 91 80 

Route #6: 33 32 30 28 26 27 29 31 34 93 

Route #7: 61 81 94 71 72 54 96 

Route #8: 41 42 44 43 40 38 37 35 36 39 

Route #9: 2 6 7 8 46 4 45 5 3 1 100 

Route #10: 90 

Route #11: 69 98 88 53 78 73 79 60 55 70 68 

- - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - -

Guided Local Search (GLS) Route Cost: 1266.9

GLS solution:

Route #1: 71 72 44 43 40 38 37 35 36 39

Route #2: 98 82 90 53 78 73 79 2 60

Route #3: 92 67 32 30 28 26 27 29 31 34 93

Route #4: 65 99 24 22 20 49 21 23 25 77

Route #5: 95 51 76 89 33 50 62 91 80

Route #6: 12 14 47 17 16 15 13 9 11 10

Route #7: 88 6 7 8 46 4 45 5 3 1 100 55

Route #8: 69 70 61 81 94 96 54 41 42 68

Route #9: 83 52 57 86 87 59 97 75 58 74

Route #10: 64 19 48 18 63 85 84 56 66

- - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - -

Ant Colony Optimization (ACO) Route Cost: 1321.8459204561746

ACO solution:

Route #1: 69 98 88 82 99 52 86 74 57 83 66 91

Route #2: 65 64 51 76 89 85 63 62 56 80

Route #3: 90 53 73 79 78 60 55 68

Route #4: 33 28 30 32 34 31 29 27 26

Route #5: 72 71 93 94 81 61 54 96 100 70

Route #6: 2 45 5 8 7 6 46 4 3 1

Route #7: 41 42 44 38 39 40 36 35 37 43

Route #8: 19 21 23 18 48 49 22 20 24 25

Route #9: 12 14 47 17 16 15 11 10 9 13

Route #10: 59 58 87 97 75 77

Route #11: 92 95 84 50 67

- - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - -

Simulated Annealing (SA) Route Cost: 1237.620141359753

SA solution:

Route #1: 7 8 46 4 45 5 3 1 100 55

Route #2: 64 51 76 89 63 85 84 56 91

Route #3: 69 98 53 12 15 16 17 47 14

Route #4: 90 82 9 13 11 10

Route #5: 61 42 44 40 39 38 37 35 36 43

Route #6: 65 52 86 77 25 23 57

Route #7: 88 60 78 73 79 6 2 70 68

Route #8: 92 67 62 34 50 94 96

Route #9: 99 87 59 97 75 58 74

Route #10: 83 24 22 19 18 48 21 49 20 66

Route #11: 81 93 71 72 41 54

Route #12: 95 33 32 30 28 26 27 29 31 80

- - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - -

Algorithms - - No. of Routes - - Costs - - Gap(%) - - Runtime(seconds)

  BKS - - - - - - 11 - - - - - - - - - - 1114.2 - - -	-

  HGS - - - - - - 11 - - - - - - - - - - 1114.2 - - 0.0 - - - - 300.137736082077

  GLS - - - - - - 10 - - - - - - - - - - 1266.9 - - 13.7 - -- - 300.0492959022522

  ACO - - - - - - 11 - - - - - - - - - - 1321.8 - - 18.63 - - - 877.1980187892914

  SA - - -- - - - 12 - - - - - - - - - - 1237.6 - - 11.08 - - - 416.80780506134033

- - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - - - - -

![3 HGS rc108](https://github.com/user-attachments/assets/afac9be9-37a1-4b4d-a7f8-5d346d653e2f) ![3 GLS rc108](https://github.com/user-attachments/assets/b8140b7f-30c2-4f65-9d55-24207754dd0f) ![3 ACO rc108](https://github.com/user-attachments/assets/3643d0e9-c3d4-418c-8ed7-efea8d94ede9) ![3 SA rc108](https://github.com/user-attachments/assets/3632158b-6131-4157-97bd-9cd4116bcecf)

# VRPTW Solver Comparison

This project is a comprehensive comparison of various algorithms for solving the **Vehicle Routing Problem with Time Windows (VRPTW)**. It implements and compares multiple heuristic and metaheuristic algorithms, including:

- **Hybrid Genetic Search (HGS)**
- **Guided Local Search (GLS)**
- **Ant Colony Optimization (ACO)**
- **Simulated Annealing (SA)**

The project was developed as part of a master's thesis and provides tools to evaluate and visualize the performance of these algorithms on benchmark datasets.

---

## Project Structure

### Key Files and Directories

- **`main.py`**: The main script to run the project. It orchestrates the execution of all algorithms and generates results.
- **`solver.ipynb`**: A Jupyter Notebook for running and visualizing the algorithms interactively.
- **`aco/`**: Contains the implementation of Ant Colony Optimization.
- **`gls/`**: Contains the implementation of Guided Local Search.
- **`sa/`**: Contains the implementation of Simulated Annealing.
- **`hgs/`**: Contains the implementation of Hybrid Genetic Search.
- **`bks.py`**: Reads and processes the Best Known Solution (BKS) for comparison.
- **`plot.py`**: Contains utilities for visualizing solutions and routes.
- **`data/`**: Contains benchmark datasets in Solomon format (`.txt`) and their corresponding Best Known Solutions (`.sol`).
- **`requirements.txt`**: Lists the Python dependencies required to run the project.

---

## Algorithms Overview

### 1. **Hybrid Genetic Search (HGS)**
HGS is a metaheuristic algorithm inspired by genetic algorithms. It uses a population of solutions that evolve over time through selection, crossover, and mutation. The implementation leverages the **`pyvrp`** library.

- **Key Features**:
  - Supports Solomon benchmark instances.
  - Configurable stopping criteria: `MaxRuntime` or `MaxIterations`.

- **Code Example**:
  ```python
  from pyvrp import Model, read
  from pyvrp.stop import MaxRuntime

  def solve_with_hgs(input_path, runtime):
      INSTANCE = read(input_path, instance_format="solomon", round_func="trunc1")
      model = Model.from_data(INSTANCE)
      result = model.solve(stop=MaxRuntime(runtime), seed=0)

      print("HGS cost:", result.cost() / 10)
      print("HGS solution:")
      print(result.best)

      routes = [route.visits() for route in result.best.get_routes()]
      return routes, round(result.cost() / 10, 1)
  ```

### 2. **Guided Local Search (GLS)**
GLS enhances local search by penalizing frequently used solution components, encouraging exploration of less-visited areas of the solution space.

- **Key Features**:
  - Uses OR-Tools for routing and optimization.
  - Configurable time limits for solving.

- **Code Example**:
  ```python
  from gls.base_solver import Solver
  from gls.instance_loader import load_instance

  def solve_with_gls(input_path, runtime):
      data = load_instance(input_path, time_precision_scaler=10)
      solver = Solver(data, time_precision_scaler=10)
      solver.create_model()
      solver.solve_model({"time_limit": runtime})

      routes = solver.get_solution()
      cost = solver.get_solution_travel_time()
      return routes, round(cost, 1)
  ```

### 3. **Ant Colony Optimization (ACO)**
ACO is inspired by the behavior of ants searching for food. It uses pheromone trails to guide the search for optimal solutions.

- **Key Features**:
  - Iterative improvement based on pheromone updates.
  - Suitable for combinatorial optimization problems.

### 4. **Simulated Annealing (SA)**
SA is a probabilistic technique that explores the solution space by accepting worse solutions with a decreasing probability over time.

- **Key Features**:
  - Configurable initial temperature and cooling schedule.
  - Simple and effective for VRPTW.

---

## How to Run the Project

### 1. **Setup the Environment**
1. Create a virtual environment:
   ```sh
   python -m venv .venv
   ```
2. Activate the virtual environment:
   - On Linux/Mac:
     ```sh
     source .venv/bin/activate
     ```
   - On Windows:
     ```sh
     .venv\Scripts\activate
     ```
3. Install the required dependencies:
   ```sh
   pip install -r requirements.txt
   ```

### 2. **Run the Main Script**
Execute the main script to run all algorithms and generate results:
```sh
python main.py
```

### 3. **Run the Jupyter Notebook**
For interactive exploration and visualization:
```sh
jupyter notebook solver.ipynb
```

---

## Visualizing Results

The project generates visualizations of the routes for each algorithm. These are plotted using `matplotlib` and can be customized in the `plot.py` file.

---

## Addressing the HGS Question

### Problem: Same Solution for Different Stopping Criteria
The issue arises because the **`pyvrp`** library uses a fixed random seed (`seed=0`) in the `solve` function. This ensures reproducibility but results in the same solution for the same instance, regardless of the stopping criteria.

### Solution:
To introduce variability, modify the `seed` parameter to a random value or remove it entirely:
```python
from random import randint

result = model.solve(stop=MaxRuntime(runtime), seed=randint(0, 1000))
```

Alternatively, you can experiment with different stopping criteria:
- **MaxRuntime**: Limits the runtime of the algorithm.
- **MaxIterations**: Limits the number of iterations.

### Example Output:
For the provided instance, the HGS algorithm produces the following solution:
```
Hybrid Genetic Search (HGS) Route Cost: 1114.2

HGS solution:
Route #1: 12 14 47 17 16 15 13 9 11 10
Route #2: 82 99 52 86 87 59 97 75 58 74
...
```

---

## Contact

For further questions or issues, feel free to reach out.

Best regards,  

Arnob

arnob_t78@yahoo.com
