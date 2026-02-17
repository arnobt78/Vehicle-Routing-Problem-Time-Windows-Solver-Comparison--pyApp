import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";

export type LogEvent = { type: "log"; line: string };
export type DoneEvent = {
  type: "done";
  status: string;
  result?: { routes: number[][]; cost: number; runtime: number };
  error?: string;
};

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
  const eventSourceRef = useRef<EventSource | null>(null);

  const clear = useCallback(() => {
    setLogs([]);
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled || !jobId) return;
    let finished = false;
    queueMicrotask(() => {
      clear();
      setStatus("running");
    });
    const base = getApiBaseUrl(algo);
    const url = `${base}/api/solve/${jobId}/stream`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

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
      es.close();
    });

    es.addEventListener("error", () => {
      if (finished) return;
      setStatus("failed");
      setError("Connection lost");
      es.close();
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [jobId, algo, clear, enabled]);

  return { logs, status, result, error, clear };
}
