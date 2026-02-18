# Vehicle Routing Problem with Time Windows (VRPTW) Solver Comparison — Frontend React Project

React + TypeScript + Vite frontend for the **VRPTW Solver Comparison** project. For full project overview, run instructions, environment variables, and API documentation, see the **[root README](../README.md)** and **[RUN.md](../RUN.md)**.

- **Live-Demo:** [https://vrptw-solver.vercel.app/](https://vrptw-solver.vercel.app/)
- **Backend 0.6.3 version:** [https://vrptw-api.arnobmahmud.com/](https://vrptw-api.arnobmahmud.com/)
- **Backend 0.13+ version:** [https://vrptw-ils.arnobmahmud.com/](https://vrptw-ils.arnobmahmud.com/)

---

## Stack

- **React 19** + **TypeScript 5.9**
- **Vite 7** (build tool, HMR)
- **React Router 7** (routes: `/`, `/solver`, `/compare`, `/datasets`, `/results`)
- **TanStack Query** (server state), **Zustand** (client state)
- **Tailwind CSS 4** + **Radix UI** (accordion, dialog, tooltip, dropdown)
- **Axios** for API calls; route visualization via backend-generated plot images

---

## Quick start

```bash
npm install
npm run dev
```

Requires a running backend (see root [How to Run](../README.md#how-to-run)). Default frontend dev URL: **<http://localhost:5173>**.

---

## Environment

Copy and edit:

```bash
cp .env.example .env
```

| Variable                    | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `VITE_API_URL`              | Main backend base URL (e.g. `http://localhost:5000`)         |
| `VITE_ILS_API_URL`          | Optional; ILS backend URL when using two backends (Option A) |
| `VITE_TEST_RESULTS_ZIP_URL` | Optional; override zip download URL for Results page         |

All `VITE_*` vars are embedded at build time.

---

## Structure (relevant to this app)

```bash
src/
├── App.tsx              # Router, QueryProvider, Toaster
├── main.tsx
├── index.css
├── constants/           # algorithms.ts
├── data/                # faqContent.ts
├── hooks/               # useSolveStream, useDatasets, useStopwatch
├── lib/                 # api.ts, utils.ts, toast.ts, instanceLabels.ts
├── pages/               # Home, Solver, Compare, Datasets, Results
├── components/
│   ├── layout/          # AppLayout (sidebar, tabs)
│   ├── solver/          # ParameterTuner, LogConsole
│   ├── map/              # RoutePlot, RoutePlotWithControls
│   ├── common/           # SectionActions, Skeleton, CopyButton
│   └── ui/               # accordion, dialog, tooltip, dropdown-menu
├── providers/           # QueryProvider
├── stores/              # solverStore, solverResultStore, compareResultStore, persistConfig
└── types/               # dataset.ts
```

---

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start Vite dev server               |
| `npm run build`   | TypeScript check + production build |
| `npm run preview` | Serve production build locally      |
| `npm run lint`    | Run ESLint                          |

---

## Reusing in other projects

- **API client:** Copy `src/lib/api.ts` and set your backend base URL; endpoints are documented in the root README.
- **UI components:** `components/ui/` and `components/common/` are generic (accordion, dialog, Skeleton, CopyButton, etc.) and can be dropped into other React + Tailwind/Radix apps.
- **Layout:** `AppLayout` is a tabbed layout shell; reuse and swap tab content for your own routes.

---

## Optional: ESLint

This app uses the default Vite + React + TypeScript ESLint setup. To enable type-aware or stricter rules, see the [Vite + ESLint documentation](https://eslint.org/docs/latest/use/configure/typescript) and extend with `tsconfig` in `parserOptions`. Example:

```js
// eslint.config.js - optional type-aware rules
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // ...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
```

---

For full project documentation, see **[README.md](../README.md)** in the repository root.
