import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDetailedStatus,
  getHealthUrl,
  hasIlsBackend,
} from "@/lib/api";

type SubTab = "docs" | "status";

const API_DOCS: {
  group: string;
  endpoints: { method: string; path: string; description: string }[];
}[] = [
  {
    group: "Health",
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        description:
          "Liveness check. Returns status and list of supported algorithms.",
      },
    ],
  },
  {
    group: "Datasets",
    endpoints: [
      {
        method: "GET",
        path: "/api/datasets",
        description: "List dataset names.",
      },
      {
        method: "GET",
        path: "/api/datasets/download-all",
        description: "Download all instance files as zip.",
      },
      {
        method: "GET",
        path: "/api/datasets/bks/download-all",
        description: "Download all BKS files as zip.",
      },
      {
        method: "GET",
        path: "/api/datasets/{name}",
        description:
          "Get dataset metadata, coordinates, BKS routes/cost. Path param: instance name (e.g. r101).",
      },
      {
        method: "GET",
        path: "/api/datasets/{name}/download",
        description: "Download instance file.",
      },
      {
        method: "GET",
        path: "/api/datasets/{name}/bks/download",
        description: "Download BKS file.",
      },
    ],
  },
  {
    group: "Solve & Results",
    endpoints: [
      {
        method: "POST",
        path: "/api/solve/{algo}",
        description:
          "Start solve job. Body: { dataset, runtime?, params? }. Returns { job_id }. algo: hgs | ils | aco | sa | gls.",
      },
      {
        method: "POST",
        path: "/api/solve/compare",
        description:
          "Start compare job (all algos). Body: { dataset, runtime?, params? }. Returns { job_ids }.",
      },
      {
        method: "POST",
        path: "/api/solve/{job_id}/stop",
        description: "Stop a running job.",
      },
      {
        method: "GET",
        path: "/api/solve/{job_id}/stream",
        description: "SSE stream of log lines for the job.",
      },
      {
        method: "GET",
        path: "/api/results/{job_id}",
        description:
          "Get job status and result: routes, cost, runtime. Returns status, result?, error?.",
      },
      {
        method: "GET",
        path: "/api/results/{job_id}/plot",
        description: "Get route plot image (PNG).",
      },
    ],
  },
  {
    group: "Parameters",
    endpoints: [
      {
        method: "GET",
        path: "/api/parameters/{algo}",
        description: "Get default parameters for algorithm.",
      },
      {
        method: "PUT",
        path: "/api/parameters/{algo}",
        description: "Update default parameters. Body: key-value params.",
      },
    ],
  },
  {
    group: "AI",
    endpoints: [
      {
        method: "GET",
        path: "/api/ai/suggest?algo=&dataset=&prompt=",
        description:
          "AI suggestion for parameters (optional; needs GOOGLE_GEMINI_API_KEY).",
      },
      {
        method: "POST",
        path: "/api/ai/explain",
        description:
          "Body: { dataset, results }. Get AI explanation of comparison results.",
      },
      {
        method: "GET",
        path: "/api/ai/rag/status",
        description: "RAG availability (boolean, reason?).",
      },
      {
        method: "POST",
        path: "/api/ai/rag/reindex",
        description: "Rebuild RAG index.",
      },
      {
        method: "POST",
        path: "/api/ai/ask",
        description: "Body: { question }. RAG Q&A.",
      },
      {
        method: "POST",
        path: "/api/ai/tune",
        description:
          "Body: { algo, dataset, max_iterations?, runtime_per_run?, goal? }. Auto-tune parameters.",
      },
    ],
  },
  {
    group: "Test Results (pre-generated)",
    endpoints: [
      {
        method: "GET",
        path: "/api/test-results",
        description: "List result sets.",
      },
      {
        method: "GET",
        path: "/api/test-results/{set_id}",
        description: "List experiments in set.",
      },
      {
        method: "GET",
        path: "/api/test-results/{set_id}/{exp_id}/content",
        description: "Get experiment text content.",
      },
      {
        method: "GET",
        path: "/api/test-results/{set_id}/{exp_id}/image/{filename}",
        description: "Get experiment image.",
      },
    ],
  },
];

function MethodBadge({ method }: { method: string }) {
  const color =
    method === "GET"
      ? "bg-emerald-100 text-emerald-800"
      : method === "POST"
        ? "bg-sky-100 text-sky-800"
        : method === "PUT"
          ? "bg-amber-100 text-amber-800"
          : "bg-slate-100 text-slate-800";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-2 py-0.5 font-mono text-xs font-semibold",
        color,
      )}
    >
      {method}
    </span>
  );
}

