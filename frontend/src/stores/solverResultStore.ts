import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isFresh, PERSIST_SCHEMA_VERSION } from "@/stores/persistConfig";

export type SolverCompletedResult = {
  version: number;
  savedAt: number;
  dataset: string;
  algo: string;
  params: Record<string, number>;
  result: { routes: number[][]; cost: number; runtime: number };
  jobId: string | null;
  logs?: string[];
  plotDataUrl?: string;
};

type SolverResultState = {
  latestCompleted: SolverCompletedResult | null;
  setLatestCompleted: (
    payload: Omit<SolverCompletedResult, "version" | "savedAt">,
  ) => void;
  clearLatestCompleted: () => void;
  getLatestIfFresh: () => SolverCompletedResult | null;
};

function isSolverCompletedResult(
  value: SolverCompletedResult | null,
): value is SolverCompletedResult {
  if (!value) return false;
  if (typeof value.dataset !== "string" || !value.dataset) return false;
  if (typeof value.algo !== "string" || !value.algo) return false;
  if (typeof value.savedAt !== "number" || !isFresh(value.savedAt))
    return false;
  if (!value.result || typeof value.result.cost !== "number") return false;
  if (!Array.isArray(value.result.routes)) return false;
  if (
    value.logs != null &&
    (!Array.isArray(value.logs) ||
      value.logs.some((line) => typeof line !== "string"))
  ) {
    return false;
  }
  if (value.plotDataUrl != null && typeof value.plotDataUrl != "string") {
    return false;
  }
  return true;
}

export const useSolverResultStore = create<SolverResultState>()(
  persist(
    (set, get) => ({
      latestCompleted: null,
      setLatestCompleted: (payload) =>
        set({
          latestCompleted: {
            ...payload,
            version: PERSIST_SCHEMA_VERSION,
            savedAt: Date.now(),
          },
        }),
      clearLatestCompleted: () => set({ latestCompleted: null }),
      getLatestIfFresh: () => {
        const latest = get().latestCompleted;
        if (!isSolverCompletedResult(latest)) {
          if (latest != null) set({ latestCompleted: null });
          return null;
        }
        return latest;
      },
    }),
    {
      name: "solver-latest-result-v1",
      version: PERSIST_SCHEMA_VERSION,
      migrate: () => ({ latestCompleted: null }),
      partialize: (state) => ({ latestCompleted: state.latestCompleted }),
    },
  ),
);
