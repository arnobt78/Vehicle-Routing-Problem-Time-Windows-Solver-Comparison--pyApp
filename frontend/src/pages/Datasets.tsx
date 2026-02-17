import { useState } from "react";
import { useDatasets } from "@/hooks/useDatasets";
import {
  getDataset,
  getInstanceDownloadUrl,
  getDownloadAllInstancesUrl,
  getDownloadAllBksUrl,
} from "@/lib/api";
import { getInstanceMeta } from "@/lib/instanceLabels";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  Download,
  FileArchive,
  FileText,
  Filter,
  Trophy,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/common/Skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DatasetFilterId =
  | "all"
  | "c-type"
  | "r-type"
  | "rc-type"
  | "type-1"
  | "type-2"
  | "narrow"
  | "wide";

const datasetFilters: { id: DatasetFilterId; label: string }[] = [
  { id: "all", label: "All Sets" },
  { id: "c-type", label: "C-Type" },
  { id: "r-type", label: "R-Type" },
  { id: "rc-type", label: "RC-Type" },
  { id: "type-1", label: "Type-1" },
  { id: "type-2", label: "Type-2" },
  { id: "narrow", label: "Narrow Windows" },
  { id: "wide", label: "Wide Windows" },
];

function datasetMatchesFilter(
  name: string,
  filterId: DatasetFilterId,
): boolean {
  if (filterId === "all") return true;
  const meta = getInstanceMeta(name);
  if (!meta) return false;

  if (filterId === "c-type") return meta.group === "C-Type";
  if (filterId === "r-type") return meta.group === "R-Type";
  if (filterId === "rc-type") return meta.group === "RC-Type";
  if (filterId === "type-1") return meta.category === "Type-1";
  if (filterId === "type-2") return meta.category === "Type-2";
  if (filterId === "narrow") return meta.windows === "Narrow Windows";
  return meta.windows === "Wide Windows";
}

