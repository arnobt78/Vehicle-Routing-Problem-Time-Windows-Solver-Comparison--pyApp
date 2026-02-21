/** Displays execution log lines with optional typewriter effect on the last line while streaming. */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LogConsoleProps {
  logs: string[];
  isStreaming?: boolean;
  className?: string;
}

export function LogConsole({
  logs,
  isStreaming = false,
  className,
}: LogConsoleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [streamedChars, setStreamedChars] = useState(0);

  const completeLines = logs.slice(0, -1);
  const lastLine = logs[logs.length - 1] ?? "";

  const prevLogsRef = useRef<string[]>([]);
  const lastLineRef = useRef(lastLine);
  const lastLineKeyRef = useRef(lastLine);

  useEffect(() => {
    prevLogsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    lastLineRef.current = lastLine;
  }, [lastLine]);

  useEffect(() => {
    if (lastLine.length === 0) return;
    const id = setInterval(() => {
      setStreamedChars((c) => {
        const currentLine = lastLineRef.current;
        if (currentLine !== lastLineKeyRef.current) {
          lastLineKeyRef.current = currentLine;
          return 0;
        }
        if (c >= currentLine.length) return c;
        return c + 1;
      });
    }, 5);
    return () => clearInterval(id);
  }, [lastLine.length]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs, streamedChars]);

  return (
    <div
      ref={ref}
      className={cn(
        "log-console-scroll relative h-72 overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-[13px] leading-relaxed text-slate-300",
        className,
      )}
      // To re-enable the animated background, restore the inline style below.
      style={
        isStreaming
          ? {
              backgroundImage: "url(/code8.gif)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {isStreaming && (
        <div className="pointer-events-none absolute inset-0 bg-slate-950/0" />
      )}
      <div className="relative z-10">
        {logs.length === 0 && !isStreaming ? (
          <span className="text-slate-500">Waiting for logs...</span>
        ) : logs.length === 0 && isStreaming ? (
          <span className="text-slate-200">
            Streaming logs... preparing execution output
          </span>
        ) : (
          <>
            {completeLines.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">
                {line}
              </div>
            ))}
            {lastLine && (
              <div className="whitespace-pre-wrap break-all">
                {lastLine.slice(0, streamedChars)}
                {isStreaming && streamedChars < lastLine.length && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-emerald-400" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
