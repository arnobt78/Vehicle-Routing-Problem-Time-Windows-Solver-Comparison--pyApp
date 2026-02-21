/** Persists selected dataset and algorithm on the Solver page (no persistence across reload). */
import { create } from "zustand";

interface SolverState {
  selectedDataset: string | null;
  selectedAlgo: string | null;
  setSelectedDataset: (name: string | null) => void;
  setSelectedAlgo: (name: string | null) => void;
}

export const useSolverStore = create<SolverState>((set) => ({
  selectedDataset: null,
  selectedAlgo: null,
  setSelectedDataset: (name) => set({ selectedDataset: name }),
  setSelectedAlgo: (name) => set({ selectedAlgo: name }),
}));
