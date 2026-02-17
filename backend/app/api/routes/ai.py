from fastapi import APIRouter

from app.api.models.request_models import AskRequest, ExplainRequest, TuneRequest
from app.services.ai_provider import get_ai_explain, get_ai_suggestion
from app.services.rag_service import get_rag_answer, rag_available, rag_reindex
from app.services.tune_agent import run_tune_loop

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/suggest")
def ai_suggest(algo: str, dataset: str, prompt: str | None = None):
    try:
        text = get_ai_suggestion(algo, dataset, prompt)
        return {"suggestion": text}
    except RuntimeError as e:
        return {"suggestion": None, "error": str(e)}
    except Exception as e:
        return {"suggestion": None, "error": str(e)}


@router.post("/explain")
def ai_explain(body: ExplainRequest):
    try:
        text = get_ai_explain(body.dataset, body.results)
        return {"explanation": text}
    except RuntimeError as e:
        return {"explanation": None, "error": str(e)}
    except Exception as e:
        return {"explanation": None, "error": str(e)}


@router.get("/rag/status")
def rag_status():
    ok, reason = rag_available()
    return {"available": ok, "reason": reason}


@router.post("/rag/reindex")
def rag_reindex_now():
    """Rebuild the RAG vector index from local project sources without restarting backend."""
    result = rag_reindex()
    return result


@router.post("/ask")
def ai_ask(body: AskRequest):
    """Answer a question using RAG over local docs/datasets/results sources (requires requirements-rag.txt)."""
    try:
        text = get_rag_answer(body.question)
        return {"answer": text}
    except RuntimeError as e:
        return {"answer": None, "error": str(e)}
    except Exception as e:
        return {"answer": None, "error": str(e)}


@router.post("/tune")
def ai_tune(body: TuneRequest):
    """Agent-based parameter tuning: suggest → run → evaluate loop (up to max_iterations)."""
    try:
        result = run_tune_loop(
            body.algo,
            body.dataset,
            max_iterations=body.max_iterations,
            runtime_per_run=body.runtime_per_run,
            goal=body.goal,
        )
        return result
    except Exception as e:
        return {
            "best_params": None,
            "best_cost": None,
            "iterations": [],
            "error": str(e),
        }
