import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useDatasets } from "@/hooks/useDatasets";
import { useSolveStream } from "@/hooks/useSolveStream";
import { getDataset, getPlotUrl, postSolve, postStopSolve } from "@/lib/api";
import { useSolverStore } from "@/stores/solverStore";
import { useSolverResultStore } from "@/stores/solverResultStore";
import { LogConsole } from "@/components/solver/LogConsole";
import { ParameterTuner } from "@/components/solver/ParameterTuner";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ALGO_IDS, getAlgoDisplayName } from "@/constants/algorithms";
import { toast } from "@/lib/toast";
import { Activity, RotateCw, Timer, Route, StopCircle } from "lucide-react";
import { useStopwatch } from "@/hooks/useStopwatch";
import { CopyButton } from "@/components/common/CopyButton";
import { SectionActions } from "@/components/common/SectionActions";
import { RoutePlotWithControls } from "@/components/map/RoutePlotWithControls";
import { Skeleton } from "@/components/common/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const INPUT_STYLE =
  "w-full min-w-[200px] rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-base text-slate-900 shadow-lg";

function ResultsAnimated({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const cards = el.querySelectorAll(".result-card");
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, []);
  return <div ref={ref}>{children}</div>;
}

function SolverSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-80" />
            <Skeleton className="h-4 w-[520px]" />
            <Skeleton className="h-4 w-[420px]" />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-60" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-60" />
          </div>
          <Skeleton className="h-20 w-48 rounded-lg" />
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-44" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
        <Skeleton className="mt-4 h-11 w-44 rounded-lg" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <Skeleton className="mb-4 h-5 w-36" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  );
}