export function Datasets() {
  const { data: datasets, isLoading } = useDatasets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [datasetSearch, setDatasetSearch] = useState("");
  const [selectedDatasetFilter, setSelectedDatasetFilter] =
    useState<DatasetFilterId>("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-80" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-44 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-2">
                <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const normalizedDatasetSearch = datasetSearch.trim().toLowerCase();
  const selectedDatasetFilterLabel =
    datasetFilters.find((filter) => filter.id === selectedDatasetFilter)
      ?.label ?? "All Sets";

  const filteredDatasets = (datasets ?? []).filter((name) => {
    if (!datasetMatchesFilter(name, selectedDatasetFilter)) {
      return false;
    }

    if (!normalizedDatasetSearch) {
      return true;
    }

    const meta = getInstanceMeta(name);
    const haystack = [
      name,
      meta?.group,
      meta?.distribution,
      meta?.windows,
      meta?.category,
      meta?.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedDatasetSearch);
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="self-start rounded-lg bg-violet-100 p-3">
              <Database className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Available Datasets (Solomon Benchmark)
              </h2>
              <p className="text-md text-slate-500">
                Solomon-format VRPTW instances. Click to expand and view details
                and download options.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={getDownloadAllInstancesUrl()}
              download="vrptw-instances.zip"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <FileArchive className="h-4 w-4" />
              Download All Instances
            </a>
            <a
              href={getDownloadAllBksUrl()}
              download="vrptw-bks.zip"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-base font-medium text-emerald-800 transition-colors hover:bg-emerald-100 shadow-lg"
            >
              <Trophy className="h-4 w-4" />
              Download All BKS
            </a>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={datasetSearch}
                onChange={(event) => setDatasetSearch(event.target.value)}
                placeholder="Search instances (e.g., c101, rc201, wide, type-2)..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-base text-slate-900 shadow-lg transition-colors placeholder:text-slate-400"
                aria-label="Search datasets"
              />
              {datasetSearch && (
                <button
                  type="button"
                  onClick={() => setDatasetSearch("")}
                  className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear dataset search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{selectedDatasetFilterLabel}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Filter datasets
                </div>
                <DropdownMenuSeparator />
                {datasetFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => setSelectedDatasetFilter(filter.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{filter.label}</span>
                    {selectedDatasetFilter === filter.id ? (
                      <Check className="h-4 w-4 text-slate-700" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(datasetSearch || selectedDatasetFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setDatasetSearch("");
                  setSelectedDatasetFilter("all");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100"
              >
                <Filter className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Showing {filteredDatasets.length} of {(datasets ?? []).length}{" "}
            instances
            {selectedDatasetFilter !== "all"
              ? ` · ${selectedDatasetFilterLabel}`
              : ""}
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredDatasets.map((name) => (
            <DatasetItem
              key={name}
              name={name}
              expanded={expanded === name}
              onToggle={() => setExpanded(expanded === name ? null : name)}
            />
          ))}
          {filteredDatasets.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">
              No instances match your current search/filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DatasetItem({
  name,
  expanded,
  onToggle,
}: {
  name: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [copiedInstance, setCopiedInstance] = useState(false);

  const { data: info, isLoading } = useQuery({
    queryKey: ["dataset", name],
    queryFn: () => getDataset(name),
    enabled: expanded,
  });
  const meta = getInstanceMeta(name);
  const desc = meta?.description ?? "";

  const handleCopyInstance = async () => {
    if (!info) return;

    const lines = [
      `Instance: ${info.name}.txt`,
      `Group: ${meta?.group ?? "N/A"}`,
      `Distribution: ${meta?.distribution ?? "N/A"}`,
      `Windows: ${meta?.windows ?? "N/A"}`,
      `Category: ${meta?.category ?? "N/A"}`,
      `BKS Available: ${info.has_bks ? "Yes" : "No"}`,
    ];

    if (info.bks_cost != null) {
      lines.push(`BKS Cost: ${info.bks_cost}`);
    }

    if (info.bks_routes?.length) {
      lines.push(`BKS Routes: ${info.bks_routes.length}`);
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedInstance(true);
      setTimeout(() => setCopiedInstance(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="py-2">
      <button type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        <span className="font-medium text-slate-900">{name}</span>
        {desc && (
          <span className="text-sm font-normal text-slate-500">({desc})</span>
        )}
      </button>
      {expanded && (
        <div className="ml-6 mt-2 space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading details...
            </p>
          ) : info ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Instance:</span>
                  <span className="font-mono text-blue-700">
                    {info.name}.txt
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyInstance}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    title={copiedInstance ? "Copied" : "Copy instance summary"}
                  >
                    {copiedInstance ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>

                  <a
                    href={getInstanceDownloadUrl(info.name)}
                    download={`${info.name}.txt`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    title="Download instance .txt"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {meta && (
                  <>
                    <span className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                      {meta.group}
                    </span>
                    <span className="rounded-lg bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">
                      {meta.distribution}
                    </span>
                    <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                      {meta.windows}
                    </span>
                    <span className="rounded-lg bg-violet-100 px-2 py-1 text-xs font-medium text-violet-800">
                      {meta.category}
                    </span>
                  </>
                )}

                {info.has_bks ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2 py-1 text-sm font-medium text-emerald-800">
                    <Trophy className="h-4 w-4" />
                    Best-Known Solution available
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600">
                    Best-Known Solution not available
                  </div>
                )}
              </div>
              {info.bks_cost != null && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Trophy className="h-4 w-4 text-emerald-600" />
                    Best-Known Solution
                  </h4>
                  <p className="text-sm text-slate-600">
                    Cost:{" "}
                    <span className="font-medium text-slate-900">
                      {info.bks_cost}
                    </span>
                  </p>
                  {info.bks_routes && (
                    <>
                      <p className="mt-1 text-sm text-slate-600">
                        Routes: {info.bks_routes.length} vehicles
                      </p>
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Route details
                        </p>
                        <ul className="space-y-1.5 text-sm">
                          {info.bks_routes.map((route, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 rounded bg-slate-50 px-2 py-1.5 font-mono text-slate-700"
                            >
                              <span className="text-slate-500">
                                Vehicle {i + 1}:
                              </span>
                              <span>{route.join(" → ")}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">No details available</p>
          )}
        </div>
      )}
    </div>
  );
}
