/**
 * Educational FAQ content for VRPTW Solver — based on MSc thesis and standard literature.
 */

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  icon?: string;
};

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "np",
    question: "What is an NP problem?",
    answer: `NP (Nondeterministic Polynomial time) refers to the class of decision problems for which a proposed solution can be verified in polynomial time. An NP-hard problem is at least as hard as the hardest problems in NP — no known algorithm can solve it in polynomial time for all instances.

The Vehicle Routing Problem (VRP) and its variants are NP-hard. This means as the number of customers grows, exact methods become impractical. For a 100-customer instance, the solution space is astronomically large, so we rely on heuristics and metaheuristics to find good solutions in reasonable time.`,
  },
  {
    id: "heuristic",
    question: "What is a heuristic?",
    answer: `A heuristic is a practical rule or shortcut that produces a "good enough" solution quickly, without guaranteeing optimality. Heuristics are problem-specific and use domain knowledge.

Examples for routing:
• Nearest Neighbor: Always go to the closest unvisited customer
• Savings heuristic (Clark-Wright): Greedily merge routes to minimize total distance
• Insertion heuristics: Build routes by inserting customers where cost increase is minimal

Heuristics are fast but often get stuck in local optima — solutions that cannot be improved by small changes but are not globally best.`,
  },
  {
    id: "metaheuristic",
    question: "What is a metaheuristic?",
    answer: `A metaheuristic is a high-level strategy that guides a search process to explore the solution space effectively. Unlike simple heuristics, metaheuristics include mechanisms to escape local optima and balance exploration (trying new regions) vs. exploitation (refining good solutions).

Common metaheuristic concepts:
• Population-based: Maintain multiple solutions (e.g., genetic algorithms, ant colony)
• Single-solution: Improve one solution with perturbations (e.g., simulated annealing, iterated local search)
• Hybrid: Combine multiple strategies (e.g., Hybrid Genetic Search)

Metaheuristics do not guarantee optimality but often produce near-optimal solutions for large NP-hard instances.`,
  },
  {
    id: "direct",
    question: "What are direct/exact algorithms?",
    answer: `Direct or exact algorithms guarantee finding the optimal solution. Examples include:
• Branch-and-bound: Systematically explore the solution space with pruning
• Dynamic programming: Build optimal solutions from optimal sub-solutions
• Mixed Integer Linear Programming (MILP): Model the problem as equations and solve with solvers (e.g., Gurobi, CPLEX)

Exact methods work well for small instances but become impractical for large problems. A 100-customer VRPTW can take hours or days to solve exactly. That is why metaheuristics are preferred for real-world routing applications.`,
  },
  {
    id: "solomon",
    question: "What is the Solomon benchmark?",
    answer: `The Solomon benchmark is a set of 56 standard, 100-node instances designed by Marius Solomon in 1987 to test algorithms for the Vehicle Routing Problem with Time Windows (VRPTW).

The instances are classified by:
• Geographical distribution (letter prefix): C = Clustered, R = Random, RC = Random-Clustered
• Scheduling horizon (number suffix): 1 = Short horizon (narrow time windows, small capacity), 2 = Long horizon (wide time windows, large capacity)

Summary: C101–C109 (clustered, narrow), C201–C208 (clustered, wide), R101–R112 (random, narrow), R201–R211 (random, wide), RC101–RC108 (mixed, narrow), RC201–RC208 (mixed, wide). Type 1 stresses time windows; Type 2 stresses vehicle capacity. RC-type is often considered most realistic. Gehring & Homberger (1996) extended these to 200–1000 nodes.`,
  },
  {
    id: "vrp",
    question: "What is the Vehicle Routing Problem (VRP)?",
    answer: `The Vehicle Routing Problem asks: given a depot and a set of customers with demands, how do we design routes for a fleet of vehicles so that every customer is served exactly once, capacity constraints are respected, and total travel distance (or cost) is minimized?

Classic VRP assumes:
• All vehicles start and end at the depot
• Each customer has a demand; vehicle capacity cannot be exceeded
• The objective is typically to minimize total distance or number of vehicles

VRP is one of the most studied problems in operations research due to its wide applicability in logistics, delivery, and supply chain.`,
  },
  {
    id: "vrptw",
    question: "What is VRPTW (Vehicle Routing Problem with Time Windows)?",
    answer: `VRPTW extends VRP by adding time windows: each customer has an earliest and latest time when service can begin. Vehicles must arrive within this window (or wait if early).

Formally, for each customer i: [e_i, l_i] — earliest and latest service start times. The depot also has a time window.

This adds realism (e.g., delivery appointments) but makes the problem harder. Metaheuristics like HGS, ILS, ACO, GLS, and SA are commonly used to solve VRPTW. The Solomon benchmark is the standard test set.`,
  },
  {
    id: "hgs",
    question: "What is Hybrid Genetic Search (HGS)?",
    answer: `HGS combines a genetic algorithm (population-based evolution) with local search. It maintains a population of solutions, applies crossover and mutation to create offspring, improves them with local search (e.g., relocate, 2-opt, exchange moves), and selects the best for the next generation.

Key ideas:
• Population diversity prevents premature convergence
• Local search intensifies around promising regions
• Adaptive parameters control exploration vs. exploitation

HGS is implemented in PyVRP (versions before 0.13) and is known for finding excellent solutions on Solomon instances.`,
  },
  {
    id: "ils",
    question: "What is Iterated Local Search (ILS)?",
    answer: `ILS is a metaheuristic that repeatedly: (1) perturb the current solution, (2) apply local search to improve it, (3) accept or reject the new solution (e.g., only if better, or with a criterion like in simulated annealing).

Formula: repeat { s' = Perturb(s); s'' = LocalSearch(s'); s = Accept(s, s''); }

ILS is single-solution, memory-light, and effective for many combinatorial problems. PyVRP 0.13+ replaced HGS with an ILS implementation.`,
  },
  {
    id: "aco",
    question: "What is Ant Colony Optimization (ACO)?",
    answer: `ACO mimics ant foraging: ants deposit pheromone on paths; shorter paths get more pheromone and attract more ants. In VRPTW, "ants" build routes probabilistically. The probability of choosing customer j from i depends on pheromone τ_ij and heuristic η_ij (e.g., inverse distance).

Update rule: τ_ij ← (1−ρ)τ_ij + Δτ (evaporation + reinforcement)

Parameters: ρ (evaporation), β (heuristic weight), q0 (exploitation probability). ACO balances exploration and exploitation and often performs well on routing problems.`,
  },
  {
    id: "sa",
    question: "What is Simulated Annealing (SA)?",
    answer: `SA mimics metal cooling: start at high "temperature" T, allow worse moves with probability exp(−Δ/T); decrease T over time. This lets the search escape local optima early, then converge.

Acceptance: P(accept worse) = exp(−Δ/T), where Δ = cost increase.

Cooling schedule: T_{k+1} = α·T_k (e.g., α ≈ 0.999). SA is simple, flexible, and works for many optimization problems. For VRPTW, neighbor moves include relocate, exchange, 2-opt.`,
  },
  {
    id: "gls",
    question: "What is Guided Local Search (GLS)?",
    answer: `GLS augments the objective with penalties on "features" that appear in local optima. When stuck, it penalizes those features, which modifies the landscape and pushes the search elsewhere.

For routing, features might be "arc (i,j) used" or "customer i visited by route r". Penalty: cost += λ·penalty_i for feature i in current solution.

GLS is implemented in Google OR-Tools and is effective for VRP/VRPTW. It uses a hierarchical objective: minimize vehicles first, then total distance.`,
  },
  {
    id: "ml",
    question: "Can machine learning solve VRPTW?",
    answer: `ML can assist in VRPTW by learning heuristics, predicting good initial solutions, or guiding search. However, pure ML approaches struggle to guarantee feasibility and often underperform compared to traditional methods on large instances.

ML is best used in a hybrid way:
• Learn heuristics for specific instance types
• Predict promising regions of the solution space
• Guide metaheuristic parameters dynamically

For now, ML complements rather than replaces classical optimization techniques in VRPTW.`,
  },
  {
    id: "realworld",
    question: "How is VRPTW solved in the real world?",
    answer: `In practice, companies use a mix of exact methods, heuristics, and metaheuristics depending on their needs:
• Small instances (up to ~50 customers): exact solvers (MILP, CP)
• Medium instances (50–200 customers): metaheuristics (HGS, ILS, ACO)
• Large instances (>200 customers): heuristics or hybrid approaches

Real-world constraints (e.g., driver shifts, traffic) often require custom modeling. Many companies use commercial solvers (Gurobi, CPLEX) or open-source libraries (Google OR-Tools) with tailored heuristics to find good solutions efficiently.`,
  },
  {
    id: "future",
    question: "What is the future of VRPTW research?",
    answer: `Future research directions include:
• Include more metaheuristics algorithms (e.g., Tabu Search, Genetic Algorithms, Particle Swarm Optimization) in the comparison and explore their performance on the Solomon benchmark.
• Better algorithms for large-scale instances (thousands of customers)
• Integration of real-time data (traffic, orders) for dynamic routing
• Hybrid approaches combining ML and optimization
• More realistic modeling of constraints (e.g., stochastic demand, multi-depot)
• Benchmarking on larger, more complex datasets beyond Solomon

The field continues to evolve with advances in algorithms, computing power, and data availability.`,
  },
  {
    id: "resources",
    question: "Where can I learn more about VRPTW?",
    answer: `Key resources:
• "The Vehicle Routing Problem" by Toth & Vigo (2014) — comprehensive textbook
• Solomon (1987) — original VRPTW benchmark paper
• Gehring & Homberger (1996) — extended benchmarks
• PyVRP documentation and source code — practical implementation of HGS and ILS
• Google OR-Tools documentation — GLS and other optimization tools
• Research papers on metaheuristics for VRPTW (e.g., HGS, ILS, ACO, SA)

Online courses in combinatorial optimization and operations research also cover these topics in depth. All research papers are nicely summarized in the MSc thesis in <a href="/results">Experiment Results (View Test Results & Research Papers)</a> page that inspired this project.`,
  },
  {
    id: "contact",
    question: "How can I contact the developer?",
    answer: `Feel free to reach out via email at <a href="mailto:contact@arnobmahmud.com">contact@arnobmahmud.com</a>.
    and visit my personal portfolio website at <a href="https://www.arnobmahmud.com">www.arnobmahmud.com</a> for more projects and contact information.
    I welcome feedback, questions, or suggestions for improving the VRPTW Solver!`,
  },
];
