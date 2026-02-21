/** Persists latest compare result (dataset, rows, BKS, explanation) for "Last saved result" and optional restore on Compare page. */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isFresh, PERSIST_SCHEMA_VERSION } from "@/stores/persistConfig";

export type CompareCompletedRow = {
  algo: string;
  status: string;
  routes: number;
  cost: number | null;
  runtime: number | null;
  gap: number | null;
};

export type CompareCompletedResult = {
  version: number;
  savedAt: number;
  dataset: string;
  rows: CompareCompletedRow[];
  bksCost: number | null;
  bksRouteCount: number | null;
  explanation: string | null;
};

type CompareResultState = {
  latestCompleted: CompareCompletedResult | null;
  setLatestCompleted: (
    payload: Omit<CompareCompletedResult, "version" | "savedAt">,
  ) => void;
  clearLatestCompleted: () => void;
  getLatestIfFresh: () => CompareCompletedResult | null;
};

function isCompareCompletedResult(
  value: CompareCompletedResult | null,
): value is CompareCompletedResult {
  if (!value) return false;
  if (typeof value.dataset !== "string" || !value.dataset) return false;
  if (typeof value.savedAt !== "number" || !isFresh(value.savedAt))
    return false;
  if (!Array.isArray(value.rows)) return false;
  return true;
}

export const useCompareResultStore = create<CompareResultState>()(
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
        if (!isCompareCompletedResult(latest)) {
          if (latest != null) set({ latestCompleted: null });
          return null;
        }
        return latest;
      },
    }),
    {
      name: "compare-latest-result-v1",
      version: PERSIST_SCHEMA_VERSION,
      migrate: () => ({ latestCompleted: null }),
      partialize: (state) => ({ latestCompleted: state.latestCompleted }),
    },
  ),
);
