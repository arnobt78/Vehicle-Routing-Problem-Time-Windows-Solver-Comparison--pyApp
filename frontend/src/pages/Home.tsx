import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ALGO_IDS, getAlgoDisplayName } from "@/constants/algorithms";
import { FAQ_ITEMS } from "@/data/faqContent";
import { getRagStatus, postAiAsk, postRagReindex } from "@/lib/api";
import {
  Route,
  Play,
  GitCompare,
  Database,
  BarChart3,
  BookOpen,
  Zap,
  Brain,
  Bot,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/lib/toast";

const ALGO_ICONS: Record<string, React.ReactNode> = {
  hgs: <Brain className="h-4 w-4" />,
  ils: <Zap className="h-4 w-4" />,
  aco: <Route className="h-4 w-4" />,
  sa: <Zap className="h-4 w-4" />,
  gls: <Brain className="h-4 w-4" />,
};

let ragAutoBootstrapInFlight = false;
let ragAutoBootstrapCompleted = false;

const FAQ_ANCHOR_REGEX = /<a\s+href="([^"]+)"\s*>(.*?)<\/a>/gi;

function renderFaqParagraph(para: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = FAQ_ANCHOR_REGEX.exec(para)) !== null) {
    const [fullMatch, hrefRaw, textRaw] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;

    if (matchStart > lastIndex) {
      nodes.push(para.slice(lastIndex, matchStart));
    }

    const href = hrefRaw.trim();
    const text = textRaw.trim();
    const isSafeHref = /^https?:\/\/|^mailto:|^\//i.test(href);

    if (isSafeHref) {
      nodes.push(
        <a
          key={`${href}-${matchStart}`}
          href={href}
          className="text-sky-700 underline underline-offset-2 hover:text-sky-800"
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {text}
        </a>,
      );
    } else {
      nodes.push(text);
    }

    lastIndex = matchEnd;
  }

  if (lastIndex < para.length) {
    nodes.push(para.slice(lastIndex));
  }

  return nodes;
}