export function ApiStatusDocumentation() {
  const [subTab, setSubTab] = useState<SubTab>("docs");

  const {
    data: detailed,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["detailed-status"],
    queryFn: getDetailedStatus,
    refetchInterval: subTab === "status" ? 30_000 : false,
    staleTime: subTab === "status" ? 0 : 60_000,
  });

  const health = detailed?.mainHealth;
  const ilsHealth = detailed?.ilsHealth ?? null;
  const mergedAlgorithms = Array.from(
    new Set([
      ...(health?.algorithms ?? []),
      ...(ilsHealth?.algorithms ?? []),
    ]),
  ).sort();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-700">
          API Status & Documentation
        </h2>
        <p className="text-md text-slate-500">
          API reference and live backend status for the VRPTW Solver.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 shadow-lg">
        <button
          type="button"
          onClick={() => setSubTab("docs")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer hover:bg-white",
            subTab === "docs"
              ? "bg-white text-slate-900 shadow-lg"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          <FileText className="h-4 w-4" />
          API Docs
        </button>
        <button
          type="button"
          onClick={() => setSubTab("status")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer hover:bg-white",
            subTab === "status"
              ? "bg-white text-slate-900 shadow-lg"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          <Activity className="h-4 w-4" />
          API Status
        </button>
      </div>

      {subTab === "docs" && (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Base URL:{" "}
            <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs">
              {getHealthUrl().replace("/api/health", "")}
            </code>
          </p>
          {API_DOCS.map((group) => (
            <div
              key={group.group}
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                {group.group}
              </h3>
              <ul className="divide-y divide-slate-100">
                {group.endpoints.map((ep, i) => (
                  <li key={i} className="px-4 py-3">
                    <div className="flex flex-wrap items-start gap-3">
                      <MethodBadge method={ep.method} />
                      <code className="break-all font-mono text-sm text-slate-800">
                        {ep.path}
                      </code>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {ep.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {subTab === "status" && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-slate-800">
              Live API Status
            </h3>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-60"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 shrink-0" />
              )}
              Refresh
            </button>
          </div>

          {isLoading && !health ? (
            <div className="mt-6 flex items-center gap-2 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Checking API...</span>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {health?.ok ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span
                    className={cn(
                      "font-semibold",
                      health?.ok ? "text-emerald-700" : "text-red-700",
                    )}
                  >
                    {health?.ok ? "OK" : "Error or unreachable"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Backend responded with status:{" "}
                  <code className="font-mono">{health?.status ?? "—"}</code>
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Response time
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {health?.responseTimeMs ?? "—"} ms
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Last checked:{" "}
                  {dataUpdatedAt
                    ? new Date(dataUpdatedAt).toLocaleTimeString()
                    : "—"}
                </p>
              </div>

              <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Supported algorithms
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mergedAlgorithms.length > 0 ? (
                    mergedAlgorithms.map((algo) => (
                      <span
                        key={algo}
                        className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-800"
                      >
                        {algo.toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">
                      None (backend may be down)
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Frontend: React + Vite. Backend: FastAPI. Main backend (pyVRP
                  0.6): {health?.algorithms?.join(", ") ?? "—"}
                  {hasIlsBackend ? (
                    ilsHealth ? (
                      <> · ILS backend (pyVRP 0.13+): {ilsHealth.algorithms?.join(", ") ?? "—"}</>
                    ) : (
                      " · ILS backend (pyVRP 0.13+): not reached"
                    )
                  ) : null}
                </p>
              </div>

              {/* Endpoint response times */}
              {detailed?.endpointTimes && (
                <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Endpoint response times
                  </p>
                  <div className="mt-2 overflow-hidden rounded border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-3 py-2 text-left font-medium text-slate-700">
                            Endpoint
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-slate-700">
                            Response time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="px-3 py-2 font-mono text-slate-800">
                            GET /api/health
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                            {detailed.endpointTimes.health} ms
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="px-3 py-2 font-mono text-slate-800">
                            GET /api/datasets
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                            {detailed.endpointTimes.datasets} ms
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-mono text-slate-800">
                            GET /api/ai/rag/status
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                            {detailed.endpointTimes.ragStatus} ms
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI / RAG status */}
              <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  AI / RAG
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {detailed?.ragAvailable === true ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-800">
                        RAG available — Q&A and suggest/explain/tune can use AI
                      </span>
                    </>
                  ) : detailed?.ragAvailable === false ? (
                    <>
                      <XCircle className="h-5 w-5 shrink-0 text-amber-600" />
                      <span className="text-sm text-slate-600">
                        RAG not available (optional; install requirements-rag
                        and configure Gemini if needed)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">
                      RAG status unknown (endpoint unreachable or error)
                    </span>
                  )}
                </div>
              </div>

              {/* ILS backend status when configured */}
              {hasIlsBackend && (
                <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    ILS backend (Option A)
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {ilsHealth?.ok ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <span className="text-sm text-slate-700">
                          OK — {ilsHealth.responseTimeMs} ms
                        </span>
                      </>
                    ) : ilsHealth ? (
                      <>
                        <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                        <span className="text-sm text-slate-600">
                          Error or unreachable — {ilsHealth.responseTimeMs} ms
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-slate-500">
                        Not reached (check VITE_ILS_API_URL and ILS backend)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Status is polled every 30 seconds when this tab is active. Use
            Refresh to check immediately.
          </p>
        </div>
      )}
    </div>
  );
}
