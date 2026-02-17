import { useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getTestResultSets,
  getTestResultExperiments,
  getTestResultContent,
  getTestResultImageUrl,
} from "@/lib/api";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Files,
  Filter,
  GraduationCap,
  Loader2,
  Maximize2,
  Search,
  SlidersHorizontal,
  Trophy,
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
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ResearchPaper = {
  number: number;
  title: string;
  author: string;
  link: string;
};

type TestResultSet = { id: string; name: string };
type TestExperiment = {
  id: string;
  has_txt: boolean;
  txt_name: string | null;
  images: string[];
};

type PaperFilterId =
  | "all"
  | "reinforcement-learning"
  | "metaheuristics"
  | "genetic-pso"
  | "survey-review"
  | "classical-exact";

const paperFilters: { id: PaperFilterId; label: string }[] = [
  { id: "all", label: "All Papers" },
  { id: "reinforcement-learning", label: "Reinforcement Learning" },
  { id: "metaheuristics", label: "Metaheuristics" },
  { id: "genetic-pso", label: "Genetic / PSO" },
  { id: "survey-review", label: "Survey / Review" },
  { id: "classical-exact", label: "Classical / Exact" },
];

function paperMatchesFilter(paper: ResearchPaper, filterId: PaperFilterId) {
  if (filterId === "all") return true;

  const title = paper.title.toLowerCase();

  if (filterId === "reinforcement-learning") {
    return (
      title.includes("reinforcement learning") ||
      title.includes("deep reinforcement") ||
      title.includes("dynamic attention")
    );
  }

  if (filterId === "metaheuristics") {
    return (
      title.includes("metaheuristic") ||
      title.includes("tabu") ||
      title.includes("simulated annealing") ||
      title.includes("ant colony") ||
      title.includes("grasp")
    );
  }

  if (filterId === "genetic-pso") {
    return (
      title.includes("genetic") ||
      title.includes("particle swarm") ||
      title.includes("hybrid genetic search")
    );
  }

  if (filterId === "survey-review") {
    return (
      title.includes("survey") ||
      title.includes("review") ||
      title.includes("taxonomy") ||
      title.includes("variants") ||
      title.includes("state of the art")
    );
  }

  return (
    title.includes("exact") ||
    title.includes("dispatching") ||
    title.includes("insertion heuristics") ||
    title.includes("scheduling") ||
    title.includes("constraint-programming")
  );
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadJsonFile(fileName: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getTestResultContentUrl(setId: string, expId: string): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const s = encodeURIComponent(setId);
  const e = encodeURIComponent(expId);
  return `${base}/api/test-results/${s}/${e}/content`;
}

function getTestResultImageDownloadUrl(
  setId: string,
  expId: string,
  filename: string,
): string {
  return `${getTestResultImageUrl(setId, expId, filename)}?download=1`;
}

function getTestResultsZipUrl(): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return (
    import.meta.env.VITE_TEST_RESULTS_ZIP_URL || `${base}/test_results.zip`
  );
}

const thesisPaper: ResearchPaper = {
  number: 0,
  title:
    "Implementation and Evaluation of Approaches for Efficiently Solving Practical Vehicle Routing Problem by Using Machine Learning Algorithms",
  author: "Arnob Mahmud",
  link: "https://drive.google.com/file/d/1qjFvailZy3e42q3roDnzKDI5LeQVL6Nr/view?usp=sharing",
};