export function Home() {
  return (
    <div className="space-y-8">
      {/* Hero / Intro */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-rose-100 p-4">
            <Route className="h-6 w-6 text-rose-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">
              VRPTW Solver Comparison
            </h1>
            <p className="text-md text-slate-700">
              Compare metaheuristic algorithms for the{" "}
              <strong>Vehicle Routing Problem with Time Windows (VRPTW)</strong>
              . Run HGS, ILS, ACO, SA, and GLS on Solomon benchmark instances,
              visualize routes, and benchmark against Best-Known Solutions
              (BKS).
            </p>
            <p className="text-md text-slate-500">
              An educational (Research/Theory/Practical) tool for understanding
              NP-hard optimization, heuristics, metaheuristics, and practical
              routing algorithms work with Python & React.
            </p>
          </div>
        </div>

        {/* Algorithm badges */}
        <div className="mt-6 flex flex-wrap gap-2">
          {ALGO_IDS.map((id) => (
            <span
              key={id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
                "bg-slate-100 text-slate-700",
              )}
            >
              {ALGO_ICONS[id] ?? <Route className="h-3.5 w-3.5" />}
              {getAlgoDisplayName(id)}
            </span>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/solver"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 font-medium text-white shadow-lg transition-colors hover:bg-sky-700"
          >
            <Play className="h-4 w-4" />
            Run Single Algorithm
          </Link>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-lg transition-colors hover:bg-emerald-700"
          >
            <GitCompare className="h-4 w-4" />
            Compare All Algorithms
          </Link>
          <Link
            to="/datasets"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-5 py-2.5 font-medium text-white shadow-lg transition-colors hover:bg-slate-700"
          >
            <Database className="h-4 w-4" />
            Browse Datasets & BKS
          </Link>
          <Link
            to="/results"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-600 px-5 py-2.5 font-medium text-white shadow-lg transition-colors hover:bg-zinc-700"
          >
            <BarChart3 className="h-4 w-4" />
            View Test Results & Research Papers
          </Link>
        </div>
      </div>

      {/* Ask about algorithms (RAG) */}
      <RagAskCard />

      {/* FAQ Accordion */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-lg bg-amber-100 p-4">
            <BookOpen className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Educational FAQ
            </h2>
            <p className="text-md text-slate-500">
              Fundamental knowledge about NP problems, heuristics,
              metaheuristics, Solomon benchmark, VRP, VRPTW, and algorithms!
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="flex w-full items-center justify-between gap-4 text-left hover:no-underline hover:bg-slate-100 data-[state=open]:bg-slate-100 px-4 transition-colors cursor-pointer">
                <span className="flex-1 pr-4 font-medium text-slate-800 text-lg">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-slate prose-sm max-w-none text-base  text-slate-600 text-md font-medium px-4 py-4 text-justify">
                  {item.answer.split("\n\n").map((para, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {renderFaqParagraph(para)}
                    </p>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function RagAskCard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reindexLoading, setReindexLoading] = useState(false);
  const [autoBootstrapLoading, setAutoBootstrapLoading] = useState(false);
  const autoBootstrapAttemptedRef = useRef(false);
  const {
    data: ragStatus,
    refetch: refetchRagStatus,
    isFetching: ragStatusFetching,
    isFetched: ragStatusFetched,
  } = useQuery({
    queryKey: ["rag-status"],
    queryFn: getRagStatus,
    staleTime: 60_000,
  });

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await postAiAsk(question.trim());
      if (res.error) setError(res.error);
      else if (res.answer) setAnswer(res.answer);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const available = ragStatus?.available ?? false;
  const reason = ragStatus?.reason;

  const runReindex = useCallback(
    async (silent: boolean, isAutoBootstrap = false) => {
      if (reindexLoading) return;
      if (isAutoBootstrap && ragAutoBootstrapInFlight) return;
      if (isAutoBootstrap) setAutoBootstrapLoading(true);
      if (isAutoBootstrap) ragAutoBootstrapInFlight = true;
      setReindexLoading(true);
      if (!silent) {
        toast.info(
          "RAG reindex started",
          "Rebuilding vector index from local sources...",
        );
      }
      try {
        const res = await postRagReindex();
        await refetchRagStatus();
        if (!res.ok) {
          if (!silent) {
            toast.error("RAG reindex failed", res.reason ?? "Unknown error");
          }
          if (isAutoBootstrap) ragAutoBootstrapCompleted = false;
          return;
        }
        if (isAutoBootstrap) ragAutoBootstrapCompleted = true;
        if (!silent) {
          toast.success(
            "RAG reindex completed",
            `Indexed ${res.indexed_files ?? 0} files (${res.pdf_files ?? 0} PDFs).`,
          );
        }
      } catch {
        if (isAutoBootstrap) ragAutoBootstrapCompleted = false;
        if (!silent) {
          toast.error(
            "RAG reindex failed",
            "Could not reach backend endpoint.",
          );
        }
      } finally {
        setReindexLoading(false);
        if (isAutoBootstrap) ragAutoBootstrapInFlight = false;
        if (isAutoBootstrap) setAutoBootstrapLoading(false);
      }
    },
    [reindexLoading, refetchRagStatus],
  );

  useEffect(() => {
    if (autoBootstrapAttemptedRef.current) return;
    if (ragAutoBootstrapInFlight || ragAutoBootstrapCompleted) return;
    if (!ragStatusFetched || ragStatusFetching) return;
    if (available || reindexLoading || loading) return;

    const reasonText = (reason ?? "").toLowerCase();
    const shouldBootstrap = reasonText.includes("index not built yet");
    if (!shouldBootstrap) return;

    autoBootstrapAttemptedRef.current = true;
    void runReindex(true, true);
  }, [
    available,
    reason,
    reindexLoading,
    loading,
    ragStatusFetched,
    ragStatusFetching,
    runReindex,
  ]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-sky-100 p-4">
            <Bot className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Ask about algorithms (RAG)
            </h2>
            <p className="text-md text-slate-500">
              Ask questions in natural language about VRPTW concepts and
              algorithm documentation. Use it for guidance on algorithm
              selection, parameter tuning strategy, Solomon instance
              characteristics, and interpretation of solver results.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg px-5 py-2.5 text-base font-medium text-white transition-colors shadow-lg",
            "bg-slate-400",
          )}
        >
          {reindexLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Reindex RAG
        </button>
      </div>
      {!available && reason && !autoBootstrapLoading && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-md text-amber-800 shadow-lg">
          RAG not available: {reason}
        </p>
      )}
      <div className="flex flex-col gap-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which algorithm is most suitable for clustered customers with tight time windows? How should I tune runtime and cooling parameters to balance solution quality and speed?"
          disabled={loading}
          rows={3}
          className={cn(
            "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-sky-900 placeholder:text-slate-400 shadow-lg",
            loading && "opacity-60",
          )}
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={!available || loading || !question.trim()}
          className={cn(
            "inline-flex items-center justify-center gap-2 self-end rounded-lg px-5 py-2.5 text-base font-medium text-white transition-colors cursor-pointer shadow-lg",
            !available || loading
              ? "bg-slate-400"
              : "bg-sky-600 hover:bg-sky-700",
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Ask Assistant
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-base text-red-700 shadow-lg">
          {error}
        </p>
      )}
      {answer && (
        <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 text-base text-emerald-700 shadow-lg">
          {answer}
        </div>
      )}
    </div>
  );
}
