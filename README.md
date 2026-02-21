# Vehicle Routing Problem with Time Windows (VRPTW) Solver Comparison — React, Python, Metaheuristics, RAG, AI Agent, NLP, Optimization Full-Stack Research Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB)](https://www.python.org/)

A full-stack R&D (Research & Development) **Vehicle Routing Problem with Time Windows (VRPTW)** comparison platform. Run and benchmark metaheuristic algorithms (Hybrid Genetic Search (HGS), Iterated Local Search (ILS), Ant Colony Optimization (ACO), Simulated Annealing (SA), Guided Local Search (GLS)), visualize routes, tune parameters, and explore Solomon benchmark datasets—with an optional AI-assisted RAG Q&A, result explanation and parameter tuning capabilities.

- **Live-Demo:** [https://vrptw-solver.vercel.app/](https://vrptw-solver.vercel.app/)
- **Backend 0.6.3 version:** [https://vrptw-api.arnobmahmud.com/](https://vrptw-api.arnobmahmud.com/)
- **Backend 0.13+ version:** [https://vrptw-ils.arnobmahmud.com/](https://vrptw-ils.arnobmahmud.com/)

![Screenshot 2026-02-19 at 13 13 46](https://github.com/user-attachments/assets/32aaa14d-2fe5-4cca-a9a7-5b59fa9d9774)
![Screenshot 2026-02-19 at 13 14 53](https://github.com/user-attachments/assets/f8e7be0c-4c2e-4b49-ba6d-e0dc83566741)
![Screenshot 2026-02-19 at 13 15 25](https://github.com/user-attachments/assets/551f7c75-17e1-401a-a134-185795d8834a)
![Screenshot 2026-02-19 at 13 32 12](https://github.com/user-attachments/assets/df8d6ec4-3b75-4528-bd05-511142943858)
![Screenshot 2026-02-19 at 13 32 33](https://github.com/user-attachments/assets/e58b146c-73b2-425a-b0fe-49447bd26274)
![Screenshot 2026-02-19 at 13 33 13](https://github.com/user-attachments/assets/494cb81d-d23b-45e6-9977-5e16450f85c6)
![Screenshot 2026-02-19 at 13 33 33](https://github.com/user-attachments/assets/30b00cea-d9c1-4580-b019-19026b652339)
![Screenshot 2026-02-19 at 13 38 31](https://github.com/user-attachments/assets/36a6b431-2e42-4a49-b6c8-f046ea5f5687)
![Screenshot 2026-02-19 at 13 39 13](https://github.com/user-attachments/assets/2e9c85fd-737f-4c73-9f2a-d4f43d4a32fd)

## The Comparison results of different NP metaheuristic algorithms for VRPTW

Running Algorithms on dataset: rc108.txt

---

Best-Known Solution (BKS) Route Cost: 1114.2

BKS solution:

Route #1: 2 6 7 8 46 4 45 5 3 1 100

Route #2: 12 14 47 17 16 15 13 9 11 10

Route #3: 33 32 30 28 26 27 29 31 34 93

Route #4: 41 42 44 43 40 38 37 35 36 39

Route #5: 61 81 94 71 72 54 96

Route #6: 64 51 76 89 18 48 19 20 66

Route #7: 65 83 57 24 22 49 21 23 25 77

Route #8: 69 98 88 53 78 73 79 60 55 70 68

Route #9: 82 99 52 86 87 59 97 75 58 74

Route #10: 90

Route #11: 92 95 67 62 50 63 85 84 56 91 80

---

Hybrid Genetic Search (HGS) Route Cost: 1114.2

HGS solution:

Route #1: 12 14 47 17 16 15 13 9 11 10

Route #2: 82 99 52 86 87 59 97 75 58 74

Route #3: 65 83 57 24 22 49 21 23 25 77

Route #4: 64 51 76 89 18 48 19 20 66

Route #5: 92 95 67 62 50 63 85 84 56 91 80

Route #6: 33 32 30 28 26 27 29 31 34 93

Route #7: 61 81 94 71 72 54 96

Route #8: 41 42 44 43 40 38 37 35 36 39

Route #9: 2 6 7 8 46 4 45 5 3 1 100

Route #10: 90

Route #11: 69 98 88 53 78 73 79 60 55 70 68

---

Guided Local Search (GLS) Route Cost: 1266.9

GLS solution:

Route #1: 71 72 44 43 40 38 37 35 36 39

Route #2: 98 82 90 53 78 73 79 2 60

Route #3: 92 67 32 30 28 26 27 29 31 34 93

Route #4: 65 99 24 22 20 49 21 23 25 77

Route #5: 95 51 76 89 33 50 62 91 80

Route #6: 12 14 47 17 16 15 13 9 11 10

Route #7: 88 6 7 8 46 4 45 5 3 1 100 55

Route #8: 69 70 61 81 94 96 54 41 42 68

Route #9: 83 52 57 86 87 59 97 75 58 74

Route #10: 64 19 48 18 63 85 84 56 66

---

Ant Colony Optimization (ACO) Route Cost: 1321.8459204561746

ACO solution:

Route #1: 69 98 88 82 99 52 86 74 57 83 66 91

Route #2: 65 64 51 76 89 85 63 62 56 80

Route #3: 90 53 73 79 78 60 55 68

Route #4: 33 28 30 32 34 31 29 27 26

Route #5: 72 71 93 94 81 61 54 96 100 70

Route #6: 2 45 5 8 7 6 46 4 3 1

Route #7: 41 42 44 38 39 40 36 35 37 43

Route #8: 19 21 23 18 48 49 22 20 24 25

Route #9: 12 14 47 17 16 15 11 10 9 13

Route #10: 59 58 87 97 75 77

Route #11: 92 95 84 50 67

---

Simulated Annealing (SA) Route Cost: 1237.620141359753

SA solution:

Route #1: 7 8 46 4 45 5 3 1 100 55

Route #2: 64 51 76 89 63 85 84 56 91

Route #3: 69 98 53 12 15 16 17 47 14

Route #4: 90 82 9 13 11 10

Route #5: 61 42 44 40 39 38 37 35 36 43

Route #6: 65 52 86 77 25 23 57

Route #7: 88 60 78 73 79 6 2 70 68

Route #8: 92 67 62 34 50 94 96

Route #9: 99 87 59 97 75 58 74

Route #10: 83 24 22 19 18 48 21 49 20 66

Route #11: 81 93 71 72 41 54

Route #12: 95 33 32 30 28 26 27 29 31 80

---

| Algorithm | Routes | Cost   | Gap (%) | Runtime (Seconds) |
| --------- | ------ | ------ | ------- | ----------------- |
| BKS       | 11     | 1114.2 | 0.0     | -                 |
| HGS       | 11     | 1114.2 | 0.0     | 300.14            |
| GLS       | 10     | 1266.9 | 13.7    | 300.05            |
| ACO       | 11     | 1321.8 | 18.63   | 877.20            |
| SA        | 12     | 1237.6 | 11.08   | 416.81            |

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features & Functionalities](#features--functionalities)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites & Quick Start](#prerequisites--quick-start)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [Frontend: Routes, Components & Reuse](#frontend-routes-components--reuse)
- [Backend: API Endpoints](#backend-api-endpoints)
- [Algorithms & Backend Modules](#algorithms--backend-modules)
- [Teaching Content & Code Snippets](#teaching-content--code-snippets)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [License](#license)
- [Happy Coding!](#happy-coding-)

---

## Project Overview

**VRPTW** is an NP-hard combinatorial optimization problem: route vehicles from a depot to customers with time windows and capacity constraints while minimizing total cost. This repository provides:

- **Backend (Python/FastAPI):** Runs HGS, GLS, ACO, SA, and optionally ILS (when using a second backend with pyvrp ≥0.13). Serves datasets, parameters, solve jobs, streaming results, plots, and AI suggest/explain/tune/RAG.
- **Frontend (React/TypeScript/Vite):** Single-page app with Home, Solver (single algorithm + auto-tune), Compare (all algorithms), Datasets & BKS, and Experiment Results. Route visualization uses backend-generated plot images (Solomon benchmark). TanStack Query and Zustand.

**Educational goals:** Learn metaheuristics, compare algorithms on standard benchmarks, reuse components and API patterns in other projects.

---

## Features & Functionalities

| Feature                    | Description                                                                                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Run single algorithm**   | Pick dataset, algorithm (HGS/ILS/ACO/SA/GLS), runtime, optional params; stream logs and view route plot. Allow 10–20+ minutes for a full run—or more if ACO or SA run with no time limit. Leave the runtime field **empty** to run until the algorithm stops naturally (empty is sent as null; ACO and SA stop after 50 checks of 5 s each, i.e. 250 s, with no improvement in cost or vehicle count), or set a time limit (e.g. 5–15+ min) for predictable results.                                                                                                          |
| **Compare all algorithms** | Run all supported algorithms on one dataset; see merged results and plots. Default runtimes: HGS, GLS, ILS 120s; ACO 15 min; SA 15 min. Allow 10–30+ minutes for a full run—or more if ACO or SA run naturally (leave the runtime field **empty** for no time limit; empty is treated as 0 and sent as null; otherwise it runs for the runtime you set). Each job is polled independently and the table updates as each completes. |
| **Parameter tuning**       | Auto-tune algorithm parameters via AI (optional; requires `GOOGLE_GEMINI_API_KEY`).                                                                                                                               |
| **Datasets & BKS**         | List Solomon instances, download instance/BKS files, view metadata.                                                                                                                                               |
| **Experiment results**     | Browse pre-generated test result sets and experiment summaries (if `test_results` is available).                                                                                                                  |
| **RAG Q&A**                | Ask questions about algorithms (optional; requires RAG dependencies and optional Gemini).                                                                                                                         |

- **GLS runtime:** The app sends the requested limit (e.g. 120 s) to OR-Tools. OR-Tools with Guided Local Search can run past that limit (known behavior); the reported “Solution Runtime” is wall-clock time, so you may see e.g. ~360 s when 120 s was requested.
- **ACO & SA runtime (empty):** If you leave the runtime field empty, ACO and SA run until they stop naturally. They stop early after 50 checks of 5 s each (250 s total) with no improvement in cost or vehicle count; otherwise they run for the time limit you set. Set a time limit (e.g. 5–15+ min) for predictable run duration.

---

## Technology Stack

| Layer        | Technologies                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend** | React 19, TypeScript 5.9, Vite 7, React Router 7, TanStack Query & Table, Zustand, Tailwind CSS 4, Radix UI, GSAP, Axios             |
| **Backend**  | Python 3.11/3.12, FastAPI, Uvicorn, pyvrp (0.6.3 for HGS or ≥0.13 for ILS), OR-Tools (GLS), pandas, Pydantic, python-dotenv, certifi |
| **Optional** | RAG (Chroma, sentence-transformers, PyPDF2), Google Gemini (suggest/explain/tune)                                                    |

---

## Project Structure

```bash
vrptw-solver-comparison/
├── README.md                 # This file
├── RUN.md                    # Concise run instructions
├── DEPLOYMENT.md             # Production (Docker, Vercel, Option A/B/C)
├── .env.example              # Root env template (points to backend/frontend .env)
│
├── frontend/                 # React + Vite SPA
│   ├── index.html            # Entry HTML, SEO meta
│   ├── vite.config.ts
│   ├── package.json
│   ├── .env.example
│   ├── public/               # Static assets (e.g. vite.svg)
│   └── src/
│       ├── main.tsx
│       ├── App.tsx           # Router + QueryProvider + Toaster
│       ├── index.css
│       ├── constants/        # algorithms.ts
│       ├── data/              # faqContent.ts
│       ├── hooks/             # useSolveStream, useDatasets, useStopwatch
│       ├── lib/               # api.ts, utils.ts, toast.ts, instanceLabels.ts
│       ├── pages/             # Home, Solver, Compare, Datasets, Results
│       ├── components/
│       │   ├── layout/        # AppLayout (sidebar, tabs, content)
│       │   ├── solver/       # ParameterTuner, LogConsole
│       │   ├── map/           # RoutePlot, RoutePlotWithControls
│       │   ├── common/        # SectionActions, Skeleton, CopyButton
│       │   └── ui/            # accordion, dialog, tooltip, dropdown-menu
│       ├── providers/         # QueryProvider
│       ├── stores/            # solverStore, solverResultStore, compareResultStore, persistConfig
│       └── types/             # dataset.ts
│
└── backend/                  # FastAPI app
    ├── app/
    │   ├── main.py           # FastAPI app, CORS, routers, RAG bootstrap
    │   ├── core/              # config.py (DATASET_PATH, DEFAULT_RUNTIME, SUPPORTED_ALGOS)
    │   ├── api/
    │   │   ├── routes/       # health, datasets, algorithms, results, parameters, ai, test_results
    │   │   └── models/       # request_models.py
    │   ├── services/         # solver_executor, job_store, rag_service, ai_provider, tune_agent
    │   └── utils/            # instance_reader
    ├── aco/                  # Ant Colony Optimization
    ├── gls/                  # Guided Local Search (OR-Tools)
    ├── sa/                   # Simulated Annealing
    ├── hgs/                  # Hybrid Genetic Search (pyvrp 0.6.3)
    ├── ils/                  # Iterated Local Search (pyvrp ≥0.13)
    ├── dataset/              # Solomon .txt / .sol files
    ├── algorithm_docs/       # Markdown docs for RAG
    ├── requirements.txt
    ├── requirements-ils.txt   # For ILS-only backend
    ├── requirements-rag.txt  # Optional RAG
    ├── .env.example
    └── README.md             # Backend-focused docs & algorithm details
```

---

## Prerequisites & Quick Start

- **Python 3.11 or 3.12** (see `backend/SETUP.md` for SSL/certificate notes on macOS)
- **Node.js** v18+
- **npm**

**One-time setup:**

```bash
# Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

**Environment files:** Copy and edit as needed (see [Environment Variables](#environment-variables)):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Environment Variables

### Root `.env.example`

The repo root has a small `.env.example` that only documents that per-app env files are used: `backend/.env` and `frontend/.env`. Copy the templates from each app directory.

---

### Backend `backend/.env`

| Variable                   | Required | Description                                                                                                    |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `DATASET_PATH`             | No       | Path to dataset folder (default: `dataset`)                                                                    |
| `DEFAULT_RUNTIME`          | No       | Default solve runtime in seconds (default: `120`)                                                              |
| `BACKEND_ALGOS`            | No       | Comma-separated list of algorithms this backend runs. Main: `hgs,gls,aco,sa`. ILS: `ils`. Omit to auto-detect. |
| `GOOGLE_GEMINI_API_KEY`    | No       | For AI suggest/explain/tune and RAG (optional)                                                                 |
| `RAG_PERSIST_DIR`          | No       | Directory for RAG index persistence (optional)                                                                 |
| `RAG_BOOTSTRAP_ON_STARTUP` | No       | Set to `0` to disable auto-building RAG index on startup                                                       |

**How to get API keys:**

- **Google Gemini:** Google AI Studio / Vertex → create API key for Gemini.

**Example `backend/.env`:**

```env
DATASET_PATH=dataset
DEFAULT_RUNTIME=120
# BACKEND_ALGOS=hgs,gls,aco,sa
# GOOGLE_GEMINI_API_KEY=your_key
# RAG_PERSIST_DIR=./rag_index
```

---

### Frontend `frontend/.env`

| Variable                    | Required      | Description                                                                            |
| --------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `VITE_API_URL`              | Yes (for API) | Main backend base URL (e.g. `http://localhost:8000`)                                   |
| `VITE_ILS_API_URL`          | No            | ILS backend base URL (e.g. `http://localhost:8001`) when using Option A (two backends) |
| `VITE_TEST_RESULTS_ZIP_URL` | No            | Override for Results page zip download URL                                             |

**Example `frontend/.env`:**

```env
VITE_API_URL=http://localhost:8000
# VITE_ILS_API_URL=http://localhost:8001
```

All `VITE_*` variables are embedded at **build time**; change and rebuild for production.

---

## How to Run

Choose one of two setups:

| Setup | Terminals | Use when |
|-------|-----------|----------|
| **Single backend** | 1 = Main backend, 2 = Frontend | You only need HGS, GLS, ACO, SA (or ILS too if pyvrp ≥0.13 is in the same venv). |
| **Option A (two backends)** | 1 = Main backend, 2 = ILS backend, 3 = Frontend | You want all 5 algorithms; pyvrp 0.6.3 and 0.13 cannot coexist in one venv. |

**Terminal 1 – Main backend (pyVRP v0.6.3, HGS, GLS, ACO, SA, RAG, AI model):**

```bash
cd backend && source venv/bin/activate
# Option A only: restrict this process to HGS, GLS, ACO, SA
# export BACKEND_ALGOS=hgs,gls,aco,sa
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**What to expect:** Uvicorn runs on **http://0.0.0.0:8000**. With `BACKEND_ALGOS` set (Option A), health returns `["aco", "gls", "hgs", "sa"]`; otherwise all installed algos (including ILS if pyvrp ≥0.13).

**Terminal 2 – ILS backend (pyVRP v0.13+) — Option A only:**

```bash
cd backend && source venv-ils/bin/activate
export BACKEND_ALGOS=ils
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**What to expect:** Second backend on **http://0.0.0.0:8001**; health returns `["ils"]`. Skip this terminal when using single backend.

**Terminal 2 (single) / Terminal 3 (Option A) – Frontend:**

For Option A, set `VITE_ILS_API_URL=http://localhost:8001` in `frontend/.env`. Then:

```bash
cd frontend && npm run dev
```

**What to expect:** App at **<http://localhost:5173>**; single backend uses port 8000 only; Option A uses main backend for HGS/GLS/ACO/SA and ILS backend for ILS.

See **RUN.md** and **DEPLOYMENT.md** for ILS venv setup and production deployment.

---

### Verify APIs (local or production)

Use these commands to confirm backends and RAG are up. Replace the base URL with your local or production host.

**Local – main backend (e.g. after starting Terminal 1):**

```bash
curl -s http://localhost:8000/api/health
curl -s http://localhost:8000/api/datasets
curl -s http://localhost:8000/api/ai/rag/status
```

**Local – ILS backend (e.g. after starting Terminal 2 in Option A):**

```bash
curl -s http://localhost:8001/api/health
curl -s http://localhost:8001/api/datasets
curl -s http://localhost:8001/api/ai/rag/status
```

**Production – main backend (pyvrp 0.6.3):**

```bash
curl -s https://vrptw-api.arnobmahmud.com/api/health
curl -s https://vrptw-api.arnobmahmud.com/api/datasets
curl -s https://vrptw-api.arnobmahmud.com/api/ai/rag/status
```

**Production – ILS backend (pyvrp 0.13+):**

```bash
curl -s https://vrptw-ils.arnobmahmud.com/api/health
curl -s https://vrptw-ils.arnobmahmud.com/api/datasets
curl -s https://vrptw-ils.arnobmahmud.com/api/ai/rag/status
```

**What to expect:**

- **`/api/health`** — JSON with `"status": "ok"` and `"algorithms": ["aco", "gls", "hgs", "sa"]` (main) or `["ils"]` (ILS).
- **`/api/datasets`** — JSON with `"datasets": ["c101", "r101", ...]` (list of instance names).
- **`/api/ai/rag/status`** — JSON with `"available": true|false` and optional `"reason"` (RAG is optional; `available: false` is normal if RAG deps are not installed).

---

## Frontend: Routes, Components & Reuse

### Routes

All routes render the same layout (`AppLayout`) with an inner tab; the active tab is derived from the path.

| Path        | Tab      | Page                                  |
| ----------- | -------- | ------------------------------------- |
| `/`         | home     | Home                                  |
| `/solver`   | solver   | Solver (single algorithm + auto-tune) |
| `/compare`  | compare  | Compare (all algorithms)              |
| `/datasets` | datasets | Datasets & BKS                        |
| `/results`  | results  | Experiment Results                    |

Routing is defined in `App.tsx`; tab state and content are in `AppLayout.tsx`.

---

### Main components and reuse

| Component                                 | Path                                   | Purpose                                                 | Reuse in other projects                                             |
| ----------------------------------------- | -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| **AppLayout**                             | `components/layout/AppLayout.tsx`      | Sidebar, tab navigation, outlet content.                | Use as a shell for any tabbed SPA; replace tab content per route.   |
| **ParameterTuner**                        | `components/solver/ParameterTuner.tsx` | Form for algorithm parameters (from API).               | Reuse for any “parameter form” driven by GET/PUT `/parameters/:id`. |
| **LogConsole**                            | `components/solver/LogConsole.tsx`     | Displays streamed log lines (SSE).                      | Reuse for any EventSource/SSE log viewer.                           |
| **RoutePlot** / **RoutePlotWithControls** | `components/map/`                      | Backend-generated route plot image (Solomon benchmark). | Reuse for any route visualization using image URL.                  |
| **SectionActions**                        | `components/common/SectionActions.tsx` | Actions row (e.g. Run, Reset).                          | Generic section header with buttons.                                |
| **Skeleton**                              | `components/common/Skeleton.tsx`       | Loading placeholder.                                    | Reuse anywhere you need loading UI.                                 |
| **CopyButton**                            | `components/common/CopyButton.tsx`     | Copy text to clipboard.                                 | Reuse for copy-to-clipboard.                                        |
| **UI primitives**                         | `components/ui/`                       | Accordion, dialog, tooltip, dropdown (Radix-based).     | Reuse in any React + Radix project.                                 |

**Using the API client in another project:** Copy `frontend/src/lib/api.ts` and adjust `VITE_API_URL` (or equivalent). All endpoints are documented in [Backend: API Endpoints](#backend-api-endpoints).

---

## Backend: API Endpoints

Base path: `/api`. All routes are under `app/api/routes/`.

### Health

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| GET    | `/api/health` | Liveness check. |

### Datasets

| Method | Endpoint                            | Description                                         |
| ------ | ----------------------------------- | --------------------------------------------------- |
| GET    | `/api/datasets`                     | List dataset names.                                 |
| GET    | `/api/datasets/download-all`        | Download all instance files as zip.                 |
| GET    | `/api/datasets/bks/download-all`    | Download all BKS files as zip.                      |
| GET    | `/api/datasets/{name}`              | Get dataset metadata, coordinates, BKS routes/cost. |
| GET    | `/api/datasets/{name}/download`     | Download instance file.                             |
| GET    | `/api/datasets/{name}/bks/download` | Download BKS file.                                  |

### Solve & results

| Method | Endpoint                     | Description                                                                                   |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------------- |
| POST   | `/api/solve/{algo}`          | Start solve job; body: `{ dataset, runtime?, params? }`. Returns `{ job_id }`.                |
| POST   | `/api/solve/compare`         | Start compare job (all algos); body: `{ dataset, runtime?, params? }`. Returns `{ job_ids }`. |
| POST   | `/api/solve/{job_id}/stop`   | Stop a running job.                                                                           |
| GET    | `/api/solve/{job_id}/stream` | SSE stream of log lines.                                                                      |
| GET    | `/api/results/{job_id}`      | Get job status and result (routes, cost, runtime).                                            |
| GET    | `/api/results/{job_id}/plot` | Get route plot image.                                                                         |

### Parameters

| Method | Endpoint                 | Description                                        |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/api/parameters/{algo}` | Get default parameters for algorithm.              |
| PUT    | `/api/parameters/{algo}` | Update default parameters; body: key-value params. |

### AI

| Method | Endpoint                                 | Description                                                                                |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/api/ai/suggest?algo=&dataset=&prompt=` | AI suggestion for parameters (optional; needs Gemini).                                     |
| POST   | `/api/ai/explain`                        | Body: `{ dataset, results }`; get AI explanation (optional).                               |
| GET    | `/api/ai/rag/status`                     | RAG availability.                                                                          |
| POST   | `/api/ai/rag/reindex`                    | Rebuild RAG index.                                                                         |
| POST   | `/api/ai/ask`                            | Body: `{ question }`; RAG Q&A (optional).                                                  |
| POST   | `/api/ai/tune`                           | Body: `{ algo, dataset, max_iterations?, runtime_per_run?, goal? }`; auto-tune (optional). |

### Test results (pre-generated)

| Method | Endpoint                                               | Description                  |
| ------ | ------------------------------------------------------ | ---------------------------- |
| GET    | `/api/test-results`                                    | List result sets.            |
| GET    | `/api/test-results/{set_id}`                           | List experiments in set.     |
| GET    | `/api/test-results/{set_id}/{exp_id}/content`          | Get experiment text content. |
| GET    | `/api/test-results/{set_id}/{exp_id}/image/{filename}` | Get experiment image.        |

**Static file:** `GET /test_results.zip` (served by `app.main`; 404 if file missing).

---

## Algorithms & Backend Modules

| Algorithm | Backend module | Notes                                                                         |
| --------- | -------------- | ----------------------------------------------------------------------------- |
| **HGS**   | `hgs/solve.py` | Hybrid Genetic Search via pyvrp 0.6.3.                                        |
| **ILS**   | `ils/solve.py` | Iterated Local Search via pyvrp ≥0.13 (separate venv/backend in Option A).    |
| **ACO**   | `aco/`         | Ant Colony Optimization (vrptw_base, ant, multiple_ant_colony_system, solve). |
| **SA**    | `sa/`          | Simulated Annealing (instance_loader, simulated_annealing, solve).            |
| **GLS**   | `gls/`         | Guided Local Search with OR-Tools (instance_loader, base_solver, solve).      |

The backend uses `app.core.config.SUPPORTED_ALGOS` (and `BACKEND_ALGOS`) to decide which algorithms are available. The executor in `app.services.solver_executor` dispatches to the correct module per algorithm.

---

## Teaching Content & Code Snippets

### Calling the solve API from the frontend

```ts
import { postSolve, getResult, getPlotUrl } from "@/lib/api";

// Start job
const { job_id } = await postSolve("hgs", "r101", 120);

// Poll for result
const result = await getResult(job_id);
if (result.result) {
  console.log("Cost:", result.result.cost, "Routes:", result.result.routes);
}

// Plot image URL
const plotUrl = getPlotUrl(job_id);
```

### Streaming solve logs (SSE)

```ts
const base = getApiBaseUrl("hgs");
const eventSource = new EventSource(`${base}/api/solve/${jobId}/stream`);
eventSource.onmessage = (e) => console.log(e.data);
eventSource.onerror = () => eventSource.close();
```

### Using datasets and parameters

```ts
const datasets = await getDatasets();
const meta = await getDataset("r101");
const params = await getParameters("aco");
await putParameters("aco", { ants_num: 40, beta: 0.9 });
```

### Backend: running a single algorithm (Python)

```python
from hgs.solve import solve_with_hgs
routes, cost = solve_with_hgs("dataset/r101.txt", runtime=120)
```

See **backend/README.md** for detailed algorithm descriptions, parameter tuning, and more code examples (ACO, GLS, SA, HGS, visualization, batch runs).

---

## Keywords

VRPTW, vehicle routing problem, time windows, metaheuristics, Hybrid Genetic Search, HGS, Iterated Local Search, ILS, Ant Colony Optimization, ACO, Simulated Annealing, GLS, Guided Local Search, Solomon benchmark, route optimization, combinatorial optimization, NP-hard, FastAPI, React, Vite, TypeScript, benchmarking, visualization, operations research, logistics.

---

## Conclusion

This project is a full-stack VRPTW comparison tool and learning resource. You can:

- **Run and compare** multiple metaheuristic algorithms on standard instances.
- **Integrate** the same API and UI patterns into other apps.
- **Extend** with new algorithms or datasets by following the existing backend/frontend structure.
- **Teach or learn** metaheuristics using the backend README, algorithm docs, and in-app RAG (when enabled).

For step-by-step run instructions see **RUN.md**; for production deployment see **DEPLOYMENT.md**. For deep dives into algorithms and parameters see **backend/README.md**.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

---

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
