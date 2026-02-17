/** Algorithm IDs used in API and internal state */
export const ALGO_IDS = ["aco", "gls", "sa", "hgs", "ils"] as const;
export type AlgoId = (typeof ALGO_IDS)[number];

/** User-friendly full names for display */
export const ALGO_DISPLAY_NAMES: Record<AlgoId, string> = {
  aco: "Ant Colony Optimization",
  gls: "Guided Local Search",
  hgs: "Hybrid Genetic Search",
  ils: "Iterated Local Search",
  sa: "Simulated Annealing",
};

export function getAlgoDisplayName(id: AlgoId | string): string {
  return ALGO_DISPLAY_NAMES[id as AlgoId] ?? id.toUpperCase();
}