const referredResearchPapers: ResearchPaper[] = [
  {
    number: 1,
    title:
      "Deep Reinforcement Learning Algorithm for Fast Solutions to Vehicle Routing Problem with Time-Windows",
    author: "Abhinav Gupta, Supratim Ghosh, Anulekha Dhara",
    link: "https://drive.google.com/file/d/1piG4VWVYoc032BSBUDGbOFtOWKBcL29i/view?usp=sharing",
  },
  {
    number: 2,
    title:
      "A Deep Reinforcement Learning Algorithm Using Dynamic Attention Model for Vehicle Routing Problems",
    author: "Bo Peng, Jiahai Wang, Zizhen Zhang",
    link: "https://drive.google.com/file/d/1AV9m58Rc9n_xy-zzJsWhZiPr1r0qGTtA/view?usp=sharing",
  },
  {
    number: 3,
    title: "Reinforcement Learning for Solving the Vehicle Routing Problem",
    author:
      "Mohammadreza Nazari, Afshin Oroojlooy, Martin Takácˇ, Lawrence V. Snyder",
    link: "https://drive.google.com/file/d/1IZLzsVivLmZDotsInNZiB0OD4SWyshOv/view?usp=sharing",
  },
  {
    number: 5,
    title:
      "DISTANCE-CONSTRAINED VEHICLE ROUTING PROBLEM: EXACT AND APPROXIMATE SOLUTION",
    author: "Samira Almoustafa",
    link: "https://drive.google.com/file/d/1EvZoHDR7guDjZwxGfRFG_crioV_npSGM/view?usp=sharing",
  },
  {
    number: 6,
    title:
      "A GENETIC ALGORITHM FOR THE VEHICLE ROUTING PROBLEM WITH TIME WINDOWS",
    author: "Lin Cheng",
    link: "https://drive.google.com/file/d/1dTnmRJLJLZwgRLeia7ojW_aV5urxXZAP/view?usp=sharing",
  },
  {
    number: 7,
    title: "Vehicle routing problem with time windows and its solving methods",
    author: "Martin Macho",
    link: "https://drive.google.com/file/d/1xIo_p7Xdxanq5QJn8gIOLAUxF0nzhAxt/view?usp=sharing",
  },
  {
    number: 8,
    title: "Vehicle routing problem, its variants and solving methods",
    author: "Michal Pol ́ıvka",
    link: "https://drive.google.com/file/d/1EaNLmyasvOBH-tDGWa0LFDkmkhLKvsZc/view?usp=sharing",
  },
  {
    number: 9,
    title:
      "Time-Windowed Vehicle Routing Problem: Tabu Search Algorithm Approach",
    author: "Hasibe Berfu Demira, Ebru Pekel Özmenb, Sakir Esnafc",
    link: "https://drive.google.com/file/d/1FfYc3bUkxK1uFraH6WLBG3WoLGPKfYnW/view?usp=sharing",
  },
  {
    number: 10,
    title:
      "A Tabu Search Metaheuristic Algorithm for the Multiple Depot Vehicle Routing Problem with Time Windows",
    author: "Jonathan Abrie de Freitas",
    link: "https://drive.google.com/file/d/1j4vV4MjTQxIk1dmD5yFRJefPLMVd0bLE/view?usp=sharing",
  },
  {
    number: 11,
    title:
      "The vehicle routing problem in the last decade: variants, taxonomy and metaheuristics",
    author: "Said Elatara, Karim Abouelmehdib, Mohammed Essaid Riffia",
    link: "https://drive.google.com/file/d/1d3S1AqGh-ZwhrmtsSR07Zq3HCi1ufmKt/view?usp=sharing",
  },
  {
    number: 12,
    title: "Solution Methods for Some Variants of the Vehicle Routing Problem",
    author: "Ivona Gjeroska",
    link: "https://drive.google.com/file/d/1WNqyzSUgBQDJUHaRaKtdCDghNOpQRvML/view?usp=sharing",
  },
  {
    number: 13,
    title: "The Truck Dispatching Problem",
    author: "G. B. Dantzig and J. H. Ramser",
    link: "https://drive.google.com/file/d/1ur4qcL9stb3EFRWJkM-FrE8otBUQmxj6/view?usp=sharing",
  },
  {
    number: 14,
    title:
      "The Vehicle Routing Problem: State of the Art Classification and Review",
    author: "Kris Braekers, Katrien Ramaekers, Inneke Van Nieuwenhuyse",
    link: "https://drive.google.com/file/d/1OCpr8QuZuaFDO_SFtCxeF3JSxAkoVOIB/view?usp=sharing",
  },
  {
    number: 15,
    title:
      "A new metaheuristics for solving vehicle routing problem: Partial Comparison Optimization",
    author: "A Adhi1, B Santosa, N Siswanto",
    link: "https://drive.google.com/file/d/1yhT9qTnawZy43mr3LOavxRQMYKCDm7LY/view?usp=sharing",
  },
  {
    number: 16,
    title:
      "Metaheuristic Algorithms Based on Compromise Programming for the Multi-Objective Urban Shipment Problem",
    author:
      "Tung Son Ngo, Jafreezal Jaafar, Izzatdin Abdul Aziz, Muhammad Umar Aftab, Hoang Giang Nguyen, Ngoc Anh Bui",
    link: "https://drive.google.com/file/d/1lIYA4OTme9YGCsgLinLICG2tPQxEjbXv/view?usp=sharing",
  },
  {
    number: 17,
    title:
      "Particle Swarm Optimization Algorithm to Solve Vehicle Routing Problem with Fuel Consumption Minimization",
    author: "Baiq Nurul Izzah Farida Ramadhani, Annisa Kesy Garside",
    link: "https://drive.google.com/file/d/1EoJg8kLgXeyF6F_so3sgsrVCc0vn4n36/view?usp=sharing",
  },
  {
    number: 18,
    title:
      "Comparing genetic algorithm and particle swarm optimization for solving capacitated vehicle routing problem",
    author: "T Iswari, A M S Asih",
    link: "https://drive.google.com/file/d/10qb5W_woeBmMsxUIE_5PLB8AGJB0Vht5/view?usp=sharing",
  },
  {
    number: 19,
    title:
      "A Combination of Genetic Algorithm and Particle Swarm Optimization for Vehicle Routing Problem with Time Windows",
    author: "Sheng-Hua Xu, Ji-Ping Liu, Fu-Hao Zhang, Liang Wang, Li-Jian Sun",
    link: "https://drive.google.com/file/d/1IUugPb1vs8yZWdZDD4otusyr_cu5ineh/view?usp=sharing",
  },
  {
    number: 20,
    title:
      "Computational Logistics of the Vehicle Routing Problem with Time Windows",
    author: "Krupa Prag",
    link: "https://drive.google.com/file/d/1W-WENM57nDdF_F_t_vc8mhrJFxUcIXMT/view?usp=sharing",
  },
  {
    number: 21,
    title:
      "A hybrid genetic algorithm with adaptive diversity management for a large class of vehicle routing problems with time-windows",
    author: "Thibaut Vidal, Teodor Gabriel Crainic, Michel Gendreau",
    link: "https://drive.google.com/file/d/1nsGmSU0B-hZmqMg6qU9KJ9fMt6Wf7TJ1/view?usp=sharing",
  },
  {
    number: 22,
    title:
      "Hybrid genetic search for the CVRP: Open-source implementation and SWAP* neighborhood",
    author: "Thibaut Vidal",
    link: "https://drive.google.com/file/d/1tt0lp2gYBEOjwJ20DqqTlSqejIB1WO_j/view?usp=sharing",
  },
  {
    number: 23,
    title:
      "Algorithms for the Vehicle Routing and Scheduling Problems with Time Window Constraints",
    author: "Marius M. Solomon",
    link: "https://drive.google.com/file/d/177j9EOc3z75WNy-30KzTAbbo0hSQik66/view?usp=sharing",
  },
  {
    number: 24,
    title:
      "Vehicle Routing Problem with Time Windows, Part I: Route Construction and Local Search Algorithms",
    author: "Olli Bräysy, Michel Gendreau",
    link: "https://drive.google.com/file/d/1Cxj9yZ0TbzZS1SMQtprgYAbThe5LI17x/view?usp=sharing",
  },
  {
    number: 25,
    title:
      "OR-Tools’ Vehicle Routing Solver: a Generic Constraint-Programming Solver with Heuristic Search for Routing Problems",
    author:
      "Thibaut Cuvelier, Frederic Didier, Vincent Furnon, Steven Gay, Sarah, Mohajeri, Laurent Perron",
    link: "https://drive.google.com/file/d/1DMgGpQM2zqks1HKA31Lhcjwjli2bmepW/view?usp=sharing",
  },
  {
    number: 26,
    title: "Vehicle Routing Problem With Time Windows, Part II: Metaheuristics",
    author: "Olli Bräysy, Michel Gendreau",
    link: "https://drive.google.com/file/d/1TTVwPKpmBJv664nSuqZwOv_cwYy1x40o/view?usp=sharing",
  },
  {
    number: 27,
    title:
      "Efficient Insertion Heuristics for Vehicle Routing and Scheduling Problems",
    author: "Ann Melissa Campbell, Martin Savelsbergh",
    link: "https://drive.google.com/file/d/1WmclxXKAO8RSivyuRnHHaIv9zBTHs850/view?usp=sharing",
  },
  {
    number: 28,
    title:
      "Comparison of Capabilities of Recent Open-Source Tools for Solving Capacitated Routing Problems with Time Windows",
    author: "Marek Karakul, Jerzy Duda, Iwona Skalna",
    link: "https://drive.google.com/file/d/1TtJE4kTinmXd7DOK1M2qJ2MDTHeS76Ch/view?usp=sharing",
  },
  {
    number: 29,
    title:
      "Vehicle routing problem with time windows and a limited number of vehicles",
    author: "Hoong Chuin Lau, Melvyn Sim, Kwong Meng Teo",
    link: "https://drive.google.com/file/d/1wvsAJgiAfl7CRZYMBO8BUGyuCrBJCKic/view?usp=sharing",
  },
  {
    number: 30,
    title:
      "Vehicle Routing Problems with Time Windows Using Simulated Annealing",
    author: "S.W. Lin, K.C. Ying, Z.J. Lee, H.S. Chen",
    link: "https://drive.google.com/file/d/1jhYCzX0lkVpC5k8rzVN5gOGRy-208rpf/view?usp=sharing",
  },
  {
    number: 31,
    title:
      "SOLVING PRACTICAL VEHICLE ROUTING PROBLEM WITH TIME WINDOWS USING METAHEURISTIC ALGORITHMS",
    author: "FILIP TANER, ANTE GALIĆ, TONČI CARIĆ",
    link: "https://drive.google.com/file/d/15tOohGxKf_hUXsToIXYFpdE7pJfFiGZm/view?usp=sharing",
  },
  {
    number: 32,
    title:
      "Hybrid Genetic Search for the Vehicle Routing Problem with Time Windows: a High-Performance Implementation",
    author:
      "Wouter Kool, Joep Olde Juninck, Ernst Roos, Kamiel Cornelissen, Pim Agterberg, Jelke van Hoorn, Thomas Visser",
    link: "https://drive.google.com/file/d/1fLa4xFKVgK5xfvhIHapEmdXInvlXiIYi/view?usp=sharing",
  },
  {
    number: 33,
    title:
      "Optimizing the Vehicle Routing Problem With Time Windows: A Discrete Particle Swarm Optimization Approach",
    author:
      "Yue-Jiao Gong, Jun Zhang, Ou Liu, Rui-Zhang Huang, Henry Shu-Hung Chung, Yu-Hui Shi",
    link: "https://drive.google.com/file/d/1c1gpc9VQhTMTHUoh0tKuypvx6LHkYFpJ/view?usp=sharing",
  },
  {
    number: 34,
    title:
      "Capacitated Vehicle Routing Problem with Time Windows (CVRPTW) Solution Documentation",
    author: "Rafael Josip Penić, Mario Pavečić",
    link: "https://drive.google.com/file/d/1VJJ4jGkcxP6tocSoTjYksbTgLyzvlj0a/view?usp=sharing",
  },
  {
    number: 35,
    title: "Capacitated Vehicle Routing Problem with Time Windows",
    author: "Rafael Josip Penić, Mario Pavečić",
    link: "https://drive.google.com/file/d/1z3q7BEqDJuy-DeRAI1e1giCSeFLHdhQg/view?usp=sharing",
  },
  {
    number: 36,
    title:
      "A Reactive Greedy Randomized Variable Neighborhood Tabu Search for the Vehicle Routing Problem with Time Windows",
    author:
      "Panagiotis P. Repoussis, Dimitris C. Paraskevopoulos, George Ioannou",
    link: "https://drive.google.com/file/d/1XUl0p9metXtsWy4jgt40JlzK5B4j1IJU/view?usp=sharing",
  },
  {
    number: 37,
    title:
      "Greedy Randomized Adaptive Search Procedures: Advances, Hybridizations, and Applications",
    author: "Mauricio G. C. Resende, Celso C. Ribeiro",
    link: "https://drive.google.com/file/d/1EwQ7-0-5IjVIIgZQl_lteQ_urUT43Gyg/view?usp=sharing",
  },
  {
    number: 38,
    title:
      "MACS-VRPTW: A MULTIPLE ANT COLONY SYSTEM FOR VEHICLE ROUTING PROBLEMS WITH TIME WINDOWS",
    author: "Luca Maria Gambardella, Éric Taillard, Giovanni Agazzi",
    link: "https://drive.google.com/file/d/1_clHl7jC6ZCBCLSleu4455xN38ExnR8B/view?usp=sharing",
  },
];

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-4 w-[520px]" />
            <Skeleton className="h-4 w-[420px]" />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-2">
              <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-44" />
              </div>
              <div className="ml-6 mt-2 space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Results() {
  const { data: sets, isLoading } = useQuery({
    queryKey: ["test-results-sets"],
    queryFn: getTestResultSets,
  });

  const experimentsPreviewQueries = useQueries({
    queries: (sets ?? []).map((set) => ({
      queryKey: ["test-results-experiments-preview", set.id],
      queryFn: () => getTestResultExperiments(set.id),
      enabled: !!sets?.length,
      staleTime: 60_000,
    })),
  });

  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [resultsSearch, setResultsSearch] = useState("");
  const [selectedResultsSetFilter, setSelectedResultsSetFilter] =
    useState<string>("all");
  const [isDownloadingAllResults, setIsDownloadingAllResults] = useState(false);

  const [paperSearch, setPaperSearch] = useState("");
  const [selectedPaperFilter, setSelectedPaperFilter] =
    useState<PaperFilterId>("all");

  const experimentsBySet = (sets ?? []).reduce<
    Record<string, TestExperiment[]>
  >((acc, set, index) => {
    acc[set.id] = (experimentsPreviewQueries[index]?.data ?? []).map((exp) => ({
      id: exp.id,
      has_txt: exp.has_txt,
      txt_name: exp.txt_name,
      images: exp.images,
    }));
    return acc;
  }, {});

  const normalizedResultsSearch = resultsSearch.trim().toLowerCase();
  const selectedResultsSetLabel =
    selectedResultsSetFilter === "all"
      ? "All Sets"
      : (sets?.find((set) => set.id === selectedResultsSetFilter)?.name ??
        "All Sets");

  const filteredResultSets = (sets ?? []).filter((set) => {
    if (
      selectedResultsSetFilter !== "all" &&
      set.id !== selectedResultsSetFilter
    ) {
      return false;
    }

    if (!normalizedResultsSearch) {
      return true;
    }

    const matchesSet =
      set.name.toLowerCase().includes(normalizedResultsSearch) ||
      set.id.toLowerCase().includes(normalizedResultsSearch);

    const matchesExperiment = (experimentsBySet[set.id] ?? []).some((exp) =>
      exp.id.toLowerCase().includes(normalizedResultsSearch),
    );

    return matchesSet || matchesExperiment;
  });

  const normalizedSearch = paperSearch.trim().toLowerCase();
  const selectedFilterLabel =
    paperFilters.find((filter) => filter.id === selectedPaperFilter)?.label ??
    "All Papers";

  const filteredPapers = referredResearchPapers.filter((paper) => {
    const matchesText =
      !normalizedSearch ||
      paper.title.toLowerCase().includes(normalizedSearch) ||
      paper.author.toLowerCase().includes(normalizedSearch) ||
      String(paper.number).includes(normalizedSearch);

    const matchesCategory = paperMatchesFilter(paper, selectedPaperFilter);

    return matchesText && matchesCategory;
  });

  const handleDownloadAllResults = async () => {
    if (!sets?.length) return;

    setIsDownloadingAllResults(true);
    try {
      const exportedSets = await Promise.all(
        sets.map(async (set) => {
          const preview = experimentsBySet[set.id] ?? [];
          const experiments =
            preview.length > 0
              ? preview
              : await getTestResultExperiments(set.id);

          return {
            id: set.id,
            name: set.name,
            experiments: experiments.map((exp) => ({
              id: exp.id,
              has_txt: exp.has_txt,
              txt_name: exp.txt_name,
              content_url: exp.has_txt
                ? getTestResultContentUrl(set.id, exp.id)
                : null,
              images: exp.images,
              image_urls: exp.images.map((img) =>
                getTestResultImageUrl(set.id, exp.id, img),
              ),
            })),
          };
        }),
      );

      downloadJsonFile(
        `vrptw-test-results-${new Date().toISOString().slice(0, 10)}.json`,
        {
          generated_at: new Date().toISOString(),
          total_sets: exportedSets.length,
          sets: exportedSets,
        },
      );
    } finally {
      setIsDownloadingAllResults(false);
    }
  };

  const handleDownloadAllResultsZip = () => {
    const url = getTestResultsZipUrl();
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vrptw-test-results.zip";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  if (isLoading) {
    return <ResultsSkeleton />;
  }

  if (!sets?.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Test Results
        </h2>
        <p className="text-slate-600">No experiment results found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="self-start rounded-lg bg-green-100 p-4">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Best-Known Solutions & Algorithm Results
              </h2>
              <p className="text-md text-slate-500">
                Explore experiment sets with different tuning choices. Expand
                each set to see best-known solutions, algorithm outputs, and
                plots. Note: HGS, GLS, SA, and ACO results are grouped together
                for quick comparison (0.6 venv). ILS results from the pyVRP 0.13
                venv were not captured at that time.
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100"
                title="Download all results"
              >
                <Download className="h-4 w-4" />
                Download All Results
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Export format
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadAllResultsZip}>
                <Download className="h-4 w-4" />
                Download as .zip
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownloadAllResults}
                disabled={isDownloadingAllResults}
              >
                {isDownloadingAllResults ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download as .json
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={resultsSearch}
                onChange={(event) => setResultsSearch(event.target.value)}
                placeholder="Search sets or instances (e.g., c101, r201, Ex.1)..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-base text-slate-900 shadow-lg transition-colors placeholder:text-slate-400"
                aria-label="Search test result sets"
              />
              {resultsSearch && (
                <button
                  type="button"
                  onClick={() => setResultsSearch("")}
                  className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear set search"
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
                  <span>{selectedResultsSetLabel}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Filter sets
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSelectedResultsSetFilter("all")}
                  className="flex items-center justify-between"
                >
                  <span>All Sets</span>
                  {selectedResultsSetFilter === "all" ? (
                    <Check className="h-4 w-4 text-slate-700" />
                  ) : null}
                </DropdownMenuItem>
                {(sets ?? []).map((set) => (
                  <DropdownMenuItem
                    key={set.id}
                    onClick={() => setSelectedResultsSetFilter(set.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{set.name}</span>
                    {selectedResultsSetFilter === set.id ? (
                      <Check className="h-4 w-4 text-slate-700" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(resultsSearch || selectedResultsSetFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setResultsSearch("");
                  setSelectedResultsSetFilter("all");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100"
              >
                <Filter className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Showing {filteredResultSets.length} of {(sets ?? []).length} sets
            {selectedResultsSetFilter !== "all"
              ? ` · ${selectedResultsSetLabel}`
              : ""}
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredResultSets.map((set) => (
            <ExperimentSetItem
              key={set.id}
              set={set}
              searchTerm={normalizedResultsSearch}
              expanded={expandedSet === set.id}
              onToggleSet={() => {
                setExpandedSet(expandedSet === set.id ? null : set.id);
                setExpandedExp(null);
              }}
              expandedExp={expandedExp}
              onToggleExp={setExpandedExp}
            />
          ))}
          {filteredResultSets.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">
              No result sets match your current search/filter.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-start gap-4">
          <div className="self-start rounded-lg bg-blue-100 p-4">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              My MSc Thesis Paper
            </h2>
            <p className="text-md text-slate-500">
              Primary thesis document. Click the title to open in a new tab via
              Google Drive with view and downloadable access.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-lg">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Title:</span>{" "}
            <a
              href={thesisPaper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-sky-700 transition-colors hover:text-sky-800 hover:underline"
            >
              {thesisPaper.title}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Author:</span>{" "}
            {thesisPaper.author}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-start gap-4">
          <div className="self-start rounded-lg bg-amber-100 p-4">
            <Files className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Downloadable Referred Research Papers
            </h2>
            <p className="text-md text-slate-500">
              Search by paper number, title, or author, then open each title in
              a new tab via Google Drive for viewing and downloadable access.
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={paperSearch}
                onChange={(event) => setPaperSearch(event.target.value)}
                placeholder="Search papers by number, title, or author..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-base text-slate-900 shadow-lg transition-colors placeholder:text-slate-400"
                aria-label="Search research papers"
              />
              {paperSearch && (
                <button
                  type="button"
                  onClick={() => setPaperSearch("")}
                  className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
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
                  <span>{selectedFilterLabel}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Filter papers
                </div>
                <DropdownMenuSeparator />
                {paperFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => setSelectedPaperFilter(filter.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{filter.label}</span>
                    {selectedPaperFilter === filter.id ? (
                      <Check className="h-4 w-4 text-slate-700" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(paperSearch || selectedPaperFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setPaperSearch("");
                  setSelectedPaperFilter("all");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100"
              >
                <Filter className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Showing {filteredPapers.length} of {referredResearchPapers.length}{" "}
            papers
            {selectedPaperFilter !== "all" ? ` · ${selectedFilterLabel}` : ""}
          </p>
        </div>

        <div className="space-y-3">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => (
              <div
                key={paper.number}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-lg transition-colors hover:bg-slate-100"
              >
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Title:</span>{" "}
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-sky-700 transition-colors hover:text-sky-800 hover:underline"
                  >
                    {paper.title}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Author:</span>{" "}
                  {paper.author}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center shadow-lg">
              <p className="text-sm font-medium text-slate-700">
                No papers match your search.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try a different keyword from title, author, or paper number.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperimentSetItem({
  set,
  searchTerm,
  expanded,
  onToggleSet,
  expandedExp,
  onToggleExp,
}: {
  set: TestResultSet;
  searchTerm: string;
  expanded: boolean;
  onToggleSet: () => void;
  expandedExp: string | null;
  onToggleExp: (id: string | null) => void;
}) {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ["test-results-experiments", set.id],
    queryFn: () => getTestResultExperiments(set.id),
    enabled: expanded,
  });

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibleExperiments = (experiments ?? []).filter((exp) => {
    if (!normalizedSearchTerm) return true;
    return (
      exp.id.toLowerCase().includes(normalizedSearchTerm) ||
      set.name.toLowerCase().includes(normalizedSearchTerm)
    );
  });

  return (
    <div className="py-2">
      <button type="button"
        onClick={onToggleSet}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        <span className="font-medium text-slate-900">{set.name}</span>
      </button>
      {expanded && (
        <div className="ml-6 mt-2 space-y-2">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading experiments...</p>
          ) : visibleExperiments.length > 0 ? (
            visibleExperiments.map((exp) => (
              <ExperimentItem
                key={exp.id}
                setId={set.id}
                exp={exp}
                expanded={expandedExp === `${set.id}/${exp.id}`}
                onToggle={() =>
                  onToggleExp(
                    expandedExp === `${set.id}/${exp.id}`
                      ? null
                      : `${set.id}/${exp.id}`,
                  )
                }
              />
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center shadow-lg text-sm text-slate-500">
              No instances in this set match the current search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ExperimentItem({
  setId,
  exp,
  expanded,
  onToggle,
}: {
  setId: string;
  exp: TestExperiment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [copiedInstance, setCopiedInstance] = useState(false);
  const [isDownloadingInstance, setIsDownloadingInstance] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ["test-results-content", setId, exp.id],
    queryFn: () => getTestResultContent(setId, exp.id),
    enabled: expanded && exp.has_txt,
  });

  const handleCopyInstance = async () => {
    try {
      const textToCopy = exp.has_txt
        ? (content ?? (await getTestResultContent(setId, exp.id)))
        : `Set: ${setId}\nInstance: ${exp.id}\nImages:\n${exp.images
            .map((img) => `- ${getTestResultImageUrl(setId, exp.id, img)}`)
            .join("\n")}`;

      await navigator.clipboard.writeText(textToCopy);
      setCopiedInstance(true);
      setTimeout(() => setCopiedInstance(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleDownloadInstance = async () => {
    setIsDownloadingInstance(true);
    try {
      if (exp.has_txt) {
        const text = content ?? (await getTestResultContent(setId, exp.id));
        downloadTextFile(`${exp.id}.txt`, text);
      } else {
        downloadJsonFile(`${exp.id}.json`, {
          set_id: setId,
          instance_id: exp.id,
          has_txt: false,
          images: exp.images,
          image_urls: exp.images.map((img) =>
            getTestResultImageUrl(setId, exp.id, img),
          ),
        });
      }
    } finally {
      setIsDownloadingInstance(false);
    }
  };

  const handleDownloadImage = (imageName: string) => {
    const downloadUrl = getTestResultImageDownloadUrl(setId, exp.id, imageName);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = imageName;
    anchor.click();
  };

  const selectedImageUrl = selectedImage
    ? getTestResultImageUrl(setId, exp.id, selectedImage)
    : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50">
      <button type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-slate-100 cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        <FileText className="h-4 w-4 text-slate-500" />
        <span className="font-medium text-slate-800">{exp.id}</span>
        {exp.images.length > 0 && (
          <span className="text-xs text-slate-500">
            ({exp.images.length} plots)
          </span>
        )}
      </button>
      {expanded && (
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCopyInstance}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title={copiedInstance ? "Copied" : "Copy instance result"}
            >
              {copiedInstance ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadInstance}
              disabled={isDownloadingInstance}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              title={exp.has_txt ? "Download result text" : "Download metadata"}
            >
              {isDownloadingInstance ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
          </div>

          {exp.has_txt && (
            <>
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading results...</p>
              ) : content ? (
                <pre className="mb-4 max-h-80 overflow-auto rounded-lg bg-white p-4 text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {content}
                </pre>
              ) : null}
            </>
          )}
          {exp.images.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {exp.images.map((img) => (
                <div
                  key={img}
                  className="rounded-lg border border-slate-200 bg-white p-2"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className="group block rounded"
                    title="Open plot preview"
                  >
                    <img
                      src={getTestResultImageUrl(setId, exp.id, img)}
                      alt={img}
                      className="max-h-48 w-auto rounded object-contain transition-opacity group-hover:opacity-90"
                    />
                  </button>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">{img}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title="View plot"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(img)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title="Download plot"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog
            open={selectedImage !== null}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedImage(null);
              }
            }}
          >
            <DialogContent className="h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] p-4">
              <div className="flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between pr-8">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {selectedImage ?? "Plot preview"}
                  </p>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(selectedImage)}
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                      title="Download this plot"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
                  {selectedImageUrl && (
                    <img
                      src={selectedImageUrl}
                      alt={selectedImage ?? "Selected plot"}
                      className="mx-auto h-full max-h-full w-auto object-contain"
                    />
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
