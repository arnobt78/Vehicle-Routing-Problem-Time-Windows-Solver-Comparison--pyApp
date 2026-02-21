/**
 * API client for VRPTW backend: health, datasets, solve (single + compare), results, plot, parameters, AI.
 * Supports optional separate ILS backend (VITE_ILS_API_URL) for Option A deployment.
 */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
/** When set, ILS requests (solve/stream/results/plot) use this backend (Option A: two backends). */
const ILS_API_URL = import.meta.env.VITE_ILS_API_URL;

/** Request timeout (ms). Prevents infinite loading when backend is unreachable. */
const API_TIMEOUT_MS = 25_000;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: API_TIMEOUT_MS,
});

/** Base URL for health/status (no /api prefix for timing). */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/** Health check for API Status page. Returns status, algorithms, and response time in ms. */
export async function getHealthStatus(): Promise<{
  status: string;
  algorithms: string[];
  responseTimeMs: number;
  ok: boolean;
}> {
  const start = performance.now();
  try {
    const { data } = await api.get<{ status: string; algorithms: string[] }>(
      "/health",
    );
    const responseTimeMs = Math.round(performance.now() - start);
    return {
      ...data,
      responseTimeMs,
      ok: data.status === "ok",
    };
  } catch {
    const responseTimeMs = Math.round(performance.now() - start);
    return {
      status: "error",
      algorithms: [],
      responseTimeMs,
      ok: false,
    };
  }
}

export function getHealthUrl(): string {
  return `${API_BASE}/api/health`;
}

/** Whether ILS backend URL is configured (Option A). */
export const hasIlsBackend = Boolean(
  ILS_API_URL != null && ILS_API_URL !== "",
);

/** Health check for ILS backend. Returns null if ILS backend not configured. */
export async function getHealthStatusIls(): Promise<{
  status: string;
  algorithms: string[];
  responseTimeMs: number;
  ok: boolean;
} | null> {
  if (!apiIls) return null;
  const start = performance.now();
  try {
    const { data } = await apiIls.get<{
      status: string;
      algorithms: string[];
    }>("/health");
    const responseTimeMs = Math.round(performance.now() - start);
    return {
      ...data,
      responseTimeMs,
      ok: data.status === "ok",
    };
  } catch {
    const responseTimeMs = Math.round(performance.now() - start);
    return {
      status: "error",
      algorithms: [],
      responseTimeMs,
      ok: false,
    };
  }
}

/** Detailed status: main + ILS health, endpoint response times, RAG availability. */
export async function getDetailedStatus(): Promise<{
  mainHealth: Awaited<ReturnType<typeof getHealthStatus>>;
  ilsHealth: Awaited<ReturnType<typeof getHealthStatusIls>>;
  endpointTimes: { health: number; datasets: number; ragStatus: number };
  ragAvailable: boolean | undefined;
}> {
  async function timeRequest<T>(
    fn: () => Promise<{ data: T }>,
  ): Promise<{ time: number; data: T | undefined }> {
    const start = performance.now();
    try {
      const res = await fn();
      return {
        time: Math.round(performance.now() - start),
        data: res.data,
      };
    } catch {
      return {
        time: Math.round(performance.now() - start),
        data: undefined,
      };
    }
  }

  const [mainHealth, ilsHealth, datasetsRes, ragRes] = await Promise.all([
    getHealthStatus(),
    hasIlsBackend ? getHealthStatusIls() : Promise.resolve(null),
    timeRequest(() => api.get<{ datasets: string[] }>("/datasets")),
    timeRequest(() =>
      api.get<{ available: boolean; reason?: string }>("/ai/rag/status"),
    ),
  ]);

  return {
    mainHealth,
    ilsHealth,
    endpointTimes: {
      health: mainHealth.responseTimeMs,
      datasets: datasetsRes.time,
      ragStatus: ragRes.time,
    },
    ragAvailable: ragRes.data?.available,
  };
}

/** ILS-only backend client (used when VITE_ILS_API_URL is set). */
export const apiIls =
  ILS_API_URL != null && ILS_API_URL !== ""
    ? axios.create({
        baseURL: `${ILS_API_URL}/api`,
        headers: { "Content-Type": "application/json" },
        timeout: API_TIMEOUT_MS,
      })
    : null;

/** Base URL for a given algorithm (for SSE/EventSource and img src). Use ILS backend for "ils" when configured. */
export function getApiBaseUrl(algo?: string): string {
  if (algo === "ils" && apiIls != null) return ILS_API_URL!;
  return API_URL;
}

export async function getDatasets() {
  const { data } = await api.get<{ datasets: string[] }>("/datasets");
  return data.datasets;
}

/** Base URL for dataset API (for download links). */
export function getDatasetApiBase(): string {
  return `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/datasets`;
}

export function getInstanceDownloadUrl(name: string): string {
  return `${getDatasetApiBase()}/${name}/download`;
}

export function getBksDownloadUrl(name: string): string {
  return `${getDatasetApiBase()}/${name}/bks/download`;
}

export function getDownloadAllInstancesUrl(): string {
  return `${getDatasetApiBase()}/download-all`;
}

export function getDownloadAllBksUrl(): string {
  return `${getDatasetApiBase()}/bks/download-all`;
}

export async function getDataset(name: string) {
  const { data } = await api.get<{
    name: string;
    txt_path: string;
    has_bks: boolean;
    bks_routes?: number[][];
    bks_cost?: number;
    coordinates?: {
      depot: [number, number];
      customers: { id: number; x: number; y: number }[];
    };
  }>(`/datasets/${name}`);
  return data;
}

