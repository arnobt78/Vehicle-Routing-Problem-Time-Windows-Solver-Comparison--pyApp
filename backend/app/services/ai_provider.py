"""
AI suggestion with fallback chain: Gemini → OpenRouter → Groq → Hugging Face.
Skips to next provider on 429 or other errors.
"""
import json
import os
import re
import urllib.error
import urllib.request
from typing import Any

from pydantic import BaseModel, Field


class SuggestedParams(BaseModel):
    """Structured AI-suggested parameters (optional keys per algorithm)."""
    ants_num: int | None = Field(None, ge=10, le=60)
    beta: float | None = Field(None, ge=0.5, le=2)
    q0: float | None = Field(None, ge=0.1, le=1)
    rho: float | None = Field(None, ge=0.01, le=0.3)
    runtime_minutes: int | None = Field(None, ge=1, le=10)
    runtime: int | None = Field(None, ge=60, le=600)
    init_temp: float | None = Field(None, ge=300, le=1200)
    cooling_rate: float | None = Field(None, ge=0.99, le=0.99999)


def _dataset_family(dataset: str) -> str:
    d = (dataset or "").strip().lower()
    if d.startswith("rc"):
        return "rc"
    if d.startswith("c"):
        return "c"
    if d.startswith("r"):
        return "r"
    return "unknown"


def _heuristic_suggestion(algo: str, dataset: str, prompt: str | None) -> dict[str, Any]:
    """
    Deterministic baseline suggestion used as a safe fallback and prior.
    Keeps runtime defaults practical and stable for UX.
    """
    a = (algo or "").strip().lower()
    family = _dataset_family(dataset)
    text = (prompt or "").lower()

    prefer_fast = any(k in text for k in ("fast", "speed", "quicker", "quick"))
    prefer_quality = any(k in text for k in ("quality", "best", "gap", "accur"))

    if a in {"hgs", "gls", "ils"}:
        runtime = 120
        if prefer_quality:
            runtime = 180
        elif prefer_fast:
            runtime = 120

        if family == "rc" and prefer_quality:
            runtime = 240
        return {"runtime": int(max(120, min(600, runtime)))}

    if a == "aco":
        ants_num = 30
        beta = 0.9
        q0 = 0.9
        rho = 0.1
        runtime_minutes = 5

        if prefer_quality:
            ants_num = 40
            runtime_minutes = 8
            q0 = 0.8
        elif prefer_fast:
            ants_num = 24
            runtime_minutes = 4
            q0 = 0.95

        if family == "rc":
            beta = 1.0
            rho = 0.08

        return {
            "ants_num": int(max(10, min(60, ants_num))),
            "beta": float(max(0.5, min(2.0, beta))),
            "q0": float(max(0.1, min(1.0, q0))),
            "rho": float(max(0.01, min(0.3, rho))),
            "runtime_minutes": int(max(1, min(10, runtime_minutes))),
        }

    if a == "sa":
        init_temp = 700.0
        cooling_rate = 0.9999
        if prefer_fast:
            init_temp = 600.0
            cooling_rate = 0.9995
        elif prefer_quality:
            init_temp = 800.0
            cooling_rate = 0.99995
        if family == "rc" and prefer_quality:
            init_temp = 850.0
        return {
            "init_temp": float(max(300, min(1200, init_temp))),
            "cooling_rate": float(max(0.99, min(0.99999, cooling_rate))),
        }

    return {}


def _call_gemini(prompt: str, max_tokens: int = 512) -> str | None:
    key = os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("Google_Gemini_API_KEY")
    if not key:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": max_tokens},
    }).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as r:
        resp = json.loads(r.read().decode())
        return resp.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")


def _call_openai_compatible(url: str, api_key: str, model: str, prompt: str) -> str | None:
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 512,
        "temperature": 0.2,
    }).encode()
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read().decode())
        content = data.get("choices", [{}])[0].get("message", {}).get("content")
        return content.strip() if content else None


