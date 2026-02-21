/** Route plot image with controls: refresh, copy summary, download PNG, fullscreen. Uses GET /results/{jobId}/plot (or cached URL). */
import { useEffect, useState } from "react";
import { Copy, MoreVertical, Download, Maximize2, Loader2, RefreshCw } from "lucide-react";
import { getPlotUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getAlgoDisplayName } from "@/constants/algorithms";
import { CopyButton } from "@/components/common/CopyButton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoutePlotWithControlsProps {
  jobId: string | null;
  algo?: string;
  dataset?: string;
  plotDataUrl?: string;
  /** When true, only show plot when plotDataUrl is provided (avoids double-request to backend). */
  preferCachedOnly?: boolean;
  className?: string;
}

export function RoutePlotWithControls({
  jobId,
  algo,
  dataset,
  plotDataUrl,
  preferCachedOnly = false,
  className,
}: RoutePlotWithControlsProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [failedPlotUrl, setFailedPlotUrl] = useState<string | null>(null);
  const [plotImageLoaded, setPlotImageLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const remotePlotUrl = jobId ? getPlotUrl(jobId, algo) : null;
  const plotUrl = plotDataUrl ?? (preferCachedOnly ? undefined : remotePlotUrl ?? undefined);
  const imageLoadFailed = !!plotUrl && failedPlotUrl === plotUrl;
  const waitingForCache = preferCachedOnly && !plotDataUrl && !!jobId;
  // If the plot image doesn't load within 15s (e.g. backend slow/hung), show unavailable
  useEffect(() => {
    if (!plotUrl || plotImageLoaded || failedPlotUrl === plotUrl) return;
    const t = setTimeout(() => setFailedPlotUrl(plotUrl), 15_000);
    return () => clearTimeout(t);
  }, [plotUrl, plotImageLoaded, failedPlotUrl]);

  const handleDownloadPng = async () => {
    if (!plotUrl) return;
    try {
      const res = await fetch(plotUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `route-${dataset ?? "solution"}-${algo ?? "result"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      /* ignore */
    }
  };

  if (!plotUrl && !waitingForCache) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-8 shadow-lg",
        className,
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Route visualization
        </h3>
        <div className="inline-flex items-center gap-2">
          <CopyButton
            getContent={() => plotUrl ?? ""}
            className="static inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          />
          <button
            type="button"
            onClick={() => {
              setFailedPlotUrl(null);
              setRefreshKey((k) => k + 1);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
            title="Redraw plot"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
            title="View large preview"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(plotUrl ?? "");
                  } catch {
                    /* ignore */
                  }
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy image URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPng}>
                <Download className="mr-2 h-4 w-4" />
                Download as .png
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => plotUrl && window.open(plotUrl, "_blank")}>
                Open in new tab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="relative flex h-[min(52vh,460px)] min-h-[260px] w-full items-center justify-center overflow-hidden">
          {imageLoadFailed ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center text-sm text-slate-600">
              Route plot is unavailable for this cached run. Please run the
              solver again to regenerate the visualization.
            </div>
          ) : waitingForCache ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-slate-50 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
              <p className="text-center text-sm font-medium text-slate-700">
                Generating calculated{" "}
                {getAlgoDisplayName(algo ?? "")} on {dataset ?? "instance"}{" "}
                plot...
              </p>
            </div>
          ) : (
            <>
              {!plotImageLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-slate-50">
                  <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
                  <p className="text-center text-sm font-medium text-slate-700">
                    Generating calculated{" "}
                    {getAlgoDisplayName(algo ?? "")} on {dataset ?? "instance"}{" "}
                    plot...
                  </p>
                </div>
              )}
              <img
                key={refreshKey}
                src={plotUrl}
                alt="Route plot"
                className={cn(
                  "max-h-full max-w-full object-contain",
                  !plotImageLoaded && "opacity-0",
                )}
                onLoad={() => setPlotImageLoaded(true)}
                onError={(event) => {
                  if (plotDataUrl && remotePlotUrl) {
                    event.currentTarget.src = remotePlotUrl;
                    return;
                  }
                  setFailedPlotUrl(plotUrl!);
                }}
              />
            </>
          )}
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] p-4" aria-describedby={undefined}>
          <div className="flex h-full flex-col">
            <DialogTitle className="mb-3 pr-8 text-sm font-medium text-slate-700">
              Route visualization preview
            </DialogTitle>
            <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
              {plotUrl ? (
                <img
                  src={plotUrl}
                  alt="Route plot preview"
                  className="mx-auto h-full max-h-full w-auto object-contain"
                  onError={(event) => {
                    if (plotDataUrl && remotePlotUrl) {
                      event.currentTarget.src = remotePlotUrl;
                      return;
                    }
                    setFailedPlotUrl(plotUrl);
                  }}
                />
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">
                  Plot not loaded yet.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
