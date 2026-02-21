# Vehicle Routing Problem with Time Windows (VRPTW) Solver Comparison — React, TypeScript, Vite Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)](https://tailwindcss.com/)

React + TypeScript + Vite frontend for the **VRPTW Solver Comparison** project. Single-page app with Home, Solver (single algorithm), Compare (all algorithms), Datasets & BKS, Experiment Results, and API Status documentation. Uses TanStack Query for server state, Zustand for client state, and Axios for API calls; route plots are backend-generated images.

- **Live demo:** [https://vrptw-solver.vercel.app/](https://vrptw-solver.vercel.app/)
- **Backend (pyvrp 0.6.3):** [https://vrptw-api.arnobmahmud.com/](https://vrptw-api.arnobmahmud.com/)
- **Backend (pyvrp 0.13+ ILS):** [https://vrptw-ils.arnobmahmud.com/](https://vrptw-ils.arnobmahmud.com/)

For full project overview, run instructions, and API documentation, see the **[root README](../README.md)** and **[RUN.md](../RUN.md)**. This document focuses on **frontend structure, routes, components, hooks, stores, environment, and reusability** for teaching and extension.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Routes & Pages](#routes--pages)
- [Components](#components)
- [Hooks](#hooks)
- [Stores](#stores)
- [API Client](#api-client)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [Environment Variables](#environment-variables)
- [Code Examples & Reusability](#code-examples--reusability)
- [Scripts](#scripts)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [Contact](#contact)

---

## Project Overview

The frontend is a **single-page application (SPA)** that talks to the VRPTW backend (and optionally a second ILS backend). Users can:

- **Home:** Landing and introduction
- **Solver:** Pick a dataset and algorithm (HGS, GLS, ACO, SA, ILS), tune parameters, run a solve, stream logs via SSE, view result and route plot, stop run
- **Compare:** Run all algorithms on one dataset (Default or Custom Tune), poll per-job status, see a results table and optional AI explanation
- **Datasets & BKS:** List instances, view metadata and BKS, download instance/BKS files
- **Experiment Results:** Browse pre-generated test result sets (if backend serves them)
- **API Status Documentation:** Health checks and endpoint documentation

Routing is done with **React Router 7**; all main routes render the same **AppLayout** (sidebar + tab navigation). The active tab is derived from the path; layout content switches between Home, Solver, Compare, Datasets, and Results. **TanStack Query** caches server data (e.g. datasets list); **Zustand** holds UI state (selected dataset/algo, compare result snapshot). **Vite** is the build tool and dev server; **Tailwind CSS 4** and **Radix UI** power styling and accessible primitives.

---

## Features

- **Single-algorithm run:** Dataset and algorithm selection, parameter tuner (schema-driven from API), run/stop, live log stream (SSE), result summary and route plot image
- **Compare all algorithms:** Default or Custom Tune (per-algo params), parallel jobs, polling until done, results table with cost/routes/runtime/gap, optional “Explain results” (AI), route plot per algo
- **Datasets & BKS:** List datasets, fetch metadata (coordinates, BKS cost/routes), download instance or BKS
- **Experiment Results:** List result sets and experiments, view text content and images (when backend provides test_results)
- **API Status:** Health checks for main and optional ILS backend, response times, RAG status
- **Optional ILS backend:** When `VITE_ILS_API_URL` is set, solve/stream/results/plot for ILS use the ILS backend; compare page starts ILS job on that backend and merges job_ids

---

## Technologies Used

| Area              | Technology                                                                   |
| ----------------- | ---------------------------------------------------------------------------- |
| **UI**            | React 19, TypeScript 5.9                                                     |
| **Build & dev**   | Vite 7 (HMR, production build)                                               |
| **Routing**       | React Router 7                                                               |
| **Server state**  | TanStack Query (React Query)                                                 |
| **Client state**  | Zustand (with persist for compare result snapshot)                           |
| **HTTP**          | Axios (base URL, timeout, optional ILS client)                               |
| **Styling**       | Tailwind CSS 4, PostCSS, class-variance-authority (cva), tailwind-merge (cn) |
| **UI primitives** | Radix UI (accordion, dialog, tooltip, dropdown-menu)                         |
| **Icons**         | Lucide React                                                                 |
| **Animations**    | GSAP                                                                         |
| **Toasts**        | Sonner                                                                       |
| **Tables**        | TanStack Table (e.g. Compare table)                                          |

---

## Project Structure

```text
frontend/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── .env.example
├── public/                 # Static assets
└── src/
    ├── main.tsx            # Entry: React root, strict mode
    ├── App.tsx              # QueryProvider, Toaster, BrowserRouter, Routes
    ├── App.css
    ├── index.css            # Global styles, Tailwind
    ├── constants/
    │   └── algorithms.ts    # ALGO_IDS, ALGO_DISPLAY_NAMES, getAlgoDisplayName
    ├── data/
    │   └── faqContent.ts    # FAQ content for Home
    ├── hooks/
    │   ├── useSolveStream.ts   # SSE stream + fallback polling for single solve
    │   ├── useDatasets.ts      # TanStack Query for GET /api/datasets
    │   └── useStopwatch.ts     # Elapsed time for running jobs
    ├── lib/
    │   ├── api.ts           # Axios instances, health, datasets, solve, results, plot, AI, test-results
    │   ├── utils.ts         # cn (classnames), etc.
    │   ├── toast.ts         # Toast helpers
    │   └── instanceLabels.ts  # Dataset display labels
    ├── pages/
    │   ├── Home.tsx         # Landing, intro, links
    │   ├── Solver.tsx       # Single-algo run: dataset/algo picker, ParameterTuner, run/stop, LogConsole, result + RoutePlotWithControls
    │   ├── Compare.tsx      # Compare: dataset, Default/Custom Tune, run, poll, results table, Explain, plots
    │   ├── Datasets.tsx     # List datasets, metadata, download
    │   ├── Results.tsx      # Experiment result sets and experiments
    │   └── ApiStatusDocumentation.tsx  # Health, endpoints, timings
    ├── components/
    │   ├── layout/
    │   │   └── AppLayout.tsx    # Sidebar, tabs (Home, Solver, Compare, Datasets, Results), TabContent by path
    │   ├── solver/
    │   │   ├── ParameterTuner.tsx   # Algo-specific params from schema, API sync, AI suggest, runtime hint (ACO/SA)
    │   │   └── LogConsole.tsx       # Log lines + typewriter effect on last line
    │   ├── map/
    │   │   ├── RoutePlot.tsx         # img from backend plot URL
    │   │   └── RoutePlotWithControls.tsx  # Plot + refresh, copy summary, download PNG, fullscreen
    │   ├── common/
    │   │   ├── SectionActions.tsx    # Action buttons row (e.g. Run, Reset)
    │   │   ├── Skeleton.tsx          # Loading placeholder
    │   │   └── CopyButton.tsx        # Copy text to clipboard
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── dialog.tsx
    │       ├── tooltip.tsx
    │       └── dropdown-menu.tsx
    ├── providers/
    │   └── QueryProvider.tsx   # TanStack QueryClientProvider
    ├── stores/
    │   ├── solverStore.ts         # selectedDataset, selectedAlgo (Solver page)
    │   ├── solverResultStore.ts   # Cached result/plot for Solver (persist)
    │   ├── compareResultStore.ts  # Latest compare result snapshot (persist)
    │   └── persistConfig.ts      # Persist version, isFresh()
    └── types/
        └── dataset.ts        # Dataset-related types
```

---

## Routes & Pages

All routes render **AppLayout**; the layout reads the current path and shows the corresponding page inside the content area.

| Path                        | Tab      | Page                   | Description                                                                                                       |
| --------------------------- | -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/`                         | home     | Home                   | Landing, project intro, FAQ, links to Solver/Compare                                                              |
| `/solver`                   | solver   | Solver                 | Single algorithm: dataset + algo picker, ParameterTuner, run/stop, LogConsole, result card, RoutePlotWithControls |
| `/compare`                  | compare  | Compare                | Dataset, Default vs Custom Tune, run all algos, poll job_ids, results table, Explain, per-algo plots              |
| `/datasets`                 | datasets | Datasets               | List datasets (from API), metadata and BKS, download instance/BKS                                                 |
| `/results`                  | results  | Results                | List experiment sets and experiments (test_results API), view content and images                                  |
| `/api-status-documentation` | —        | ApiStatusDocumentation | Health for main + ILS, endpoint list, response times, RAG status                                                  |

Tabs are defined in `AppLayout.tsx` (`TABS`); the active tab is derived from `useLocation().pathname`. The extra route `/api-status-documentation` is reachable from the layout (e.g. link in sidebar or footer) and also renders inside AppLayout.

---

## Components

### Layout

- **AppLayout** (`components/layout/AppLayout.tsx`): Sidebar with tab links (Home, Run Single Algorithm, Compare All Algorithms, Datasets & BKS, Experiment Results), optional API Status link, and main content area. Renders `TabContent` which switches between `HomePage`, `Solver`, `Compare`, `Datasets`, `Results` based on path. Uses GSAP for content fade-in.

### Solver

- **ParameterTuner** (`components/solver/ParameterTuner.tsx`): Renders algo-specific parameter inputs from a schema (ACO: ants_num, beta, q0, rho, runtime_minutes; SA: init_temp, cooling_rate, runtime_minutes; GLS/HGS/ILS: runtime in seconds). Syncs with GET/PUT `/api/parameters/{algo}`. Optional AI suggest; for ACO/SA shows runtime hint (“Leave empty to run until… or set a time limit”). Sends `runtime_minutes: null` when field is empty (natural run).
- **LogConsole** (`components/solver/LogConsole.tsx`): Displays an array of log lines; optional typewriter effect on the last line while streaming.

### Map

- **RoutePlot** (`components/map/RoutePlot.tsx`): Renders an `<img>` from the backend plot URL (GET `/api/results/{job_id}/plot`).
- **RoutePlotWithControls** (`components/map/RoutePlotWithControls.tsx`): Wraps plot image with refresh, copy summary, download PNG, and fullscreen dialog. Uses `getPlotUrl(jobId, algo)` for main or ILS backend. Supports `preferCachedOnly` to avoid duplicate request when URL is already cached.

### Common

- **SectionActions**: Generic row of action buttons (e.g. Run Algorithm, Reset).
- **Skeleton**: Loading placeholder (e.g. while datasets or result is loading).
- **CopyButton**: Copy given text to clipboard with optional toast.

### UI (Radix-based)

- **accordion**, **dialog**, **tooltip**, **dropdown-menu**: Reusable primitives; used across Solver, Compare, Datasets, Results, and API Status.

---

## Hooks

- **useSolveStream** (`hooks/useSolveStream.ts`): Opens EventSource to `/api/solve/{jobId}/stream` for live log lines and `done` event. Falls back to polling GET `/api/results/{jobId}` if SSE fails. Returns `logs`, `status`, `result`, `error`, `connectionLost`, and `clear()`. Uses `getApiBaseUrl(algo)` so ILS jobs use the ILS backend for stream and result.
- **useDatasets** (`hooks/useDatasets.ts`): `useQuery({ queryKey: ["datasets"], queryFn: getDatasets })` for the list of dataset names.
- **useStopwatch** (`hooks/useStopwatch.ts`): Tracks elapsed seconds (e.g. for running job display).

---

## Stores

- **solverStore** (`stores/solverStore.ts`): `selectedDataset`, `selectedAlgo`, and setters. Used on the Solver page. Not persisted.
- **solverResultStore** (`stores/solverResultStore.ts`): Cached result and plot URL for the Solver page (e.g. last completed run). Persisted with `persistConfig`.
- **compareResultStore** (`stores/compareResultStore.ts`): `latestCompleted` (dataset, rows, bksCost, bksRouteCount, explanation). Used for “Last saved result” and optional restore on Compare. Persisted; `getLatestIfFresh()` and schema version in `persistConfig`.

---

## API Client

**File:** `src/lib/api.ts`

- **Axios instances:** `api` (main backend, `VITE_API_URL`), `apiIls` (optional, `VITE_ILS_API_URL`). Base path `/api`, timeout 25s.
- **Health:** `getHealthStatus()`, `getHealthStatusIls()`, `getDetailedStatus()` (main + ILS + datasets + RAG timing).
- **Datasets:** `getDatasets()`, `getDataset(name)`, download helpers.
- **Solve:** `postSolve(algo, dataset, runtime?, params?)`, `postCompare(dataset, runtime?, params?)`, `getCompareStatus(jobIds)`, `getResult(jobId, algo?)`, `postStopSolve(jobId, algo?)`, `getPlotUrl(jobId, algo?)`. When `hasIlsBackend` and algo is ILS, solve/result/stop/plot use `apiIls`.
- **Parameters:** `getParameters(algo)`, `putParameters(algo, body)`.
- **AI:** `getAiSuggest(algo, dataset, prompt?)`, `postAiExplain(body)`, `postAiTune(body)`, RAG status/reindex/ask.
- **Test results:** `getTestResultSets()`, `getTestResultExperiments(setId)`, `getTestResultContent(setId, expId)`, `getTestResultImageUrl(...)`.

All `VITE_*` variables are embedded at **build time**; change and rebuild for production.

---

## Installation & Setup

**Prerequisites:** Node.js v18+, npm.

```bash
cd frontend
npm install
```

Copy and edit environment (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env
```

---

## How to Run

**Development (with backend running):**

```bash
cd frontend && npm run dev
```

Open **<http://localhost:5173>**. The app uses `VITE_API_URL` (default `http://localhost:8000`). For Option A (two backends), set `VITE_ILS_API_URL=http://localhost:8001` in `frontend/.env` and run both backends as in the [root README — How to Run](../README.md#how-to-run).

**Production build:**

```bash
npm run build
npm run preview   # optional: serve dist locally
```

Deploy the `dist/` folder (e.g. Vercel, Netlify). Set `VITE_API_URL` (and optionally `VITE_ILS_API_URL`, `VITE_TEST_RESULTS_ZIP_URL`) for the build environment so they are baked into the bundle.

---

## Environment Variables

Create `frontend/.env` from `frontend/.env.example`.

| Variable                    | Required      | Description                                                             |
| --------------------------- | ------------- | ----------------------------------------------------------------------- |
| `VITE_API_URL`              | Yes (for API) | Main backend base URL (e.g. `http://localhost:8000`)                    |
| `VITE_ILS_API_URL`          | No            | ILS backend base URL (e.g. `http://localhost:8001`) when using Option A |
| `VITE_TEST_RESULTS_ZIP_URL` | No            | Override URL for Results page zip download                              |

**Example `frontend/.env`:**

```env
VITE_API_URL=http://localhost:8000
# VITE_ILS_API_URL=http://localhost:8001
# VITE_TEST_RESULTS_ZIP_URL=http://localhost:8000/test_results.zip
```

---

## Code Examples & Reusability

### Start a solve and stream logs

```ts
import { postSolve } from "@/lib/api";
import { useSolveStream } from "@/hooks/useSolveStream";

const { job_id } = await postSolve("hgs", "r101", 120);
const { logs, status, result, clear } = useSolveStream(job_id, "hgs");
// When status === "done", result contains routes, cost, runtime.
```

### Fetch datasets and parameters

```ts
import { useDatasets } from "@/hooks/useDatasets";
import { getDataset, getParameters } from "@/lib/api";

const { data: datasets } = useDatasets();
const meta = await getDataset("r101");
const params = await getParameters("aco");
```

### Compare page: run all and poll

```ts
import { postCompare, getCompareStatus, getResult } from "@/lib/api";

const { job_ids } = await postCompare("r101", 120, compareParams);
// Poll until all completed
let jobs = await getCompareStatus(job_ids);
while (Object.values(jobs).some((j) => j.status === "running")) {
  await new Promise((r) => setTimeout(r, 2000));
  jobs = await getCompareStatus(job_ids);
}
// jobs[algo].result has routes, cost, runtime
```

### Reusing components in another project

- **API client:** Copy `src/lib/api.ts` and set `VITE_API_URL` (and optional `VITE_ILS_API_URL`) for your backend. Endpoints are documented in the root README.
- **AppLayout:** Use as a tabbed shell; replace tab content or add routes to match your app.
- **ParameterTuner:** Driven by a schema and GET/PUT parameters; adapt schema and API paths for your own tuner.
- **LogConsole:** Use with any EventSource or array of log lines for an SSE-style log viewer.
- **RoutePlotWithControls:** Use with any plot image URL (refresh, copy, download, fullscreen).
- **UI (accordion, dialog, tooltip, dropdown):** Drop into any React + Tailwind + Radix project.
- **Stores:** solverStore/compareResultStore patterns (Zustand + optional persist) can be reused for similar “selected options” and “last result” state.

---

## Scripts

| Command           | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `npm run dev`     | Start Vite dev server (default <http://localhost:5173>)       |
| `npm run build`   | TypeScript check (`tsc -b`) + production build (`vite build`) |
| `npm run preview` | Serve production build locally                                |
| `npm run lint`    | Run ESLint                                                    |

---

## Keywords

VRPTW, React, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, Radix UI, FastAPI, vehicle routing, metaheuristics, Solomon benchmark, single-page app, SSE, streaming logs, route visualization.

---

## Conclusion

The frontend provides a complete UI for running and comparing VRPTW algorithms, managing datasets, and viewing results. It is built for reuse: API client, hooks, stores, and generic components can be adapted for other optimization or benchmarking UIs. For run instructions and backend API details see the [root README](../README.md).

---

## Contact

**Arnob Mahmud**

- **Portfolio:** [https://www.arnobmahmud.com](https://www.arnobmahmud.com)
- **GitHub:** [https://github.com/arnobt78](https://github.com/arnobt78)

For questions, feedback, or to share your work using this project, feel free to reach out.

---

## Happy Coding! 🎉

Feel free to use and extend this frontend. If you have questions or want to share what you’ve built, reach out via GitHub or [portfolio](https://www.arnobmahmud.com). Enjoy building and learning! 🚀
