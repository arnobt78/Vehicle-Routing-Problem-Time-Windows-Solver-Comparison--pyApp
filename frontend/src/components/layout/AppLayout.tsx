import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Play,
  GitCompare,
  Database,
  BarChart3,
  Code2,
  Globe,
  Mail,
  FileText,
} from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Solver } from "@/pages/Solver";
import { Compare } from "@/pages/Compare";
import { Datasets } from "@/pages/Datasets";
import { Results } from "@/pages/Results";
import { Home as HomePage } from "@/pages/Home";
import { ApiStatusDocumentation } from "../../pages/ApiStatusDocumentation";

type TabId = "home" | "solver" | "compare" | "datasets" | "results";

const TABS: {
  id: TabId;
  label: string;
  path: string;
  icon: React.ReactNode;
}[] = [
  { id: "home", label: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
  {
    id: "solver",
    label: "Run Single Algorithm",
    path: "/solver",
    icon: <Play className="h-4 w-4" />,
  },
  {
    id: "compare",
    label: "Compare All Algorithms",
    path: "/compare",
    icon: <GitCompare className="h-4 w-4" />,
  },
  {
    id: "datasets",
    label: "Datasets & BKS",
    path: "/datasets",
    icon: <Database className="h-4 w-4" />,
  },
  {
    id: "results",
    label: "Experiment Results",
    path: "/results",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

function TabContent({ activeTab }: { activeTab: TabId }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: "power2.out" },
    );
  }, []);
  return (
    <div ref={ref}>
      {activeTab === "home" && <HomePage />}
      {activeTab === "solver" && <Solver />}
      {activeTab === "compare" && <Compare />}
      {activeTab === "datasets" && <Datasets />}
      {activeTab === "results" && <Results />}
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab: TabId =
    (TABS.find((t) => t.path === location.pathname)?.id as TabId) ?? "solver";

  const handleTabChange = (tab: TabId) => {
    const t = TABS.find((x) => x.id === tab);
    if (t) navigate(t.path);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-50 bg-white shadow-lg">
        <div className="mx-auto max-w-9xl px-2 lg:px-4 xl:px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-200 p-4">
                <img
                  src="/route-black.svg"
                  alt="VRPTW Solver logo"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  VRPTW Metaheuristic Benchmark Suite
                </h1>
                <p className="text-md font-medium text-slate-500">
                  Run, compare, and visualize Vehicle Routing Problem with Time
                  Windows (VRPTW) solvers on Solomon instances <br /> with
                  best-known solution tracking with AI assistance.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/api-status-documentation")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-50 hover:border-slate-400 cursor-pointer",
                location.pathname === "/api-status-documentation" &&
                  "border-sky-500 bg-sky-50 text-sky-800",
              )}
            >
              <FileText className="h-4 w-4" />
              API Status & Docs
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 rounded-lg bg-slate-100 p-1 mx-auto w-full shadow-lg">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-base font-medium transition-colors cursor-pointer hover:bg-white",
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-9xl px-2 lg:px-4 xl:px-6 py-4 sm:py-6">
        {location.pathname === "/api-status-documentation" ? (
          <ApiStatusDocumentation />
        ) : (
          <TabContent key={activeTab} activeTab={activeTab} />
        )}
      </main>

      <footer className="mx-auto max-w-9xl px-2 lg:px-4 xl:px-6 py-6">
        <div className="border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-200 p-3">
                <img
                  src="/route-black.svg"
                  alt="VRPTW Solver logo"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900">
                  VRPTW Solver
                </h1>
                <p className="text-sm text-slate-500">
                  {new Date().getFullYear()}. All rights reserved.
                </p>
              </div>
            </div>

            <div className="space-y-2 md:text-right">
              <p className="text-sm text-slate-600">
                Feel free to contact, explore & extend this project.
              </p>
              <TooltipProvider>
                <div className="flex items-center justify-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://github.com/arnobt78?tab=repositories"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub repositories"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Code2 className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>GitHub</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://www.arnobmahmud.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Personal website"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Personal Website</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="mailto:contact@arnobmahmud.com"
                        aria-label="Send email"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Send Email</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