def _call_ai(prompt: str, max_tokens: int = 512) -> str:
    """Call AI with full fallback chain. Raises RuntimeError if all fail."""
    try:
        text = _call_gemini(prompt, max_tokens)
        if text:
            return text.strip()
    except Exception:
        pass
    key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OpenRouter_API_KEY")
    if key:
        try:
            text = _call_openai_compatible(
                "https://openrouter.ai/api/v1/chat/completions",
                key,
                "openai/gpt-4o-mini",
                prompt,
            )
            if text:
                return text.strip()
        except Exception:
            pass
    key = os.getenv("GROQ_API_KEY") or os.getenv("Groq_Llama_API_KEY")
    if key:
        try:
            text = _call_openai_compatible(
                "https://api.groq.com/openai/v1/chat/completions",
                key,
                "llama-3.3-70b-versatile",
                prompt,
            )
            if text:
                return text.strip()
        except Exception:
            pass
    key = os.getenv("HUGGING_FACE_API_KEY") or os.getenv("Hugging_Face_Inference_API_KEY")
    if key:
        for model in [
            "mistralai/Mistral-7B-Instruct-v0.2",
            "HuggingFaceH4/zephyr-7b-beta",
            "google/gemma-7b-it",
        ]:
            try:
                text = _call_openai_compatible(
                    "https://router.huggingface.co/v1/chat/completions",
                    key,
                    model,
                    prompt,
                )
                if text:
                    return text.strip()
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    break
            except Exception:
                continue
    raise RuntimeError(
        "All AI providers failed. Configure at least one: GOOGLE_GEMINI_API_KEY, "
        "OPENROUTER_API_KEY, GROQ_API_KEY, or HUGGING_FACE_API_KEY"
    )


def _extract_json(text: str) -> dict | None:
    """Extract a JSON object from AI response (handles markdown code blocks)."""
    text = text.strip()
    m = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
    if m:
        text = m.group(1)
    else:
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            text = m.group(0)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def _sanitize_for_algo(algo: str, data: dict[str, Any]) -> dict[str, Any]:
    """Keep only relevant keys for selected algorithm and enforce safe floors."""
    a = (algo or "").strip().lower()
    allowed_keys = {
        "aco": {"ants_num", "beta", "q0", "rho", "runtime_minutes"},
        "gls": {"runtime"},
        "hgs": {"runtime"},
        "ils": {"runtime"},
        "sa": {"init_temp", "cooling_rate"},
    }.get(a, set())

    filtered = {k: v for k, v in data.items() if k in allowed_keys}

    # Product requirement: runtime suggestions should not drop to 60 on AI suggest for these algos.
    if a in {"hgs", "gls", "ils"} and "runtime" in filtered:
        try:
            filtered["runtime"] = int(max(120, min(600, int(float(filtered["runtime"])))) )
        except Exception:
            filtered.pop("runtime", None)

    return filtered


def get_ai_suggestion(algo: str, dataset: str, prompt: str | None = None) -> str:
    heuristic = _heuristic_suggestion(algo, dataset, prompt)
    base_prompt = (
        f"Suggest practical parameters for {algo.upper()} on VRPTW dataset '{dataset}'.\n"
        "Return ONLY a valid JSON object, no markdown, no prose.\n"
        "Use only these keys for this algorithm and keep values in valid ranges.\n"
        "If unsure, stay close to baseline values.\n"
        f"Baseline suggestion: {json.dumps(heuristic)}\n"
        f"User preference: {prompt or 'none'}\n"
    )

    obj: dict[str, Any] | None = None
    try:
        text = _call_ai(base_prompt)
        obj = _extract_json(text)
    except Exception:
        obj = None

    merged: dict[str, Any] = {}
    merged.update(heuristic)
    if isinstance(obj, dict):
        merged.update(obj)

    merged = _sanitize_for_algo(algo, merged)

    if merged:
        try:
            allowed = {k for k in merged if k in SuggestedParams.model_fields}
            validated = SuggestedParams.model_validate({k: merged[k] for k in allowed})
            sanitized = _sanitize_for_algo(algo, validated.model_dump(exclude_none=True))
            return json.dumps(sanitized)
        except Exception:
            pass

    # Final deterministic fallback when provider and parsing fail.
    return json.dumps(_sanitize_for_algo(algo, heuristic))


