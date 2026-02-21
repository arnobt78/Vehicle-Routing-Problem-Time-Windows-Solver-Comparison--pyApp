/**
 * Compare page: run all algorithms (HGS, GLS, ILS, ACO, SA) on one dataset.
 * Supports Default Tune (fixed defaults) or Custom Tune (per-algo params). Polls each job until done; optional ILS on separate backend.
 */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useDatasets } from "@/hooks/useDatasets";
import {
  getDataset,
  getResult,
  postCompare,
  postStopSolve,
  postSolve,
  postAiExplain,
  apiIls,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { getAlgoDisplayName } from "@/constants/algorithms";
import { toast } from "@/lib/toast";
import { useCompareResultStore } from "@/stores/compareResultStore";
import {
  RotateCw,
  RotateCcw,
  StopCircle,
  Timer,
  Sparkles,
  Loader2,
  GitCompare,
  Info,
  Waypoints,
} from "lucide-react";
import { useStopwatch } from "@/hooks/useStopwatch";
import { Skeleton } from "@/components/common/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type CompareRow = {
  algo: string;
  status: string;
  routes: number;
  cost: number | null;
  runtime: number | null;
  gap: number | null;
};

type CompareMode = "default" | "tuned";

type BenchmarkTuning = {
  hgsRuntime: number;
  glsRuntime: number;
  ilsRuntime: number;
  acoAntsNum: number;
  acoBeta: number;
  acoQ0: number;
  acoRho: number;
  acoRuntimeMinutes: number;
  saRuntimeMinutes: number;
  saInitTemp: number;
  saCoolingRate: number;
};

type BenchmarkTuningDraft = Record<keyof BenchmarkTuning, string>;
type TuningMessage = { text: string; kind: "info" | "warning" };
type CompareTuneSummary = {
  status: "edited" | "reset";
  lastFieldLabel: string;
  customFieldCount: number;
  savedAt: number;
};

const DEFAULT_BENCHMARK_TUNING: BenchmarkTuning = {
  hgsRuntime: 120,
  glsRuntime: 120,
  ilsRuntime: 120,
  acoAntsNum: 30,
  acoBeta: 0.9,
  acoQ0: 0.9,
  acoRho: 0.1,
  acoRuntimeMinutes: 15,
  saRuntimeMinutes: 15,
  saInitTemp: 700,
  saCoolingRate: 0.9999,
};

const TUNING_LIMITS: Record<
  keyof BenchmarkTuning,
  { min: number; max: number; label: string }
> = {
  hgsRuntime: { min: 10, max: 3600, label: "Hybrid Genetic Search runtime" },
  glsRuntime: { min: 10, max: 3600, label: "Guided Local Search runtime" },
  ilsRuntime: { min: 10, max: 3600, label: "Iterated Local Search runtime" },
  acoAntsNum: { min: 5, max: 200, label: "ACO number of ants" },
  acoBeta: { min: 0, max: 1, label: "ACO beta" },
  acoQ0: { min: 0, max: 1, label: "ACO Q0" },
  acoRho: { min: 0, max: 1, label: "ACO rho" },
  acoRuntimeMinutes: { min: 0.5, max: 120, label: "ACO runtime (minutes)" },
  saRuntimeMinutes: { min: 1, max: 120, label: "SA runtime (minutes)" },
  saInitTemp: { min: 10, max: 100000, label: "SA initial temperature" },
  saCoolingRate: { min: 0.8, max: 0.99999, label: "SA cooling rate" },
};

const createBenchmarkDraft = (
  values: BenchmarkTuning,
): BenchmarkTuningDraft => ({
  hgsRuntime: String(values.hgsRuntime),
  glsRuntime: String(values.glsRuntime),
  ilsRuntime: String(values.ilsRuntime),
  acoAntsNum: String(values.acoAntsNum),
  acoBeta: String(values.acoBeta),
  acoQ0: String(values.acoQ0),
  acoRho: String(values.acoRho),
  acoRuntimeMinutes: String(values.acoRuntimeMinutes),
  saRuntimeMinutes: String(values.saRuntimeMinutes),
  saInitTemp: String(values.saInitTemp),
  saCoolingRate: String(values.saCoolingRate),
});

const INPUT_STYLE =
  "w-full min-w-[200px] rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-base text-slate-900 shadow-lg";

function CompareSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-80" />
            <Skeleton className="h-4 w-[520px]" />
            <Skeleton className="h-4 w-[420px]" />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-10 w-60" />
          </div>
          <Skeleton className="h-11 w-44 rounded-lg" />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Compare() {
  const { data: datasets, isLoading } = useDatasets();
  const { setLatestCompleted, clearLatestCompleted, getLatestIfFresh } =
    useCompareResultStore();
  const [dataset, setDataset] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<CompareRow[]>([]);
  const [bksCost, setBksCost] = useState<number | null>(null);
  const [bksRouteCount, setBksRouteCount] = useState<number | null>(null);
  const [compareJobIds, setCompareJobIds] = useState<Record<
    string,
    string
  > | null>(null);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [compareMode, setCompareMode] = useState<CompareMode>("default");
  const [benchmarkTuningDraft, setBenchmarkTuningDraft] =
    useState<BenchmarkTuningDraft>(
      createBenchmarkDraft(DEFAULT_BENCHMARK_TUNING),
    );
  const [highlightedTuningKeys, setHighlightedTuningKeys] = useState<
    Partial<Record<keyof BenchmarkTuning, boolean>>
  >({});
  const [tuningWarnings, setTuningWarnings] = useState<
    Partial<Record<keyof BenchmarkTuning, TuningMessage>>
  >({});
  const [latestTuneSummary, setLatestTuneSummary] =
    useState<CompareTuneSummary | null>(null);
  const tuningWarningTimeoutsRef = useRef<
    Partial<Record<keyof BenchmarkTuning, ReturnType<typeof setTimeout>>>
  >({});
  const tuningHighlightTimeoutsRef = useRef<
    Partial<Record<keyof BenchmarkTuning, ReturnType<typeof setTimeout>>>
  >({});
  const [explainLoading, setExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [hydratedSnapshot, setHydratedSnapshot] = useState(false);
  const { formatted } = useStopwatch(running);
  const total = rows.length;
  const completed = rows.filter(
    (r) => r.status !== "running" && r.status !== "pending",
  ).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const hasAnimatedRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const canRunCompare = !!dataset && !running;
  const canStopCompare = running && compareJobIds != null;
  const disabledCompareReason = running
    ? "Algorithms are currently running"
    : !dataset
      ? "Select dataset first"
      : null;
  const disabledStopReason = !running
    ? "No algorithm is running"
    : !compareJobIds
      ? "No active jobs to stop"
      : null;

  const getStatusClass = (status: string) => {
    if (status === "completed") return "text-green-600";
    if (status === "stopped") return "text-rose-600";
    if (status === "running" || status === "pending") return "text-amber-600";
    return "text-rose-600";
  };

  const getGapClass = (gap: number | null) => {
    if (gap == null) return "text-slate-600";
    if (gap <= 1) return "text-green-600";
    if (gap <= 5) return "text-violet-600";
    if (gap <= 10) return "text-orange-600";
    if (gap <= 15) return "text-amber-600";
    return "text-rose-600";
  };

  const bksDisplay =
    bksCost != null
      ? `${bksCost} (${bksRouteCount != null ? bksRouteCount : "-"})`
      : "-";

  const validateTuningField = (key: keyof BenchmarkTuning, raw: string) => {
    const trimmed = raw.trim();
    const { min, max } = TUNING_LIMITS[key];

    if (trimmed === "") {
      const emptyMessage =
        key === "acoRuntimeMinutes" || key === "saRuntimeMinutes"
          ? "Leave empty to run until the algorithm stops naturally."
          : `Input is empty. Baseline ${DEFAULT_BENCHMARK_TUNING[key]} will be used if left empty.`;
      return { kind: "info" as const, text: emptyMessage };
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      return { kind: "warning" as const, text: "Please enter a valid number." };
    }

    if (parsed < min || parsed > max) {
      return {
        kind: "warning" as const,
        text: `Out of range. Allowed: ${min} to ${max}.`,
      };
    }

    return null;
  };

  const getTuningWarningClass = (kind: "info" | "warning") =>
    kind === "info" ? "text-sky-600" : "text-rose-600";

  const countCustomTuneOverrides = (draft: BenchmarkTuningDraft) => {
    const keys = Object.keys(DEFAULT_BENCHMARK_TUNING) as Array<
      keyof BenchmarkTuning
    >;
    let count = 0;
    keys.forEach((key) => {
      const raw = (draft[key] ?? "").trim();
      if (raw === "") return;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return;
      if (parsed !== DEFAULT_BENCHMARK_TUNING[key]) count += 1;
    });
    return count;
  };

  const applyTuningInput = <K extends keyof BenchmarkTuning>(
    key: K,
    raw: string,
  ) => {
    // For ACO/SA runtime, treat empty or "0" as empty (natural run); show blank in UI.
    const normalized =
      (key === "acoRuntimeMinutes" || key === "saRuntimeMinutes") &&
      (raw.trim() === "" || raw.trim() === "0")
        ? ""
        : raw;

    const warning = validateTuningField(key, normalized);

    setBenchmarkTuningDraft((prev) => {
      const next = { ...prev, [key]: normalized };
      if (!warning) {
        setLatestTuneSummary({
          status: "edited",
          lastFieldLabel: TUNING_LIMITS[key].label,
          customFieldCount: countCustomTuneOverrides(next),
          savedAt: Date.now(),
        });
      }
      return next;
    });

    const timeoutId = tuningWarningTimeoutsRef.current[key];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete tuningWarningTimeoutsRef.current[key];
    }

    if (warning) {
      setTuningWarnings((prev) => ({ ...prev, [key]: warning }));
      tuningWarningTimeoutsRef.current[key] = setTimeout(() => {
        setTuningWarnings((prev) => {
          if (!prev[key]) return prev;
          const next = { ...prev };
          delete next[key];
          return next;
        });
        delete tuningWarningTimeoutsRef.current[key];
      }, 5000);
      return;
    }

    setTuningWarnings((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resolveBenchmarkTuning = (): BenchmarkTuning | null => {
    const resolved = { ...DEFAULT_BENCHMARK_TUNING };

    const keys = Object.keys(DEFAULT_BENCHMARK_TUNING) as Array<
      keyof BenchmarkTuning
    >;
    for (const key of keys) {
      const raw = (benchmarkTuningDraft[key] ?? "").trim();
      const { min, max, label } = TUNING_LIMITS[key];

      if (raw === "") {
        resolved[key] = DEFAULT_BENCHMARK_TUNING[key];
        continue;
      }

      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        toast.error("Invalid tuned value", `${label} must be a valid number.`);
        return null;
      }

      if (parsed < min || parsed > max) {
        toast.error(
          "Invalid tuned value",
          `${label} must be between ${min} and ${max}.`,
        );
        return null;
      }

      resolved[key] = parsed;
    }

    return resolved;
  };

  useEffect(() => {
    if (hydratedSnapshot) return;
    const snapshot = getLatestIfFresh();
    if (snapshot) {
      setDataset(snapshot.dataset);
      setRows(snapshot.rows);
      setBksCost(snapshot.bksCost);
      setBksRouteCount(snapshot.bksRouteCount);
      setExplanation(snapshot.explanation);
    }
    setHydratedSnapshot(true);
  }, [hydratedSnapshot, getLatestIfFresh]);

  useEffect(() => {
    if (running) return;
    if (!dataset || rows.length === 0) return;
    const allCompleted = rows.every((row) => row.status === "completed");
    if (!allCompleted) return;

    setLatestCompleted({
      dataset,
      rows,
      bksCost,
      bksRouteCount,
      explanation,
    });
  }, [
    running,
    dataset,
    rows,
    bksCost,
    bksRouteCount,
    explanation,
    setLatestCompleted,
  ]);

  useEffect(() => {
    const timeouts = tuningWarningTimeoutsRef.current;
    const highlightTimeouts = tuningHighlightTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach((timeoutId) => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      Object.values(highlightTimeouts).forEach((timeoutId) => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, []);

  const flashTuningKeys = (keys: Array<keyof BenchmarkTuning>) => {
    if (!keys.length) return;

    setHighlightedTuningKeys((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        next[key] = true;
      });
      return next;
    });

    keys.forEach((key) => {
      const existing = tuningHighlightTimeoutsRef.current[key];
      if (existing) clearTimeout(existing);
      tuningHighlightTimeoutsRef.current[key] = setTimeout(() => {
        setHighlightedTuningKeys((prev) => {
          if (!prev[key]) return prev;
          const next = { ...prev };
          delete next[key];
          return next;
        });
        delete tuningHighlightTimeoutsRef.current[key];
      }, 1200);
    });
  };

  const getTuningInputClass = (key: keyof BenchmarkTuning) =>
    cn(
      "mt-1 w-full rounded-lg border border-slate-300 px-2 py-2.5 text-base text-slate-600",
      highlightedTuningKeys[key] &&
        "ring-2 ring-sky-400 border-sky-400 animate-pulse",
    );

  const handleCompareModeChange = (mode: CompareMode) => {
    setCompareMode(mode);
  };

  useEffect(() => {
    if (
      !running &&
      rows.length > 0 &&
      !hasAnimatedRef.current &&
      tableBodyRef.current
    ) {
      hasAnimatedRef.current = true;
      const rowsEl = tableBodyRef.current.querySelectorAll("tr");
      if (rowsEl.length) {
        gsap.fromTo(
          rowsEl,
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out",
          },
        );
      }
    }
    if (running) hasAnimatedRef.current = false;
  }, [running, rows.length]);

  const POLL_INTERVAL_MS = 2500;
  /** Max wait per GET /results/{job_id} so one slow/hung request doesn't block the whole round. */
  const POLL_REQUEST_TIMEOUT_MS = 8000;

  const fetchResults = async (
    jobIds: Record<string, string>,
    bks: number | null,
  ) => {
    const algos = Object.keys(jobIds);
    const results: CompareRow[] = algos.map((a) => ({
      algo: a,
      status: "running",
      routes: 0,
      cost: null,
      runtime: null,
      gap: null,
    }));
    setRows(results);

    const applyJobToRow = (
      row: CompareRow,
      r: {
        status: string;
        result?: { routes: number[][]; cost: number; runtime: number } | null;
        error?: string;
      },
    ): CompareRow => {
      const res = r.result;
      const gap =
        bks != null && res?.cost != null
          ? Math.round(((100 * (res.cost - bks)) / bks) * 100) / 100
          : null;
      return {
        ...row,
        status: r.status,
        routes: res?.routes?.length ?? 0,
        cost: res?.cost ?? null,
        runtime: res?.runtime ?? null,
        gap,
      };
    };

    const runningAlgos = new Set(algos);
    let ilsFetchFailCount = 0;
    const ILS_FETCH_FAIL_THRESHOLD = 3;

    while (runningAlgos.size > 0 && !stopRequestedRef.current) {
      // Poll only jobs still running; each request has a timeout so one hung request
      // doesn't block the round. When a job returns completed/failed/stopped we remove
      // it from runningAlgos so we stop polling that job_id.
      const jobPromises = Array.from(runningAlgos).map(async (algo) => {
        const jobId = jobIds[algo];
        return Promise.race([
          getResult(jobId, algo).then((data) => ({ algo, data, error: null })),
          new Promise<{
            algo: string;
            data: null;
            error: unknown;
          }>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  algo,
                  data: null,
                  error: new Error("Poll timeout"),
                }),
              POLL_REQUEST_TIMEOUT_MS,
            ),
          ),
        ]).catch((err) => ({ algo, data: null, error: err }));
      });
      const outcomes = await Promise.all(jobPromises);

      const jobs: Record<
        string,
        {
          status: string;
          result?: { routes: number[][]; cost: number; runtime: number } | null;
          error?: string;
        }
      > = {};
      for (const { algo, data, error } of outcomes) {
        if (error) {
          if (algo === "ils" && apiIls != null) {
            ilsFetchFailCount += 1;
            if (ilsFetchFailCount >= ILS_FETCH_FAIL_THRESHOLD) {
              jobs[algo] = {
                status: "failed",
                error:
                  "Could not reach ILS backend. Check VITE_ILS_API_URL and CORS.",
              };
              runningAlgos.delete(algo);
            }
          }
          continue;
        }
        if (data) {
          ilsFetchFailCount = 0;
          jobs[algo] = {
            status: data.status,
            result: data.result ?? null,
            error: data.error,
          };
          if (["completed", "failed", "stopped"].includes(data.status)) {
            runningAlgos.delete(algo);
          }
        }
      }

      setRows((prev) =>
        prev.map((row) => {
          const j = jobs[row.algo];
          if (j == null) return row;
          return applyJobToRow(row, j);
        }),
      );

      if (runningAlgos.size > 0 && !stopRequestedRef.current) {
        await new Promise((x) => setTimeout(x, POLL_INTERVAL_MS));
      }
    }
    setRunning(false);
  };

  const handleExplain = async () => {
    if (!dataset || rows.length === 0) return;
    setExplainLoading(true);
    setExplanation(null);
    try {
      const res = await postAiExplain(
        dataset,
        rows.map((r) => ({
          algo: r.algo,
          status: r.status,
          cost: r.cost,
          runtime: r.runtime,
          routes: r.routes,
          gap: r.gap,
        })),
      );
      if (res.error) {
        toast.error("Explain failed", res.error);
        return;
      }
      if (res.explanation) setExplanation(res.explanation);
    } catch {
      toast.error("Explain failed", "Could not reach AI service");
    } finally {
      setExplainLoading(false);
    }
  };

  const handleStopCompare = async () => {
    if (!compareJobIds) {
      setShowStopDialog(false);
      return;
    }

    stopRequestedRef.current = true;
    setShowStopDialog(false);

    const entries = Object.entries(compareJobIds);
    await Promise.allSettled(
      entries.map(([algo, jobId]) => postStopSolve(jobId, algo)),
    );

    setRows((prev) =>
      prev.map((row) =>
        row.status === "running" || row.status === "pending"
          ? { ...row, status: "stopped" }
          : row,
      ),
    );
    setRunning(false);
    toast.info(
      "Stop requested",
      "Benchmark stop was requested for running algorithms.",
    );
  };

  /** Start compare: POST /solve/compare with (default or custom) params; if Option A, start ILS on ILS backend and merge job_ids; then poll until all complete. */
  const handleCompare = async () => {
    if (!dataset) return;

    const tunedValues =
      compareMode === "tuned" ? resolveBenchmarkTuning() : null;
    if (compareMode === "tuned" && !tunedValues) {
      return;
    }

    setRunning(true);
    stopRequestedRef.current = false;
    toast.info(
      `Starting benchmark on ${dataset}`,
      "Running all 5 algorithms in parallel",
    );
    try {
      const ds = await getDataset(dataset);
      const bks = ds.bks_cost ?? null;
      setBksCost(ds.bks_cost ?? null);
      setBksRouteCount(ds.bks_routes?.length ?? null);

      const compareParams =
        compareMode === "tuned" && tunedValues
          ? (() => {
              const acoRaw = (
                benchmarkTuningDraft.acoRuntimeMinutes ?? ""
              ).trim();
              const acoRmin =
                acoRaw !== "" && Number(acoRaw) > 0 ? Number(acoRaw) : null;
              const saRaw = (
                benchmarkTuningDraft.saRuntimeMinutes ?? ""
              ).trim();
              const saRmin =
                saRaw !== "" && Number(saRaw) > 0 ? Number(saRaw) : null;
              return {
                hgs: { runtime: tunedValues.hgsRuntime },
                gls: { runtime: tunedValues.glsRuntime },
                ils: { runtime: tunedValues.ilsRuntime },
                aco: {
                  ants_num: tunedValues.acoAntsNum,
                  beta: tunedValues.acoBeta,
                  q0: tunedValues.acoQ0,
                  rho: tunedValues.acoRho,
                  runtime_minutes: acoRmin,
                },
                sa: {
                  init_temp: tunedValues.saInitTemp,
                  cooling_rate: tunedValues.saCoolingRate,
                  runtime_minutes: saRmin,
                },
              };
            })()
          : { sa: { runtime_minutes: 15 }, aco: { runtime_minutes: 15 } };

      const compareRuntime =
        compareMode === "tuned" && tunedValues
          ? Math.max(
              tunedValues.hgsRuntime,
              tunedValues.glsRuntime,
              tunedValues.ilsRuntime,
            )
          : 120;

      let job_ids: Record<string, string> = (
        await postCompare(dataset, compareRuntime, compareParams)
      ).job_ids;
      // When using two backends (Option A), main backend may not run ILS; start ILS on ILS backend and merge.
      if (apiIls != null && job_ids.ils == null) {
        const ilsRuntime =
          compareMode === "tuned" && tunedValues ? tunedValues.ilsRuntime : 120;
        const ilsParams =
          compareMode === "tuned" && tunedValues
            ? { runtime: tunedValues.ilsRuntime }
            : undefined;
        const { job_id } = await postSolve(
          "ils",
          dataset,
          ilsRuntime,
          ilsParams,
        );
        job_ids = { ...job_ids, ils: job_id };
      }
      setCompareJobIds(job_ids);
      await fetchResults(job_ids, bks);
      if (stopRequestedRef.current) {
        toast.info(
          "Benchmark stopped",
          "Some algorithms were stopped before completion.",
        );
      } else {
        toast.success(
          "Benchmark complete",
          "All algorithms finished. Check the table for results.",
        );
      }
    } catch (err) {
      console.error("Compare benchmark error:", err);
      toast.error("Benchmark failed", "Could not run comparison");
    } finally {
      setRunning(false);
      setCompareJobIds(null);
      stopRequestedRef.current = false;
    }
  };

  if (isLoading) {
    return <CompareSkeleton />;
  }

  const cachedSnapshot = getLatestIfFresh();

  return (
    <div className="space-y-6">
      {/* Controls card */}
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-start gap-4">
          <div className="self-start rounded-lg bg-sky-100 p-4">
            <GitCompare className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Multi-Algorithm Benchmark Configuration
            </h2>
            <p className="text-base text-slate-500">
              Run all five algorithms (HGS, GLS, ACO, SA (using v0.6.3 backend
              container), ILS (using v0.13+ backend container)) on one dataset
              at once and compare cost, routes, and runtime. Allow at least
              10–20 minutes for a full run—or more if ACO or SA run with no time
              limit (if you keep runtime empty for ACO or SA, they run until
              they stop naturally—or after 250 s with no improvement in cost or
              vehicles; otherwise they run for the time limit you set). Choose a
              dataset and click &quot;Run Algorithms&quot;; when done, check the
              results table and use &quot;Explain results&quot; for AI insights.
              For quick tests, use smaller instances such as C101, R101, or
              RC101 (100 customers).
            </p>
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          {cachedSnapshot ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              <span>
                Last saved result: {cachedSnapshot.dataset} ·{" "}
                {new Date(cachedSnapshot.savedAt).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={clearLatestCompleted}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Clear
              </button>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-base font-medium text-slate-700">
              Select Multi-Algorithm Benchmark Mode
            </span>
            <div className="flex w-full gap-1 rounded-lg bg-slate-100 p-1 shadow-lg">
              <button
                type="button"
                onClick={() => handleCompareModeChange("default")}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-base font-medium transition-colors",
                  compareMode === "default"
                    ? "bg-sky-100 text-sky-800 shadow-lg"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                Default Tune (Fair Baseline)
              </button>
              <button
                type="button"
                onClick={() => handleCompareModeChange("tuned")}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center rounded-lg px-5 py-2.5 text-base font-medium transition-colors",
                  compareMode === "tuned"
                    ? "bg-violet-100 text-violet-800 shadow-lg"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                Custom Tune (Research/Experiment)
              </button>
            </div>
          </div>

          {compareMode === "default" && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">
                      Default Tune (Fair Baseline)
                    </span>{" "}
                    runs all 5 algorithms with fixed baseline values so results
                    stay comparable across datasets.
                  </p>
                  <p className="text-amber-800">
                    Baseline defaults: Hybrid Genetic Search runtime = 120s;
                    Guided Local Search runtime = 120s; Iterated Local Search
                    runtime = 120s; Ant Colony Optimization number of ants = 30,
                    beta = 0.9, Q0 (exploit probability) = 0.9, pheromone
                    evaporation (rho) = 0.1, runtime = 15 minutes; Simulated
                    Annealing runtime = 900s (15 min), initial temperature =
                    700, cooling rate = 0.9999.
                  </p>
                  <p className="text-amber-800">
                    To change these defaults globally, update backend Python
                    configuration. For per-run experiments, switch to{" "}
                    <span className="font-medium">
                      Custom Tune (Research/Experiment)
                    </span>{" "}
                    or use Solver page →
                    <span className="font-medium"> Run Single Algorithm</span>{" "}
                    with custom parameters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {compareMode === "tuned" && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
              <p className="text-base font-semibold text-slate-800">
                Custom Tune Parameters
              </p>
              <button
                type="button"
                onClick={() => {
                  setBenchmarkTuningDraft(
                    createBenchmarkDraft(DEFAULT_BENCHMARK_TUNING),
                  );
                  setTuningWarnings({});
                  setLatestTuneSummary({
                    status: "reset",
                    lastFieldLabel: "All tuned values",
                    customFieldCount: 0,
                    savedAt: Date.now(),
                  });
                  flashTuningKeys(
                    Object.keys(DEFAULT_BENCHMARK_TUNING) as Array<
                      keyof BenchmarkTuning
                    >,
                  );
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100 hover:shadow-xl"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Tuned Values
              </button>
            </div>
          )}

          {compareMode === "tuned" && latestTuneSummary ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 text-sm text-emerald-900 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">Latest Tune Update</p>
                <button
                  type="button"
                  onClick={() => setLatestTuneSummary(null)}
                  className="rounded-lg border border-emerald-300 bg-white px-2 py-0.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 shadow-lg"
                >
                  Clear
                </button>
              </div>
              <p>
                Status:{" "}
                <span className="font-medium">
                  {latestTuneSummary.status === "reset"
                    ? "Reset to defaults"
                    : "Manual edit"}
                </span>
                {" · "}Field:{" "}
                <span className="font-medium">
                  {latestTuneSummary.lastFieldLabel}
                </span>
                {" · "}Custom overrides:{" "}
                <span className="font-medium">
                  {latestTuneSummary.customFieldCount}
                </span>
              </p>
              <p className="mt-1 text-xs text-emerald-800/80">
                Updated:{" "}
                {new Date(latestTuneSummary.savedAt).toLocaleTimeString()}
              </p>
            </div>
          ) : null}

          {compareMode === "tuned" && (
            <div className="mt-3 overflow-hidden transition-all duration-200 ease-out">
              <div className="grid items-stretch gap-3 lg:grid-cols-3 shadow-lg">
                <div className="flex h-full flex-col gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-semibold text-slate-800">
                      Hybrid Genetic Search
                    </p>
                    <label className="mt-2 block text-xs text-slate-600">
                      Runtime (seconds)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={3600}
                      value={benchmarkTuningDraft.hgsRuntime}
                      placeholder={String(DEFAULT_BENCHMARK_TUNING.hgsRuntime)}
                      onChange={(e) =>
                        applyTuningInput("hgsRuntime", e.target.value)
                      }
                      className={getTuningInputClass("hgsRuntime")}
                    />
                    {tuningWarnings.hgsRuntime ? (
                      <p
                        className={cn(
                          "mt-1 text-[11px]",
                          getTuningWarningClass(tuningWarnings.hgsRuntime.kind),
                        )}
                      >
                        {tuningWarnings.hgsRuntime.text}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-slate-500">
                      Allowed range: 10 to 3600 seconds.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-semibold text-slate-800">
                      Guided Local Search
                    </p>
                    <label className="mt-2 block text-xs text-slate-600">
                      Runtime (seconds)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={3600}
                      value={benchmarkTuningDraft.glsRuntime}
                      placeholder={String(DEFAULT_BENCHMARK_TUNING.glsRuntime)}
                      onChange={(e) =>
                        applyTuningInput("glsRuntime", e.target.value)
                      }
                      className={getTuningInputClass("glsRuntime")}
                    />
                    {tuningWarnings.glsRuntime ? (
                      <p
                        className={cn(
                          "mt-1 text-[11px]",
                          getTuningWarningClass(tuningWarnings.glsRuntime.kind),
                        )}
                      >
                        {tuningWarnings.glsRuntime.text}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-slate-500">
                      Allowed range: 10 to 3600 seconds.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-semibold text-slate-800">
                      Iterated Local Search
                    </p>
                    <label className="mt-2 block text-xs text-slate-600">
                      Runtime (seconds)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={3600}
                      value={benchmarkTuningDraft.ilsRuntime}
                      placeholder={String(DEFAULT_BENCHMARK_TUNING.ilsRuntime)}
                      onChange={(e) =>
                        applyTuningInput("ilsRuntime", e.target.value)
                      }
                      className={getTuningInputClass("ilsRuntime")}
                    />
                    {tuningWarnings.ilsRuntime ? (
                      <p
                        className={cn(
                          "mt-1 text-[11px]",
                          getTuningWarningClass(tuningWarnings.ilsRuntime.kind),
                        )}
                      >
                        {tuningWarnings.ilsRuntime.text}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-slate-500">
                      Allowed range: 10 to 3600 seconds.
                    </p>
                  </div>
                </div>

                <div className="h-full rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="text-sm font-semibold text-slate-800">
                    Ant Colony Optimization
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="text-xs text-slate-600">
                      Number of ants
                      <input
                        type="number"
                        min={5}
                        max={200}
                        value={benchmarkTuningDraft.acoAntsNum}
                        placeholder={String(
                          DEFAULT_BENCHMARK_TUNING.acoAntsNum,
                        )}
                        onChange={(e) =>
                          applyTuningInput("acoAntsNum", e.target.value)
                        }
                        className={getTuningInputClass("acoAntsNum")}
                      />
                      {tuningWarnings.acoAntsNum ? (
                        <p
                          className={cn(
                            "mt-1 text-[11px]",
                            getTuningWarningClass(
                              tuningWarnings.acoAntsNum.kind,
                            ),
                          )}
                        >
                          {tuningWarnings.acoAntsNum.text}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-slate-500">
                        Allowed range: 5 to 200.
                      </p>
                    </label>
                    <label className="text-xs text-slate-600">
                      Beta
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={benchmarkTuningDraft.acoBeta}
                        placeholder={String(DEFAULT_BENCHMARK_TUNING.acoBeta)}
                        onChange={(e) =>
                          applyTuningInput("acoBeta", e.target.value)
                        }
                        className={getTuningInputClass("acoBeta")}
                      />
                      {tuningWarnings.acoBeta ? (
                        <p
                          className={cn(
                            "mt-1 text-[11px]",
                            getTuningWarningClass(tuningWarnings.acoBeta.kind),
                          )}
                        >
                          {tuningWarnings.acoBeta.text}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-slate-500">
                        Allowed range: 0 to 1.
                      </p>
                    </label>
                    <label className="text-xs text-slate-600">
                      Q0
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={benchmarkTuningDraft.acoQ0}
                        placeholder={String(DEFAULT_BENCHMARK_TUNING.acoQ0)}
                        onChange={(e) =>
                          applyTuningInput("acoQ0", e.target.value)
                        }
                        className={getTuningInputClass("acoQ0")}
                      />
                      {tuningWarnings.acoQ0 ? (
                        <p
                          className={cn(
                            "mt-1 text-[11px]",
                            getTuningWarningClass(tuningWarnings.acoQ0.kind),
                          )}
                        >
                          {tuningWarnings.acoQ0.text}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-slate-500">
                        Allowed range: 0 to 1.
                      </p>
                    </label>
                    <label className="text-xs text-slate-600">
                      Rho
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={benchmarkTuningDraft.acoRho}
                        placeholder={String(DEFAULT_BENCHMARK_TUNING.acoRho)}
                        onChange={(e) =>
                          applyTuningInput("acoRho", e.target.value)
                        }
                        className={getTuningInputClass("acoRho")}
                      />
                      {tuningWarnings.acoRho ? (
                        <p
                          className={cn(
                            "mt-1 text-[11px]",
                            getTuningWarningClass(tuningWarnings.acoRho.kind),
                          )}
                        >
                          {tuningWarnings.acoRho.text}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-slate-500">
                        Allowed range: 0 to 1.
                      </p>
                    </label>
                    <label className="col-span-2 text-xs text-slate-600">
                      Runtime (minutes)
                      <input
                        type="number"
                        step="0.5"
                        min={0.5}
                        max={120}
                        value={benchmarkTuningDraft.acoRuntimeMinutes ?? ""}
                        placeholder={String(
                          DEFAULT_BENCHMARK_TUNING.acoRuntimeMinutes,
                        )}
                        onChange={(e) =>
                          applyTuningInput("acoRuntimeMinutes", e.target.value)
                        }
                        className={getTuningInputClass("acoRuntimeMinutes")}
                      />
                      {tuningWarnings.acoRuntimeMinutes ? (
                        <p
                          className={cn(
                            "mt-1 text-[11px]",
                            getTuningWarningClass(
                              tuningWarnings.acoRuntimeMinutes.kind,
                            ),
                          )}
                        >
                          {tuningWarnings.acoRuntimeMinutes.text}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-slate-500">
                        Leave empty to run until the algorithm stops naturally
                        (stops after 50 checks of 5 s each, i.e. 250 s, with no
                        improvement in cost or vehicle count), or set a time
                        limit (e.g. 5–15+ min) for predictable results.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="h-full rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="text-sm font-semibold text-slate-800">
                    Simulated Annealing
                  </p>
                  <label className="mt-2 block text-xs text-slate-600">
                    Initial temperature
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100000}
                    value={benchmarkTuningDraft.saInitTemp}
                    placeholder={String(DEFAULT_BENCHMARK_TUNING.saInitTemp)}
                    onChange={(e) =>
                      applyTuningInput("saInitTemp", e.target.value)
                    }
                    className={getTuningInputClass("saInitTemp")}
                  />
                  {tuningWarnings.saInitTemp ? (
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        getTuningWarningClass(tuningWarnings.saInitTemp.kind),
                      )}
                    >
                      {tuningWarnings.saInitTemp.text}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-500">
                    Allowed range: 10 to 100000.
                  </p>
                  <label className="mt-2 block text-xs text-slate-600">
                    Cooling rate
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min={0.8}
                    max={0.99999}
                    value={benchmarkTuningDraft.saCoolingRate}
                    placeholder={String(DEFAULT_BENCHMARK_TUNING.saCoolingRate)}
                    onChange={(e) =>
                      applyTuningInput("saCoolingRate", e.target.value)
                    }
                    className={getTuningInputClass("saCoolingRate")}
                  />
                  {tuningWarnings.saCoolingRate ? (
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        getTuningWarningClass(
                          tuningWarnings.saCoolingRate.kind,
                        ),
                      )}
                    >
                      {tuningWarnings.saCoolingRate.text}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-500">
                    Allowed range: 0.8 to 0.99999.
                  </p>
                  <label className="mt-2 block text-xs text-slate-600">
                    Runtime (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    step={1}
                    value={benchmarkTuningDraft.saRuntimeMinutes ?? ""}
                    placeholder={String(
                      DEFAULT_BENCHMARK_TUNING.saRuntimeMinutes,
                    )}
                    onChange={(e) =>
                      applyTuningInput("saRuntimeMinutes", e.target.value)
                    }
                    className={getTuningInputClass("saRuntimeMinutes")}
                  />
                  {tuningWarnings.saRuntimeMinutes ? (
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        getTuningWarningClass(
                          tuningWarnings.saRuntimeMinutes.kind,
                        ),
                      )}
                    >
                      {tuningWarnings.saRuntimeMinutes.text}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-500">
                    Leave empty to run until the algorithm stops naturally
                    (stops after 50 checks of 5 s each, i.e. 250 s, with no
                    improvement in cost or vehicle count), or set a time limit
                    (e.g. 5–15+ min) for predictable results.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label
              htmlFor="compare-dataset-select"
              className="mb-2 block text-base font-medium text-slate-700"
            >
              Solomon Benchmark (Dataset)
            </label>
            <select
              id="compare-dataset-select"
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              disabled={running}
              className={cn(INPUT_STYLE, "cursor-pointer")}
            >
              <option value="">Select Dataset</option>
              {(datasets ?? []).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <button
                      type="button"
                      onClick={handleCompare}
                      disabled={!canRunCompare}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-colors shadow-lg hover:shadow-xl cursor-pointer",
                        canRunCompare
                          ? "bg-sky-600 hover:bg-sky-700"
                          : "cursor-not-allowed bg-slate-400",
                      )}
                    >
                      {running ? (
                        <>
                          <RotateCw className="h-4 w-4 animate-spin" />
                          Running Algorithms...
                        </>
                      ) : (
                        <>
                          <Waypoints className="h-4 w-4" />
                          Run Algorithms
                        </>
                      )}
                    </button>
                  </span>
                </TooltipTrigger>
                {!canRunCompare && disabledCompareReason ? (
                  <TooltipContent>{disabledCompareReason}</TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <button
                      type="button"
                      onClick={() => setShowStopDialog(true)}
                      disabled={!canStopCompare}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-colors shadow-lg hover:shadow-xl cursor-pointer",
                        canStopCompare
                          ? "bg-red-600 hover:bg-red-700"
                          : "cursor-not-allowed bg-slate-400",
                      )}
                    >
                      <StopCircle className="h-4 w-4" />
                      Stop Algorithms
                    </button>
                  </span>
                </TooltipTrigger>
                {!canStopCompare && disabledStopReason ? (
                  <TooltipContent>{disabledStopReason}</TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
          <DialogContent
            className="max-w-md p-0"
            aria-describedby="stop-compare-dialog-description"
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <DialogTitle className="text-slate-900">
                Stop running algorithms?
              </DialogTitle>
              <DialogDescription
                id="stop-compare-dialog-description"
                className="mt-1 text-base"
              >
                This will mark unfinished algorithms as stopped. Completed
                results stay available.
              </DialogDescription>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowStopDialog(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-lg hover:bg-slate-100 hover:shadow-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStopCompare}
                className="rounded-lg bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-lg hover:bg-rose-700 hover:shadow-xl"
              >
                Yes, stop!
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Running indicator */}
      {running && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <RotateCw className="h-6 w-6 shrink-0 animate-spin" aria-hidden />
              <div className="flex items-center gap-2">
                <span className="font-medium">Running Algorithms...</span>
                <span className="text-xs text-sky-700/80">
                  {completed} of {total} algorithms completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="progress-bar-track"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Benchmark progress"
                >
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, progress))}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-mono tabular-nums">
                  {progress}%
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-lg tabular-nums">
                <Timer className="h-6 w-6 shrink-0" />
                {formatted}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results table */}
      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-medium text-slate-700">
                Comparison Results
              </h2>
              <p className="text-sm text-slate-500">
                Check the table for calculated detailed results
              </p>
            </div>
            <div className="flex items-center gap-2">
              {cachedSnapshot ? (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                  Last saved result available
                </span>
              ) : null}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <button
                        type="button"
                        onClick={handleExplain}
                        disabled={explainLoading || running}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold text-white shadow-lg transition-colors hover:shadow-xl cursor-pointer",
                          explainLoading || running
                            ? "cursor-not-allowed bg-slate-400"
                            : "bg-violet-600 hover:bg-violet-700",
                        )}
                      >
                        {explainLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {explainLoading ? "Explaining..." : "Explain Results"}
                      </button>
                    </span>
                  </TooltipTrigger>
                  {running ? (
                    <TooltipContent>
                      Wait until benchmark completes
                    </TooltipContent>
                  ) : explainLoading ? (
                    <TooltipContent>
                      AI explanation is in progress
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {explanation && (
            <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 text-sm text-slate-700">
              <p className="whitespace-pre-wrap">{explanation}</p>
            </div>
          )}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Metaheuristic Algorithm
                    </th>
                    <th className="min-w-[220px] px-4 py-3 text-left font-semibold text-slate-700">
                      Algorithm Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      No. of Routes
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Solution Cost
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      BKS Cost & Routes
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Solution Gap (%)
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Solution Runtime (Sec)
                    </th>
                  </tr>
                </thead>
                <tbody ref={tableBodyRef}>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-slate-100",
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {getAlgoDisplayName(row.algo)}
                      </td>
                      <td className="min-w-[220px] px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center font-medium",
                              getStatusClass(row.status),
                            )}
                          >
                            {row.status === "running" ||
                            row.status === "pending" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                                Running
                              </span>
                            ) : (
                              row.status.charAt(0).toUpperCase() +
                              row.status.slice(1)
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.routes}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.cost ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{bksDisplay}</td>
                      <td
                        className={cn(
                          "px-4 py-3 font-medium",
                          getGapClass(row.gap),
                        )}
                      >
                        {row.gap != null ? `${row.gap}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.runtime ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
