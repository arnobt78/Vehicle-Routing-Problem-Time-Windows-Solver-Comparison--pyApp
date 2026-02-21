/**
 * Parameter tuner for the selected algorithm: schema-driven inputs (ALGO_PARAM_SCHEMAS), sync with API baseline, optional AI suggest.
 * For ACO/SA, runtime_minutes empty is sent as null (natural run with early stop); other algos use runtime in seconds.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { getAiSuggest, getParameters } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Loader2, Sparkles } from "lucide-react";

const RUNTIME_HINT_ACO_SA =
  "Leave empty to run until the algorithm stops naturally (stops after 50 checks of 5 s each, i.e. 250 s, with no improvement in cost or vehicle count), or set a time limit (e.g. 5–15+ min) for predictable results.";

const ALGO_PARAM_SCHEMAS: Record<
  string,
  {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    description?: string;
    rangeHint?: string;
    defaultPlaceholder?: string;
  }[]
> = {
  aco: [
    {
      key: "ants_num",
      label: "Ants",
      min: 10,
      max: 60,
      step: 1,
      description: "Number of ants exploring routes in each iteration.",
    },
    {
      key: "beta",
      label: "Beta",
      min: 0.5,
      max: 2,
      step: 0.1,
      description: "How strongly distance/heuristics influence decisions.",
    },
    {
      key: "q0",
      label: "Q0",
      min: 0.1,
      max: 1,
      step: 0.1,
      description: "Higher values favor greedy exploitation over exploration.",
    },
    {
      key: "rho",
      label: "Rho",
      min: 0.01,
      max: 0.3,
      step: 0.01,
      description: "Pheromone evaporation rate per iteration.",
    },
    {
      key: "runtime_minutes",
      label: "Runtime (min)",
      min: 1,
      max: 120,
      step: 1,
      description: "Maximum optimization time budget in minutes.",
      rangeHint: RUNTIME_HINT_ACO_SA,
    },
  ],
  gls: [
    {
      key: "runtime",
      label: "Runtime (Seconds)",
      min: 60,
      max: 600,
      step: 30,
      description: "Maximum optimization time budget in seconds.",
    },
  ],
  sa: [
    {
      key: "init_temp",
      label: "Initial Temperature",
      min: 300,
      max: 1200,
      step: 50,
      description: "Starting acceptance level for uphill moves.",
    },
    {
      key: "runtime_minutes",
      label: "Runtime (minutes)",
      min: 1,
      max: 120,
      step: 1,
      description: "Maximum optimization time in minutes.",
      rangeHint: RUNTIME_HINT_ACO_SA,
      defaultPlaceholder: "15",
    },
    {
      key: "cooling_rate",
      label: "Cooling Rate",
      min: 0.99,
      max: 0.99999,
      step: 0.0001,
      description: "How quickly temperature decays over time.",
    },
  ],
  hgs: [
    {
      key: "runtime",
      label: "Runtime (Seconds)",
      min: 60,
      max: 600,
      step: 30,
      description: "Maximum optimization time budget in seconds.",
    },
  ],
  ils: [
    {
      key: "runtime",
      label: "Runtime (Seconds)",
      min: 60,
      max: 600,
      step: 30,
      description: "Maximum optimization time budget in seconds.",
    },
  ],
};

interface ParameterTunerProps {
  algo: string;
  dataset: string | null;
  params: Record<string, number>;
  onChange: (params: Record<string, number>) => void;
  disabled?: boolean;
}

const INPUT_STYLE =
  "w-full rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-base text-slate-900 shadow-lg";

type InputWarning = { text: string; kind: "info" | "warning" };
type TuneSummary = {
  goalMode: "Balanced" | "Custom";
  changedKeys: string[];
  status: "applied" | "no-change";
  savedAt: number;
};
type ParamEditSummary = {
  fieldLabel: string;
  value: number | null; // null = "empty" (e.g. runtime = natural run)
  savedAt: number;
};

/** Renders algo-specific parameter inputs from ALGO_PARAM_SCHEMAS; supports AI suggest and shows "Latest Parameter Update" when runtime is cleared. */
export function ParameterTuner({
  algo,
  dataset,
  params,
  onChange,
  disabled,
}: ParameterTunerProps) {
  const [loading, setLoading] = useState(true);
  // Removed aiLoading/setAiLoading as only one suggest button remains
  const [tuneLoading, setTuneLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [inputWarnings, setInputWarnings] = useState<
    Record<string, InputWarning>
  >({});
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});
  const [baselineParams, setBaselineParams] = useState<Record<string, number>>(
    {},
  );
  const [highlightedKeys, setHighlightedKeys] = useState<
    Record<string, boolean>
  >({});
  const [latestTuneSummary, setLatestTuneSummary] =
    useState<TuneSummary | null>(null);
  const [latestParamEditSummary, setLatestParamEditSummary] =
    useState<ParamEditSummary | null>(null);
  const warningTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | undefined>
  >({});
  const highlightTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | undefined>
  >({});
  const schema = useMemo(() => ALGO_PARAM_SCHEMAS[algo] ?? [], [algo]);

  useEffect(() => {
    if (!algo) return;
    setInputWarnings({});
    getParameters(algo)
      .then((p) => {
        onChange(p);
        setBaselineParams(p);
        const nextDrafts: Record<string, string> = {};
        Object.entries(p).forEach(([key, value]) => {
          if (key === "runtime_minutes" && value === 0) {
            nextDrafts[key] = "";
          } else {
            nextDrafts[key] = String(value);
          }
        });
        setInputDrafts(nextDrafts);
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, [algo, onChange]);

  useEffect(() => {
    if (!schema.length) return;
    setInputDrafts((prev) => {
      const next = { ...prev };
      schema.forEach(({ key }) => {
        if (typeof params[key] === "number") {
          // Show empty in UI for runtime_minutes when 0 (natural run); backend still gets null.
          if (key === "runtime_minutes" && params[key] === 0) {
            next[key] = "";
          } else {
            next[key] = String(params[key]);
          }
        }
      });
      return next;
    });
  }, [params, schema]);

  useEffect(() => {
    const timeouts = warningTimeoutsRef.current;
    const highlightTimeouts = highlightTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach((timeoutId) => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      Object.values(highlightTimeouts).forEach((timeoutId) => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, []);

  const extractSuggestionObject = (
    raw: string,
  ): Record<string, unknown> | null => {
    const cleaned = raw.trim();
    if (!cleaned) return null;

    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fenced?.[1] ?? cleaned;

    try {
      const parsed = JSON.parse(candidate);
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      const objectMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!objectMatch) return null;
      try {
        const parsed = JSON.parse(objectMatch[0]);
        return parsed && typeof parsed === "object"
          ? (parsed as Record<string, unknown>)
          : null;
      } catch {
        return null;
      }
    }
  };

  const flashUpdatedKeys = (keys: string[]) => {
    if (!keys.length) return;

    setHighlightedKeys((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        next[key] = true;
      });
      return next;
    });

    keys.forEach((key) => {
      const existing = highlightTimeoutsRef.current[key];
      if (existing) clearTimeout(existing);
      highlightTimeoutsRef.current[key] = setTimeout(() => {
        setHighlightedKeys((prev) => {
          if (!prev[key]) return prev;
          const next = { ...prev };
          delete next[key];
          return next;
        });
        delete highlightTimeoutsRef.current[key];
      }, 1200);
    });
  };

  const validateInput = (
    raw: string,
    min: number,
    max: number,
    baseline: number | undefined,
    paramKey?: string,
  ) => {
    const trimmed = raw.trim();

    if (trimmed === "") {
      if (paramKey === "runtime_minutes") {
        return {
          kind: "info" as const,
          text: "Leave empty to run until the algorithm stops naturally.",
        };
      }
      return baseline != null
        ? {
            kind: "info" as const,
            text: `Input is empty. Baseline ${baseline} will be used if left empty.`,
          }
        : {
            kind: "info" as const,
            text: "Input is empty. A previous valid value will be used.",
          };
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      return { kind: "warning" as const, text: "Please enter a valid number." };
    }

    if (parsed < min || parsed > max) {
      return {
        kind: "warning" as const,
        text: `Out of range. Allowed: ${min} to ${max}.`,
      };
    }

    return null;
  };

  const getWarningClass = (kind: "info" | "warning") =>
    kind === "info" ? "text-sky-600" : "text-rose-600";

  const autoTuneGoalMode = customPrompt.trim() ? "Custom" : "Balanced";

  if (loading || schema.length === 0) return null;

  // Unified suggest/tune handler
  const handleSuggest = async () => {
    if (!dataset) return;
    setTuneLoading(true);
    setAiError(null);
    try {
      const goal = customPrompt.trim();
      const goalModeLabel = goal ? "Custom" : "Balanced";
      if (!goal) {
        toast.info(
          "Suggestion goal",
          "No preference provided. Using a balanced tuning prompt.",
        );
      }

      const prompt =
        goal ||
        "Balance speed and solution quality for this dataset and algorithm.";
      const res = await getAiSuggest(algo, dataset, prompt);
      const { suggestion, error } = res as {
        suggestion?: string;
        error?: string;
      };
      if (error) {
        setAiError(error);
        toast.error("Suggestion failed", error);
        return;
      }
      if (!suggestion) {
        toast.info("Suggestion finished", "No suggestion was returned.");
        return;
      }

      const parsed = extractSuggestionObject(suggestion);
      if (!parsed) {
        setAiError("AI returned non-JSON suggestion");
        toast.error("Suggestion failed", "Could not parse suggested values");
        return;
      }

      const schemaKeys = new Set(schema.map((s) => s.key));
      const updates: Record<string, number> = {};
      const changedKeys: string[] = [];

      Object.entries(parsed).forEach(([key, value]) => {
        if (!schemaKeys.has(key)) return;
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return;
        const field = schema.find((s) => s.key === key);
        if (!field) return;
        const clamped = Math.min(field.max, Math.max(field.min, numeric));
        if (params[key] === clamped) return;
        updates[key] = clamped;
        changedKeys.push(key);
      });

      if (!changedKeys.length) {
        setLatestTuneSummary({
          goalMode: goalModeLabel,
          changedKeys: [],
          status: "no-change",
          savedAt: Date.now(),
        });
        toast.info(
          `Suggestion finished (${goalModeLabel} goal)`,
          "No parameter changes were suggested for current settings.",
        );
        return;
      }

      onChange({ ...params, ...updates });
      flashUpdatedKeys(changedKeys);
      setLatestTuneSummary({
        goalMode: goalModeLabel,
        changedKeys,
        status: "applied",
        savedAt: Date.now(),
      });
      toast.success(
        `Suggestion complete (${goalModeLabel} goal)`,
        "AI suggestions applied to parameters.",
      );
    } catch {
      setAiError("Suggestion request failed");
      toast.error("Suggestion failed", "Could not reach server");
    } finally {
      setTuneLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-2xl font-semibold text-slate-800">
          Algorithm Parameters
        </span>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSuggest}
              disabled={!dataset || tuneLoading || disabled}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold text-white shadow-lg transition-colors hover:shadow-xl cursor-pointer",
                tuneLoading || !dataset || disabled
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              {tuneLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {tuneLoading ? "Suggesting..." : "Suggest"}
            </button>
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium shadow-lg mb-2",
              autoTuneGoalMode === "Custom"
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-sky-200 bg-sky-50 text-sky-700",
            )}
          >
            Auto-tune goal: {autoTuneGoalMode}
          </span>
        </div>
      </div>
      {aiError && <p className="text-sm text-amber-700">{aiError}</p>}
      {latestParamEditSummary && !tuneLoading ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-2.5 text-sm text-sky-900 shadow-lg mb-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">Latest Parameter Update</p>
            <button
              type="button"
              onClick={() => setLatestParamEditSummary(null)}
              className="rounded border border-sky-300 bg-white px-2 py-0.5 text-xs font-medium text-sky-800 hover:bg-sky-100 shadow-lg"
            >
              Clear
            </button>
          </div>
          <p>
            Field:{" "}
            <span className="font-medium">
              {latestParamEditSummary.fieldLabel}
            </span>
            {" · "}Value:{" "}
            <span className="font-medium">
              {latestParamEditSummary.value === null
                ? "Empty (natural run)"
                : latestParamEditSummary.value}
            </span>
          </p>
          <p className="mt-1 text-xs text-sky-800/80">
            Updated:{" "}
            {new Date(latestParamEditSummary.savedAt).toLocaleTimeString()}
          </p>
        </div>
      ) : null}
      {latestTuneSummary ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 text-sm text-emerald-900 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">Latest Auto-tune Result</p>
            <button
              type="button"
              onClick={() => setLatestTuneSummary(null)}
              className="rounded border border-emerald-300 bg-white px-2 py-0.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 shadow-lg"
            >
              Clear
            </button>
          </div>
          <p>
            Goal:{" "}
            <span className="font-medium">{latestTuneSummary.goalMode}</span>
            {" · "}Mode: <span className="font-medium">Suggestion</span>
          </p>
          <p className="mt-1">
            {latestTuneSummary.status === "applied"
              ? `Applied changes: ${latestTuneSummary.changedKeys.join(", ") || "none"}`
              : "Applied changes: none"}
          </p>
          <p className="mt-1 text-xs text-emerald-800/80">
            Updated: {new Date(latestTuneSummary.savedAt).toLocaleTimeString()}
          </p>
        </div>
      ) : null}
      <div className="">
        <label className="block text-base font-medium text-slate-700">
          Tuning preference (optional)
        </label>
        <p className="text-sm text-slate-500 mb-2">
          Tell the assistant what you want to optimize. Example: &quot;Focus on
          clustered customers&quot;, &quot;Prefer fewer vehicles over
          runtime&quot;, or &quot;Balance speed and solution quality&quot;.
        </p>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe your goal for parameter tuning..."
          disabled={disabled}
          rows={3}
          className={cn(
            "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 shadow-lg",
            disabled && "opacity-50",
          )}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {schema.map((s) => {
          const { key, label, min, max, step, description } = s;
          return (
          <div
            key={key}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
          >
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {label}
            </label>
            {description ? (
              <p className="mb-2 text-xs text-slate-500">{description}</p>
            ) : null}
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={inputDrafts[key] ?? ""}
              placeholder={
                baselineParams[key] != null
                  ? String(baselineParams[key])
                  : params[key] != null
                    ? String(params[key])
                    : (s.defaultPlaceholder ?? "")
              }
              onChange={(e) => {
                const raw = e.target.value;
                const trimmed = raw.trim();
                setInputDrafts((prev) => ({ ...prev, [key]: raw }));

                const warning = validateInput(
                  raw,
                  min,
                  max,
                  baselineParams[key],
                  key,
                );

                const timeoutId = warningTimeoutsRef.current[key];
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  delete warningTimeoutsRef.current[key];
                }

                // When user clears runtime_minutes, notify parent so it sends null (natural run).
                if (key === "runtime_minutes" && trimmed === "") {
                  setInputWarnings((prev) => {
                    if (!prev[key]) return prev;
                    const next = { ...prev };
                    delete next[key];
                    return next;
                  });
                  setLatestParamEditSummary({
                    fieldLabel: label,
                    value: null,
                    savedAt: Date.now(),
                  });
                  onChange({ ...params, [key]: 0 });
                  return;
                }

                if (warning) {
                  setInputWarnings((prev) => ({ ...prev, [key]: warning }));
                  warningTimeoutsRef.current[key] = setTimeout(() => {
                    setInputWarnings((prev) => {
                      if (!prev[key]) return prev;
                      const next = { ...prev };
                      delete next[key];
                      return next;
                    });
                    delete warningTimeoutsRef.current[key];
                  }, 5000);
                  return;
                }

                setInputWarnings((prev) => {
                  if (!prev[key]) return prev;
                  const next = { ...prev };
                  delete next[key];
                  return next;
                });

                const parsed = Number(trimmed);
                if (!Number.isFinite(parsed)) return;
                setLatestParamEditSummary({
                  fieldLabel: label,
                  value: parsed,
                  savedAt: Date.now(),
                });
                onChange({ ...params, [key]: parsed });
              }}
              disabled={disabled}
              className={cn(
                INPUT_STYLE,
                highlightedKeys[key] &&
                  "ring-2 ring-sky-400 border-sky-400 animate-pulse",
                disabled && "opacity-50",
              )}
            />
            {inputWarnings[key] ? (
              <p
                className={cn(
                  "mt-1 text-[11px]",
                  getWarningClass(inputWarnings[key].kind),
                )}
              >
                {inputWarnings[key].text}
              </p>
            ) : null}
            <p className="mt-1 text-[11px] text-slate-500">
              {s.rangeHint ?? `Allowed range: ${min} to ${max}.`}
            </p>
          </div>
          );
        })}
      </div>
    </div>
  );
}
