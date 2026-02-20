# How to Run VRPTW Solver Comparison

## Prerequisites

- **Python 3.11 or 3.12** (see backend/SETUP.md for SSL/certificate notes on macOS)
- **Node.js** (v18+)
- **npm**

---

## One-time setup (if you haven’t already)

### Backend

```bash
cd backend

# Create and activate virtual environment
python3.12 -m venv venv   # or python3.11
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Optional: for ILS algorithm (replaces HGS with ILS in pyvrp 0.13+)
# pip install 'pyvrp>=0.13'

# Optional: RAG (Home page "Ask about algorithms"). Not required to run the app.
# If you want it: after activating the main backend venv, run:
#   pip install -r requirements-rag.txt
# Then start the backends as below. Backend startup auto-builds the index once if missing.
# Production tip: set RAG_PERSIST_DIR to a writable persistent path/volume so index is reused across restarts.
# Optional: set RAG_BOOTSTRAP_ON_STARTUP=0 to disable startup auto-bootstrap.
# Auto-tune (Solver page) needs no extra install.
```

**Which algorithms are actually running?**

- **With only `requirements.txt` (pyvrp 0.6.3):**  
  **HGS is installed and working.** The app runs ACO, GLS, SA, and HGS. If the ILS option appears and runs, it still uses pyvrp 0.6.3 under the hood, so the engine is HGS (same as the HGS option). You do _not_ have the distinct ILS algorithm unless you install pyvrp ≥0.13.

- **If you install `pyvrp>=0.13`:**  
  You get the **ILS** algorithm, but pyvrp 0.13+ no longer includes HGS—so you trade HGS for ILS in that environment. You cannot have both HGS (0.6.3) and ILS (0.13+) in the same venv; pick one or use two separate venvs.

### Frontend

```bash
cd frontend

# Install dependencies
npm install
```

---

## Running (single backend)

Use **two terminals**:

### Terminal 1 – Backend API

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### Terminal 2 – Frontend

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Option A: All 5 algorithms (HGS + GLS + ACO + SA + ILS) — 3 terminals

To run **both** the main backend (4 algos on pyvrp 0.6.3) and the ILS backend (ILS on pyvrp 0.13+) locally, use three terminals. Same setup is used later for Docker (2 containers) + Vercel.

### Why two venvs and different `pip install`?

- **pyvrp 0.6.3** (HGS) and **pyvrp 0.13+** (ILS) **cannot be installed in the same environment**. If you run `pip install 'pyvrp>=0.13'` in the same venv as `pyvrp==0.6.3`, pip will replace 0.6.3 with 0.13+ and you lose HGS.
- So you need **two virtual environments** and **two requirement files**:
  - **venv** + **requirements.txt** → `pyvrp==0.6.3` (main backend: HGS, GLS, ACO, SA).
  - **venv-ils** + **requirements-ils.txt** → `pyvrp>=0.13` (ILS backend: ILS only).
- **BACKEND_ALGOS** tells each process which algorithms it is allowed to run: main uses `hgs,gls,aco,sa`, ILS uses `ils`, so the frontend can send requests to the right port.

### One-time setup for Option A

**Main backend (already done if you use `requirements.txt`):**

```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**ILS backend (second venv, same `backend/` folder — use `requirements-ils.txt`, not `requirements.txt`):**

```bash
cd backend
python3.12 -m venv venv-ils
source venv-ils/bin/activate
pip install -r requirements-ils.txt
deactivate
```

**Frontend:** set the ILS backend URL (create or edit `frontend/.env`):

```env
VITE_API_URL=http://localhost:5000
VITE_ILS_API_URL=http://localhost:8001
```

### Run all three (simulate Option A locally)

**Terminal 1 – Main backend (HGS, GLS, ACO, SA)**

```bash
cd backend
source venv/bin/activate
export BACKEND_ALGOS=hgs,gls,aco,sa
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

(Optional: add `BACKEND_ALGOS=hgs,gls,aco,sa` to `backend/.env` so you don’t need to export.)

**Terminal 2 – ILS backend (ILS only)**

```bash
cd backend
source venv-ils/bin/activate
export BACKEND_ALGOS=ils
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 3 – Frontend**

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**. Use **Run Solver** to run any of the 5 algorithms (ILS requests go to port 8001; the other 4 go to port 5000). Use **Compare** to run all 5 in parallel; the frontend starts 4 jobs on the main backend and 1 ILS job on the ILS backend, then polls each job's status independently and updates the table as each completes. Default runtimes: HGS, GLS, ILS 120s; ACO 10 min; SA 10 min.

---

## Run standalone script (backend/main.py)

```bash
cd backend
source venv/bin/activate
python main.py
```

This runs all algorithms on the configured dataset and saves plots.

---

## Summary

| Action              | Command                                     |
| ------------------- | ------------------------------------------- |
| Backend dev server  | `uvicorn app.main:app --reload --port 5000` |
| Frontend dev server | `npm run dev`                               |
| Standalone script   | `python main.py`                            |

Reinstall only if you add new dependencies or reset your environment (e.g. new venv).

---

## Later: Docker + VPS + Vercel

When you deploy:

- **Two Docker containers** (e.g. on Coolify): one image with `requirements.txt` + `BACKEND_ALGOS=hgs,gls,aco,sa` (main API), one with `requirements-ils.txt` + `BACKEND_ALGOS=ils` (ILS API). Same app code, different env and deps.
- **Frontend on Vercel**: set `VITE_API_URL` to the main backend URL and `VITE_ILS_API_URL` to the ILS backend URL (build-time env vars).
- See **DEPLOYMENT.md** for Option A details and CORS/production notes.
