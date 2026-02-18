import { useState } from "react";
import { Copy, MoreVertical, Download, Maximize2 } from "lucide-react";
import { getPlotUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
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
  className?: string;
}

export function RoutePlotWithControls({
  jobId,
  algo,
  dataset,
  plotDataUrl,
  className,
}: RoutePlotWithControlsProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [failedPlotUrl, setFailedPlotUrl] = useState<string | null>(null);

  const remotePlotUrl = jobId ? getPlotUrl(jobId, algo) : null;
  const plotUrl = plotDataUrl ?? remotePlotUrl;
  const imageLoadFailed = !!plotUrl && failedPlotUrl === plotUrl;

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

  if (!plotUrl) return null;

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
            getContent={() => plotUrl}
            className="static inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          />
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
                    await navigator.clipboard.writeText(plotUrl);
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
              <DropdownMenuItem onClick={() => window.open(plotUrl, "_blank")}>
                Open in new tab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="h-[min(52vh,460px)] min-h-[260px] w-full overflow-hidden">
          {imageLoadFailed ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center text-sm text-slate-600">
              Route plot is unavailable for this cached run. Please run the
              solver again to regenerate the visualization.
            </div>
          ) : (
            <img
              src={plotUrl}
              alt="Route plot"
              className="h-full w-full object-contain"
              onError={(event) => {
                if (plotDataUrl && remotePlotUrl) {
                  event.currentTarget.src = remotePlotUrl;
                  return;
                }
                setFailedPlotUrl(plotUrl);
              }}
            />
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