def get_ai_explain(dataset: str, results: list[dict]) -> str:
    """Explain comparison results using the same AI fallback chain."""
    display_names = {
        "hgs": "Hybrid Genetic Search",
        "gls": "Guided Local Search",
        "ils": "Iterated Local Search",
        "aco": "Ant Colony Optimization",
        "sa": "Simulated Annealing",
    }

    def ordinal(n: int) -> str:
        if 10 <= (n % 100) <= 20:
            suffix = "th"
        else:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
        return f"{n}{suffix}"

    normalized_rows: list[dict] = []
    lines = [f"Dataset: {dataset}. VRPTW benchmark comparison results:", ""]
    for r in results:
        algo = str(r.get("algo", "?")).lower()
        algo_name = display_names.get(algo, algo.upper())
        status = r.get("status", "?")
        cost = r.get("cost")
        runtime = r.get("runtime")
        gap = r.get("gap")
        routes = r.get("routes", 0)
        cost_s = f"{cost}" if cost is not None else "-"
        runtime_s = f"{runtime}s" if runtime is not None else "-"
        gap_s = f"{gap}%" if gap is not None else "-"
        lines.append(
            f"  {algo_name}: status={status}, cost={cost_s}, runtime={runtime_s}, routes={routes}, gap vs BKS={gap_s}"
        )
        if status == "completed" and cost is not None and gap is not None and runtime is not None:
            normalized_rows.append(
                {
                    "name": algo_name,
                    "cost": float(cost),
                    "gap": float(gap),
                    "runtime": float(runtime),
                }
            )

    facts: list[str] = []
    if normalized_rows:
        ranked = sorted(
            normalized_rows,
            key=lambda x: (x["gap"], x["cost"], x["runtime"], x["name"]),
        )

        best_gap = ranked[0]["gap"]
        winners = [x["name"] for x in ranked if x["gap"] == best_gap]
        facts.append(
            "Winner set by minimum gap: "
            + ", ".join(winners)
            + f" (gap={best_gap:.2f}%)."
        )

        groups: dict[float, list[dict]] = {}
        for row in ranked:
            groups.setdefault(row["gap"], []).append(row)

        rank_position = 1
        facts.append("Tie-aware rank groups:")
        for gap_value in sorted(groups.keys()):
            group = groups[gap_value]
            label = f"Tied {ordinal(rank_position)}" if len(group) > 1 else ordinal(rank_position)
            entries = "; ".join(
                f"{item['name']} (cost={item['cost']:.1f}, gap={item['gap']:.2f}%)"
                for item in group
            )
            facts.append(f"- {label}: {entries}")
            rank_position += len(group)

        fastest = min(ranked, key=lambda x: x["runtime"])
        slowest = max(ranked, key=lambda x: x["runtime"])
        facts.append(
            f"Fastest completed: {fastest['name']} ({fastest['runtime']:.2f}s)."
        )
        facts.append(
            f"Slowest completed: {slowest['name']} ({slowest['runtime']:.2f}s)."
        )
        facts.append(
            "Recommendation anchors: "
            + f"quality-first -> {', '.join(winners)}; "
            + f"speed-first -> {fastest['name']}."
        )

        underperformers = [x["name"] for x in ranked if x["gap"] > best_gap]
        if underperformers:
            facts.append(
                "Algorithms above best gap (candidates for tuning): "
                + ", ".join(underperformers)
                + "."
            )

    lines.append("")
    prompt = "\n".join(lines) + (
        ("Deterministic facts (must be followed exactly):\n" + "\n".join(facts) + "\n\n")
        if facts
        else ""
    ) + (
        "Write a concise benchmark explanation with this exact structure:\n"
        "1) Winner summary (1-2 sentences)\n"
        "2) Ranked overview (best to worst by gap, with tie handling)\n"
        "3) Runtime interpretation (brief, factual)\n"
        "4) Practical recommendation (2 short bullets)\n"
        "5) Possible improvements / tuning hints for beginners (2-3 short bullets).\n\n"
        "Rules:\n"
        "- Use ONLY the provided numbers; do not invent causes or dataset properties not present in input.\n"
        "- Do not rename algorithms incorrectly (use names exactly as provided).\n"
        "- For ties, explicitly use wording like 'Tied 1st'.\n"
        "- In section 2, each tie group must be ONE bullet (semicolon-separated names), not repeated bullets per algorithm.\n"
        "- Section 4 must contain exactly two bullets: (a) quality-first recommendation, (b) speed-first recommendation.\n"
        "- In section 4, quality-first must explicitly recommend the minimum-gap winner set from Recommendation anchors.\n"
        "- In section 4, speed-first must explicitly recommend the fastest completed algorithm from Recommendation anchors (not a different algorithm).\n"
        "- Section 5 must be cautious and practical: use words like 'possible' and 'try', not guarantees.\n"
        "- In Section 5, reference concrete knobs when relevant (ACO: number of ants, beta, Q0, rho, runtime minutes; SA: initial temperature, cooling rate).\n"
        "- In Section 5, each bullet must include: knob(s) -> likely effect -> trade-off (e.g., exploration vs runtime).\n"
        "- Keep output under 230 words and easy to scan."
    )
    return _call_ai(prompt, max_tokens=1024)
