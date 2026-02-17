import { useEffect, useState } from "react";

/** Returns elapsed seconds and a formatted MM:SS string. */
export function useStopwatch(running: boolean): {
  elapsed: number;
  formatted: string;
} {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) {
      const resetId = setTimeout(() => setElapsed(0), 0);
      return () => clearTimeout(resetId);
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  return { elapsed, formatted };
}
