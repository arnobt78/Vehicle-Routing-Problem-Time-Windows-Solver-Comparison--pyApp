from pydantic import BaseModel

DEFAULT_PARAMS = {
    "aco": {"ants_num": 30, "beta": 0.9, "q0": 0.9, "rho": 0.1, "runtime_minutes": 5},
    "gls": {"runtime": 120},
    "sa": {"init_temp": 700, "cooling_rate": 0.9999},
    "hgs": {"runtime": 120},
    "ils": {"runtime": 120},
}


class SolveRequest(BaseModel):
    dataset: str
    runtime: int | None = None
    params: dict | None = None


class ExplainRequest(BaseModel):
    dataset: str
    results: list[dict]  # [{ algo, status, cost?, runtime?, routes?, gap? }]


class AskRequest(BaseModel):
    question: str


class TuneRequest(BaseModel):
    algo: str
    dataset: str
    max_iterations: int = 3
    runtime_per_run: int = 120
    goal: str | None = None
