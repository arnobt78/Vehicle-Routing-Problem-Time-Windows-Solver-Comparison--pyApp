import { getPlotUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RoutePlotProps {
  jobId: string | null;
  /** When using two backends (Option A), pass algo so ILS plot is fetched from ILS backend. */
  algo?: string;
  className?: string;
}

export function RoutePlot({ jobId, algo, className }: RoutePlotProps) {
  if (!jobId) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-lg",
        className,
      )}
    >
      <h3 className="mb-2 font-semibold text-slate-900">Route visualization</h3>
      <img
        src={getPlotUrl(jobId, algo)}
        alt="Route plot"
        className="max-h-96 w-full object-contain"
      />
    </div>
  );
}