export function Solver() {
  const { data: datasets, isLoading } = useDatasets();
  const { selectedDataset, setSelectedDataset, selectedAlgo, setSelectedAlgo } =
    useSolverStore();
  const { setLatestCompleted, clearLatestCompleted, getLatestIfFresh } =
    useSolverResultStore();
  const [jobId, setJobId] = useState<string | null>(null);
  const [streamAlgo, setStreamAlgo] = useState<string | undefined>(undefined);
  const [params, setParams] = useState<Record<string, number>>(
    () => getLatestIfFresh()?.params ?? {},
  );
  const [running, setRunning] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const hasHydratedSelectionRef = useRef(false);
  const { elapsed, formatted } = useStopwatch(running);
  const { logs, status, result, error, clear } = useSolveStream(
    jobId,
    streamAlgo,
    running && !!jobId,
  );
  const isIndeterminate = selectedAlgo === "sa";
  const expectedRuntimeSeconds =
    selectedAlgo === "aco"
      ? Math.round((params.runtime_minutes ?? 5) * 60)
      : Math.round(params.runtime ?? 120);
  const hasRuntimeTarget = !isIndeterminate && expectedRuntimeSeconds > 0;
  const runtimeProgress = hasRuntimeTarget
    ? Math.round((elapsed / expectedRuntimeSeconds) * 100)
    : 0;
  const progress =
    status === "done" || status === "failed"
      ? 100
      : running && hasRuntimeTarget
        ? Math.min(100, Math.max(0, runtimeProgress))
        : 0;
  const { data: datasetInfo } = useQuery({
    queryKey: ["dataset", selectedDataset],
    queryFn: () => getDataset(selectedDataset!),
    enabled: !!selectedDataset,
  });
  const canRun = !!selectedDataset && !!selectedAlgo && !running;
  const canStop = running && !!jobId;
  const disabledRunReason = running
    ? "Algorithm is currently running"
    : !selectedDataset || !selectedAlgo
      ? "Select dataset and algorithm first"
      : null;
  const disabledStopReason = !running
    ? "No algorithm is running"
    : !jobId
      ? "No active job to stop"
      : null;

  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (hasHydratedSelectionRef.current) return;
    const snapshot = getLatestIfFresh();
    if (snapshot) {
      setSelectedDataset(snapshot.dataset);
      setSelectedAlgo(snapshot.algo);
    }
    hasHydratedSelectionRef.current = true;
  }, [getLatestIfFresh, setSelectedDataset, setSelectedAlgo]);

  useEffect(() => {
    if (status === "done") {
      queueMicrotask(() => setRunning(false));
      if (result && prevStatusRef.current !== "done") {
        toast.success(
          `${getAlgoDisplayName(selectedAlgo ?? "")} finished`,
          `Cost: ${result.cost}, ${result.routes.length} routes in ${result.runtime}s`,
        );
        if (selectedDataset && selectedAlgo) {
          const completedSnapshot = {
            dataset: selectedDataset,
            algo: selectedAlgo,
            params,
            result,
            jobId,
            logs,
          };
          setLatestCompleted(completedSnapshot);

          if (jobId) {
            void (async () => {
              try {
                const response = await fetch(getPlotUrl(jobId, selectedAlgo));
                if (!response.ok) return;
                const plotBlob = await response.blob();
                const plotDataUrl = await new Promise<string | null>(
                  (resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      resolve(
                        typeof reader.result === "string"
                          ? reader.result
                          : null,
                      );
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(plotBlob);
                  },
                );
                if (!plotDataUrl) return;
                setLatestCompleted({
                  ...completedSnapshot,
                  plotDataUrl,
                });
              } catch {
                /* ignore plot cache failures */
              }
            })();
          }
        }
      }
    } else if (status === "failed") {
      queueMicrotask(() => setRunning(false));
      if (prevStatusRef.current !== "failed") {
        toast.error("Solver failed", error ?? "Unknown error");
      }
    } else if (status === "stopped") {
      queueMicrotask(() => setRunning(false));
      if (prevStatusRef.current !== "stopped") {
        toast.info(
          `${getAlgoDisplayName(selectedAlgo ?? "")} stopped`,
          error ?? "Stopped by user request.",
        );
      }
    }
    prevStatusRef.current = status;
  }, [
    status,
    result,
    error,
    selectedAlgo,
    selectedDataset,
    params,
    jobId,
    logs,
    setLatestCompleted,
  ]);

  const cachedSnapshot = getLatestIfFresh();
  const showingCachedResult =
    !running && status !== "done" && !!cachedSnapshot?.result;
  const displayedLogs =
    showingCachedResult && cachedSnapshot ? (cachedSnapshot.logs ?? []) : logs;

  const handleRun = async () => {
    if (!selectedDataset || !selectedAlgo) return;
    setRunning(true);
    clear();
    setJobId(null);
    setStreamAlgo(selectedAlgo);
    toast.info(
      `Starting ${getAlgoDisplayName(selectedAlgo)} on ${selectedDataset}`,
      "Solver job queued",
    );
    try {
      const { job_id } = await postSolve(
        selectedAlgo,
        selectedDataset,
        120,
        params,
      );
      setJobId(job_id);
    } catch {
      setRunning(false);
      setStreamAlgo(undefined);
      toast.error("Failed to start solver", "Could not connect to the server");
    }
  };

  const handleStop = async () => {
    if (!jobId) {
      setShowStopDialog(false);
      return;
    }

    setShowStopDialog(false);
    try {
      await postStopSolve(jobId, selectedAlgo ?? undefined);
      setRunning(false);
      toast.info(
        "Stop requested",
        `${getAlgoDisplayName(selectedAlgo ?? "")} stop was requested.`,
      );
    } catch {
      toast.error("Stop failed", "Could not send stop request.");
    }
  };

  if (isLoading) {
    return <SolverSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Controls card */}
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-start gap-4">
          <div className="self-start rounded-lg bg-sky-100 p-4">
            <Route className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Single-Algorithm Benchmark Configuration
            </h2>
            <p className="text-base text-slate-500">
              Run one metaheuristic on a selected Solomon instance and review
              the solution details and route plot. ACO and SA can take longer on
              larger instances because they lack a fixed runtime parameter, and
              ILS runtime may vary when a separate backend is used. Choose a
              dataset and algorithm, adjust parameters if needed, and click "Run
              Algorithm" to start.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {cachedSnapshot ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span>
                Last saved result: {cachedSnapshot.dataset} ·{" "}
                {getAlgoDisplayName(cachedSnapshot.algo)} ·{" "}
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

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="w-full">
              <label
                htmlFor="solver-dataset-select"
                className="mb-2 block text-base font-medium text-slate-700"
              >
                Solomon Benchmark
              </label>
              <select
                id="solver-dataset-select"
                title="Solomon Benchmark"
                value={selectedDataset ?? ""}
                onChange={(e) => setSelectedDataset(e.target.value || null)}
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

            <div className="w-full">
              <label
                htmlFor="solver-algo-select"
                className="mb-2 block text-base font-medium text-slate-700"
              >
                Metaheuristic Algorithm
              </label>
              <select
                id="solver-algo-select"
                title="Metaheuristic Algorithm"
                value={selectedAlgo ?? ""}
                onChange={(e) => setSelectedAlgo(e.target.value || null)}
                disabled={running}
                className={cn(INPUT_STYLE, "cursor-pointer")}
              >
                <option value="">Select Algorithm</option>
                {ALGO_IDS.map((a) => (
                  <option key={a} value={a}>
                    {getAlgoDisplayName(a)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <button
                      type="button"
                      onClick={handleRun}
                      disabled={!canRun}
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-colors shadow-lg hover:shadow-xl cursor-pointer",
                        canRun
                          ? "bg-sky-600 hover:bg-sky-700"
                          : "cursor-not-allowed bg-slate-400",
                      )}
                    >
                      {running ? (
                        <>
                          <RotateCw className="h-4 w-4 animate-spin" />
                          Running Algorithm...
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4" />
                          Run Algorithm
                        </>
                      )}
                    </button>
                  </span>
                </TooltipTrigger>
                {!canRun && disabledRunReason ? (
                  <TooltipContent>{disabledRunReason}</TooltipContent>
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
                      disabled={!canStop}
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-colors shadow-lg hover:shadow-xl cursor-pointer",
                        canStop
                          ? "bg-red-600 hover:bg-red-700"
                          : "cursor-not-allowed bg-slate-400",
                      )}
                    >
                      <StopCircle className="h-4 w-4" />
                      Stop Algorithm
                    </button>
                  </span>
                </TooltipTrigger>
                {!canStop && disabledStopReason ? (
                  <TooltipContent>{disabledStopReason}</TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
          <DialogContent className="max-w-md p-0" aria-describedby="stop-dialog-description">
            <div className="border-b border-slate-200 px-5 py-4">
              <DialogTitle className="text-slate-900">
                Stop running algorithm?
              </DialogTitle>
              <DialogDescription id="stop-dialog-description" className="mt-1">
                This will stop the current run. Partial computation may not
                produce a final solution.
              </DialogDescription>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowStopDialog(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-lg hover:bg-slate-100 hover:shadow-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg hover:bg-rose-700 hover:shadow-xl"
              >
                Yes, stop
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {selectedAlgo && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <ParameterTuner
              algo={selectedAlgo}
              dataset={selectedDataset}
              params={params}
              onChange={setParams}
              disabled={running}
            />
          </div>
        )}
      </div>

      {/* Running indicator */}
      {running && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <RotateCw className="h-6 w-6 shrink-0 animate-spin" />
              <span className="font-medium">Running Algorithm...</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="progress-bar-track"
                  role="progressbar"
                  aria-valuenow={isIndeterminate ? undefined : progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Solver progress"
                >
                  {isIndeterminate ? (
                    <div className="progress-bar-fill w-1/2" />
                  ) : (
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  )}
                </div>
                {!isIndeterminate && (
                  <span className="text-sm font-mono tabular-nums">
                    {progress}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-lg tabular-nums">
                <Timer className="h-6 w-6 shrink-0" />
                {formatted}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="relative rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-2 flex items-center gap-2">
          <label className="block text-lg font-semibold text-slate-900">
            Execution Logs
          </label>
          {status === "stopped" ? (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
              Stopped by user
            </span>
          ) : null}
        </div>
        <div className="relative">
          <LogConsole
            logs={displayedLogs}
            isStreaming={status === "running"}
            className="pr-10"
          />
          <CopyButton
            getContent={() => displayedLogs.join("\n")}
            className="right-2 top-2 z-20 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          />
        </div>
      </div>

      {/* Results */}
      {status === "stopped" && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-800">
          Sorry, {getAlgoDisplayName(selectedAlgo ?? "algorithm")} calculation
          was turned off by user request. A final solution could not be
          retrieved for this run.
        </div>
      )}

      {(result && status === "done") || showingCachedResult ? (
        <ResultsAnimated>
          {showingCachedResult && cachedSnapshot ? (
            <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-8 py-4 text-sm text-sky-800">
              Showing last saved completed result from this browser session.
            </div>
          ) : null}

          {(() => {
            const activeResult =
              result && status === "done" ? result : cachedSnapshot!.result;
            const activeDataset =
              status === "done" ? selectedDataset : cachedSnapshot!.dataset;
            const activeAlgo =
              status === "done" ? selectedAlgo : cachedSnapshot!.algo;
            const activeJobId =
              status === "done" ? jobId : cachedSnapshot!.jobId;
            const activePlotDataUrl =
              status === "done" ? undefined : cachedSnapshot!.plotDataUrl;

            return (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="result-card relative rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Solution Summary
                      </h3>
                      <SectionActions
                        getContent={() => {
                          const header = `Cost: ${activeResult.cost}\nRuntime: ${activeResult.runtime}s\nRoutes: ${activeResult.routes.length}\n\n`;
                          const routesText = activeResult.routes
                            .map((r, i) => `Route #${i + 1}: ${r.join(" ")}`)
                            .join("\n");
                          return (
                            header +
                            (activeAlgo
                              ? `${getAlgoDisplayName(activeAlgo)} solution:\n`
                              : "") +
                            routesText
                          );
                        }}
                        downloadLabel={`${activeDataset ?? "solution"}-${activeAlgo ?? "result"}`}
                        className="static"
                      />
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-700">
                          Cost:
                        </span>{" "}
                        {activeResult.cost}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">
                          Runtime:
                        </span>{" "}
                        {activeResult.runtime}s
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">
                          Routes:
                        </span>{" "}
                        {activeResult.routes.length}
                      </p>
                      <div className="mt-4 space-y-1 font-mono text-sm">
                        {activeResult.routes.map((r, i) => (
                          <p key={i}>
                            Route #{i + 1}: {r.join(" ")}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="result-card">
                    <RoutePlotWithControls
                      jobId={activeJobId}
                      algo={activeAlgo ?? undefined}
                      dataset={activeDataset ?? undefined}
                      plotDataUrl={activePlotDataUrl}
                    />
                  </div>
                </div>

                {/* Best-known solution (BKS) */}
                {datasetInfo?.has_bks && datasetInfo.bks_cost != null && (
                  <div className="result-card relative mt-6 rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Best-known solution (BKS)
                      </h3>
                      <SectionActions
                        getContent={() => {
                          const header = `Best-known solution (BKS)\nDataset: ${activeDataset ?? ""}.txt\nCost: ${datasetInfo.bks_cost}\nRoutes: ${datasetInfo.bks_routes?.length ?? 0}\n\n`;
                          const routesText = (datasetInfo.bks_routes ?? [])
                            .map((r, i) => `Route #${i + 1}: ${r.join(" ")}`)
                            .join("\n");
                          return header + routesText;
                        }}
                        downloadLabel={`bks-${activeDataset ?? "dataset"}`}
                        className="static"
                      />
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-700">
                          Dataset:
                        </span>{" "}
                        {activeDataset ?? ""}.txt
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">
                          Cost:
                        </span>{" "}
                        {datasetInfo.bks_cost}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">
                          Routes:
                        </span>{" "}
                        {datasetInfo.bks_routes?.length ?? 0}
                      </p>
                      <div className="mt-4 space-y-1 font-mono text-sm">
                        {(datasetInfo.bks_routes ?? []).map((r, i) => (
                          <p key={i}>
                            Route #{i + 1}: {r.join(" ")}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </ResultsAnimated>
      ) : null}

      {error && status !== "stopped" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
