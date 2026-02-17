import { Download, Copy, MoreVertical } from "lucide-react";
import { CopyButton } from "./CopyButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SectionActionsProps {
  getContent: () => string;
  /** Callback for .txt download (or custom). If omitted, uses getContent(). */
  onDownloadTxt?: () => void;
  /** Callback for .png download (plot). Required when downloadAsPng. */
  onDownloadPng?: () => void;
  /** Label for download, e.g. "summary" or "plot" */
  downloadLabel?: string;
  /** true = show Download as .png and use onDownloadPng */
  downloadAsPng?: boolean;
  className?: string;
}

export function SectionActions({
  getContent,
  onDownloadTxt,
  onDownloadPng,
  downloadLabel = "summary",
  downloadAsPng = false,
  className,
}: SectionActionsProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getContent());
    } catch {
      /* ignore */
    }
  };

  const handleDownloadTxt = () => {
    if (onDownloadTxt) {
      onDownloadTxt();
      return;
    }
    const blob = new Blob([getContent()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadLabel}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <CopyButton
        getContent={getContent}
        className="static inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      />
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
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy to clipboard
          </DropdownMenuItem>
          {!downloadAsPng && (
            <DropdownMenuItem onClick={handleDownloadTxt}>
              <Download className="mr-2 h-4 w-4" />
              Download as .txt
            </DropdownMenuItem>
          )}
          {downloadAsPng && onDownloadPng && (
            <DropdownMenuItem onClick={onDownloadPng}>
              <Download className="mr-2 h-4 w-4" />
              Download as .png
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const content = getContent();
              if (navigator.share && content.length < 1024 * 1024) {
                navigator
                  .share({
                    title: downloadLabel,
                    text: content,
                  })
                  .catch(() => {});
              }
            }}
          >
            Share...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