export async function getParameters(algo: string) {
  const { data } = await api.get<Record<string, number>>(`/parameters/${algo}`);
  return data;
}

export async function putParameters(
  algo: string,
  params: Record<string, number>,
) {
  const { data } = await api.put<Record<string, number>>(
    `/parameters/${algo}`,
    params,
  );
  return data;
}

export async function postSolve(
  algo: string,
  dataset: string,
  runtime?: number,
  params?: Record<string, unknown>,
) {
  const client = algo === "ils" && apiIls != null ? apiIls : api;
  const { data } = await client.post<{ job_id: string }>(`/solve/${algo}`, {
    dataset,
    runtime,
    params,
  });
  return data;
}

export async function postCompare(
  dataset: string,
  runtime?: number,
  params?: Record<string, unknown>,
) {
  const { data } = await api.post<{ job_ids: Record<string, string> }>(
    "/solve/compare",
    {
      dataset,
      runtime,
      params,
    },
  );
  return data;
}

export type CompareJobStatus = {
  status: string;
  result?: { routes: number[][]; cost: number; runtime: number } | null;
  error?: string;
  elapsed_sec?: number;
  runtime_limit?: number;
  progress_pct?: number;
};

/** Single poll for compare page: returns status and per-job progress for all job_ids. */
export async function getCompareStatus(jobIds: Record<string, string>) {
  const { data } = await api.post<{
    jobs: Record<string, CompareJobStatus>;
  }>("/solve/compare-status", { job_ids: jobIds });
  return data.jobs;
}

/** Job IDs for the main API only (exclude ILS when using separate ILS backend). */
export function getMainApiJobIds(
  jobIds: Record<string, string>,
): Record<string, string> {
  if (!hasIlsBackend || jobIds.ils == null) return jobIds;
  return Object.fromEntries(
    Object.entries(jobIds).filter(([key]) => key !== "ils"),
  );
}

export async function getResult(jobId: string, algo?: string) {
  const client = algo === "ils" && apiIls != null ? apiIls : api;
  const { data } = await client.get<{
    status: string;
    result?: { routes: number[][]; cost: number; runtime: number };
    error?: string;
  }>(`/results/${jobId}`);
  return data;
}

export async function postStopSolve(jobId: string, algo?: string) {
  const client = algo === "ils" && apiIls != null ? apiIls : api;
  const { data } = await client.post<{ status: string }>(
    `/solve/${jobId}/stop`,
  );
  return data;
}

export function getPlotUrl(jobId: string, algo?: string): string {
  const base = getApiBaseUrl(algo);
  return `${base}/api/results/${jobId}/plot`;
}

export async function getTestResultSets() {
  const { data } = await api.get<{ sets: { id: string; name: string }[] }>(
    "/test-results",
  );
  return data.sets;
}

export async function getTestResultExperiments(setId: string) {
  const s = encodeURIComponent(setId);
  const { data } = await api.get<{
    experiments: {
      id: string;
      has_txt: boolean;
      txt_name: string | null;
      image_count: number;
      images: string[];
    }[];
  }>(`/test-results/${s}`);
  return data.experiments;
}

export async function getTestResultContent(
  setId: string,
  expId: string,
): Promise<string> {
  const s = encodeURIComponent(setId);
  const e = encodeURIComponent(expId);
  const { data } = await api.get(`/test-results/${s}/${e}/content`, {
    responseType: "text",
  });
  return data as string;
}

export function getTestResultImageUrl(
  setId: string,
  expId: string,
  filename: string,
): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const s = encodeURIComponent(setId);
  const e = encodeURIComponent(expId);
  const f = encodeURIComponent(filename);
  return `${base}/api/test-results/${s}/${e}/image/${f}`;
}

export async function getAiSuggest(
  algo: string,
  dataset: string,
  prompt?: string,
) {
  const { data } = await api.get<{ suggestion?: string; error?: string }>(
    "/ai/suggest",
    { params: { algo, dataset, prompt } },
  );
  return data;
}

export async function postAiExplain(
  dataset: string,
  results: Record<string, unknown>[],
) {
  const { data } = await api.post<{ explanation?: string; error?: string }>(
    "/ai/explain",
    { dataset, results },
  );
  return data;
}

export async function getRagStatus() {
  const { data } = await api.get<{ available: boolean; reason?: string }>(
    "/ai/rag/status",
  );
  return data;
}

export async function postRagReindex() {
  const { data } = await api.post<{
    ok: boolean;
    reason?: string | null;
    indexed_files?: number;
    pdf_files?: number;
    persist_dir?: string;
  }>("/ai/rag/reindex");
  return data;
}

export async function postAiAsk(question: string) {
  const { data } = await api.post<{ answer?: string; error?: string }>(
    "/ai/ask",
    {
      question,
    },
  );
  return data;
}

export async function postAiTune(
  algo: string,
  dataset: string,
  maxIterations?: number,
  runtimePerRun?: number,
  goal?: string,
) {
  const { data } = await api.post<{
    best_params: Record<string, number> | null;
    best_cost: number | null;
    iterations: { params: Record<string, number>; cost: number | null }[];
    error?: string;
  }>("/ai/tune", {
    algo,
    dataset,
    max_iterations: maxIterations ?? 3,
    runtime_per_run: runtimePerRun ?? 120,
    goal,
  });
  return data;
}
