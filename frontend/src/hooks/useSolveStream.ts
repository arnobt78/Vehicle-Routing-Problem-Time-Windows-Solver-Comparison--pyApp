import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBaseUrl, getResult } from "@/lib/api";

export type LogEvent = { type: "log"; line: string };
export type DoneEvent = {
  type: "done";
  status: string;
  result?: { routes: number[][]; cost: number; runtime: number };
  error?: string;
};

const POLL_INTERVAL_MS = 5000;

export function useSolveStream(
  jobId: string | null,
  algo?: string,
  enabled = true,
) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "idle" | "running" | "done" | "failed" | "stopped"
  >("idle");
  const [result, setResult] = useState<{
    routes: number[][];
    cost: number;
    runtime: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** True when the live stream dropped and we are polling for status instead. */
  const [connectionLost, setConnectionLost] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    setLogs([]);
    setStatus("idle");
    setResult(null);
    setError(null);
    setConnectionLost(false);
  }, []);

  useEffect(() => {
    if (!enabled || !jobId) return;
    let finished = false;
    queueMicrotask(() => {
      clear();
      setStatus("running");
      setConnectionLost(false);
    });
    const base = getApiBaseUrl(algo);
    const url = `${base}/api/solve/${jobId}/stream`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    es.addEventListener("log", (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { line: string };
        setLogs((prev) => [...prev, d.line]);
      } catch {
        /* ignore parse errors */
      }
    });

    es.addEventListener("done", (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as {
          status: string;
          result?: { routes: number[][]; cost: number; runtime: number };
          error?: string;
        };
        setStatus(
          d.status === "completed"
            ? "done"
            : d.status === "stopped"
              ? "stopped"
              : "failed",
        );
        setResult(d.result ?? null);
        setError(d.error ?? null);
      } catch {
        /* ignore parse errors */
      }
      finished = true;
      stopPolling();
      es.close();
    });

    es.addEventListener("error", () => {
      if (finished) return;
      es.close();
      eventSourceRef.current = null;
      setConnectionLost(true);
      setError("Connection lost. Checking status…");
      stopPolling();
      pollIntervalRef.current = setInterval(async () => {
        if (!jobId || !algo) return;
        try {
          const r = await getResult(jobId, algo);
          if (r.status === "completed") {
            setStatus("done");
            setResult(r.result ?? null);
            setError(null);
            setConnectionLost(false);
            stopPolling();
            return;
          }
          if (r.status === "failed") {
            setStatus("failed");
            setError(r.error ?? "Job failed");
            setConnectionLost(false);
            stopPolling();
            return;
          }
          if (r.status === "stopped") {
            setStatus("stopped");
            setError(r.error ?? "Stopped");
            setConnectionLost(false);
            stopPolling();
            return;
          }
        } catch {
          /* keep polling on network errors */
        }
      }, POLL_INTERVAL_MS);
    });

    return () => {
      stopPolling();
      es.close();
      eventSourceRef.current = null;
    };
  }, [jobId, algo, clear, enabled]);

  return { logs, status, result, error, connectionLost, clear };
}
