# Production: Using Both HGS and ILS

The app is **ready for Option A**: main backend (4 algos) + ILS backend (1 algo) + single frontend. Local test: **RUN.md** → "Option A: All 5 algorithms (3 terminals)". For Docker (Coolify) and Vercel, use the same env and two backend containers; deployment steps can be added when you’re ready.

PyVRP 0.6.3 provides **HGS**; PyVRP 0.13+ provides **ILS**. They cannot be installed in the same Python environment. Below are production options so the frontend can offer both.

---

## Option A: Two backends, one frontend (recommended)

Run two backend services and have the frontend call the right one by algorithm.

| Service      | Port (example) | PyVRP  | Algorithms        |
|-------------|-----------------|--------|-------------------|
| Backend HGS | 5000            | 0.6.3  | HGS, ACO, GLS, SA |
| Backend ILS | 8001            | ≥0.13  | ILS only          |

- **Frontend**: Single app. Uses `VITE_API_URL` for most requests; uses `VITE_ILS_API_URL` only for ILS (solve, stream, results, plot). Same API contract on both backends.
- **Deploy**: Two processes (e.g. two containers, or two uvicorn instances). Each has its own venv and `requirements.txt` (HGS backend: `pyvrp==0.6.3`; ILS backend: `pyvrp>=0.13` and minimal deps).
- **Compare**: If “compare” includes ILS, frontend calls main backend for HGS/ACO/GLS/SA and ILS backend for ILS, then merges results.

**Pros:** Clear separation, same API, easy to scale.  
**Cons:** Two deployments; compare flow must merge two response sets.

---

## Option B: One main backend + ILS worker (single API URL)

One “main” backend (PyVRP 0.6.3) handles HGS, ACO, GLS, SA and the public API. A small **ILS worker** (PyVRP ≥0.13) only runs ILS.

- **Main backend**: For `POST /api/solve/ils` it forwards the request to the ILS worker, receives `job_id`, and returns that (or a wrapped id). For `GET /api/solve/{job_id}/stream` and `GET /api/results/{job_id}` (and plot), if the job is an ILS job, the main backend **proxies** to the ILS worker.
- **Frontend**: Still uses a single `VITE_API_URL`; no change.
- **Deploy**: Main app (e.g. port 5000) + ILS worker (e.g. port 8001). Main backend has `ILS_SERVICE_URL=http://localhost:8001` (or internal URL in production).

**Pros:** One API for the frontend; one place to add auth, rate limits, etc.  
**Cons:** Backend must implement proxy and (optionally) job-id mapping.

---

## Option C: One backend, one venv (HGS or ILS only)

Use a single backend and a single venv. Install either `pyvrp==0.6.3` (HGS only) or `pyvrp>=0.13` (ILS only). Frontend only shows the algorithms that backend supports.

**Pros:** Simplest to deploy and operate.  
**Cons:** Users cannot choose both HGS and ILS.

---

## Summary

| Option | Frontend API URLs | Backends / processes | Both HGS and ILS |
|--------|-------------------|----------------------|------------------|
| A      | Main + ILS URL    | 2 (HGS + ILS)        | Yes              |
| B      | Single URL        | 2 (main + ILS worker)| Yes (main proxies) |
| C      | Single URL        | 1                    | No (pick one)    |

For **production with both HGS and ILS**, Option A (two backends, frontend routes by algo) or Option B (main backend + ILS worker, main proxies) are both valid. Option A is easier to add without changing the main backend; Option B keeps a single entry point for the frontend.

---

## Frontend setup for Option A (two backends)

The frontend is already wired for Option A. When `VITE_ILS_API_URL` is set, it will:

- Send **solve**, **stream**, **results**, and **plot** requests for the **ILS** algorithm to the ILS backend.
- Send all other algorithms (HGS, ACO, GLS, SA) and dataset/health requests to `VITE_API_URL`.

**Environment variables (e.g. `frontend/.env`):**

```env
# Main backend (HGS, ACO, GLS, SA)
VITE_API_URL=http://localhost:5000

# ILS backend (only used when user selects ILS or when Compare includes ILS)
# Omit or leave empty to use a single backend.
VITE_ILS_API_URL=http://localhost:8001
```

**Running locally with two backends:**

1. **Terminal 1 – Main backend (HGS, pyvrp 0.6.3)**  
   `cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 5000`

2. **Terminal 2 – ILS backend (pyvrp ≥0.13)**  
   Use a second copy of the backend with a separate venv where `pip install 'pyvrp>=0.13'` (and no `pyvrp==0.6.3`). Run on port 8001:  
   `uvicorn app.main:app --host 0.0.0.0 --port 8001`

3. **Terminal 3 – Frontend**  
   Set `VITE_ILS_API_URL=http://localhost:8001` in `frontend/.env`, then `npm run dev`.

On the **Solver** page, choosing ILS will use the ILS backend; choosing HGS/ACO/GLS/SA will use the main backend. **Compare** runs all 5 algorithms in parallel: it calls the main backend’s `/solve/compare` (which starts HGS, GLS, ACO, SA), then starts an ILS job on the ILS backend when `VITE_ILS_API_URL` is set, then polls each job's status independently (`GET /results/{job_id}` per algo) and updates the table as each completes.

---

## Deploy: GitHub → VPS (Coolify) + Vercel (monorepo)

### 1. .gitignore check (before pushing to GitHub)

The repo has **two** `.gitignore` files:

| File | Purpose |
|------|--------|
| **Root `.gitignore`** | Python (`__pycache__`, venv, `.env`), backend venvs, `frontend/node_modules`, `frontend/dist`, RAG `backend/data/`, docs you may keep local. `HETZNER_VPS_MIGRATION_GUIDE.md` and `SUBDOMAIN_ARNOBMAHMUD_SETUP.md` are **no longer ignored** so you can commit them for deployment reference (optional: re-add those two lines to keep them local-only). |
| **`frontend/.gitignore`** | `node_modules`, `dist`, logs, IDE. Root already ignores `.env` repo-wide. |

There is **no** `backend/.gitignore`; root covers `backend/venv`, `backend/.env`, etc. You can add `backend/.gitignore` later if you want backend-specific entries.

Before first push, ensure no secrets are committed: `.env` and `.env.*` (except `.env.example`) are ignored. Double-check with `git status` and `git check-ignore -v backend/.env frontend/.env`.

---

### 2. Two backends: one Dockerfile, two Coolify applications

- **One Dockerfile** in `backend/Dockerfile` is enough. It uses **build arguments** to produce either the main backend image (pyvrp 0.6.3) or the ILS backend image (pyvrp 0.13+).
- **Two Coolify backend applications** (two separate “sites”/services):
  - **App 1 – Main API (HGS, ACO, GLS, SA):** Build from repo path `backend/`, Dockerfile `Dockerfile`. Build args: `REQUIREMENTS_FILE=requirements.txt`, `BACKEND_ALGOS=hgs,gls,aco,sa`. Container port **5000**. Env: `BACKEND_ALGOS=hgs,gls,aco,sa`, `DATASET_PATH=dataset`, `CORS_ORIGINS=https://your-app.vercel.app`, plus any API keys (Gemini, etc.).
  - **App 2 – ILS API:** Same repo, same `backend/` folder, same `Dockerfile`. Build args: `REQUIREMENTS_FILE=requirements-ils.txt`, `BACKEND_ALGOS=ils`, `INSTALL_RAG=0` (skip RAG to save image size; main API serves all AI). Container port **5000**. Env: `BACKEND_ALGOS=ils`, `DATASET_PATH=dataset`, `CORS_ORIGINS=https://your-app.vercel.app`.

So: **one Dockerfile**, **two Coolify apps** with different build args and env. Each app gets its own subdomain and Let’s Encrypt certificate.

---

### 3. Let’s Encrypt and subdomains (*.arnobmahmud.com)

Create **two A records** in IONOS (or your DNS) for **arnobmahmud.com**:

| Subdomain (hostname) | Type | Value |
|----------------------|------|--------|
| `vrptw-api` (or e.g. `vrptw-backend`) | A | Your VPS IP (e.g. 77.42.71.87) |
| `vrptw-ils` (or e.g. `vrptw-ils-backend`) | A | Same VPS IP |

So you get:

- **Main backend:** `https://vrptw-api.arnobmahmud.com` (or `https://vrptw-backend.arnobmahmud.com`)
- **ILS backend:** `https://vrptw-ils.arnobmahmud.com`

In Coolify, for **each** of the two backend applications:

1. Use the same Traefik/Caddy label pattern as in **SUBDOMAIN_ARNOBMAHMUD_SETUP.md** (two router pairs: sslip.io + `SUBDOMAIN.arnobmahmud.com`).
2. Replace `SUBDOMAIN` with `vrptw-api` for the main app and `vrptw-ils` for the ILS app.
3. Set `PORT=5000` (container port).
4. Use `traefik.http.routers.*.tls.certresolver=letsencrypt` so Let’s Encrypt issues certs for `vrptw-api.arnobmahmud.com` and `vrptw-ils.arnobmahmud.com`.

Coolify will assign each app its own sslip hostname; use the template from SUBDOMAIN_ARNOBMAHMUD_SETUP.md and plug in the correct `SSLP_HOST` per app.

---

### 4. Frontend on Vercel

1. Connect your GitHub repo (monorepo root). Set **Root Directory** to `frontend` (or build command to run from `frontend`).
2. Build command: `npm run build` (from `frontend`). Output directory: `dist`.
3. **Environment variables (build-time):**
   - `VITE_API_URL` = `https://vrptw-api.arnobmahmud.com` (main backend)
   - `VITE_ILS_API_URL` = `https://vrptw-ils.arnobmahmud.com` (ILS backend)

After deploy, your app URL will be something like `https://vrptw-solver.vercel.app`. Add that exact URL to **both** backends’ **CORS_ORIGINS** in Coolify:

- Main backend env: `CORS_ORIGINS=https://vrptw-solver.vercel.app`
- ILS backend env: `CORS_ORIGINS=https://vrptw-solver.vercel.app`

(If you use a custom domain on Vercel, add that too, comma-separated.)

---

### 5. Summary

| Item | What to do |
|------|------------|
| **GitHub** | Create repo (you do manually), push monorepo. Ensure .gitignore excludes .env and venvs. |
| **Dockerfile** | One: `backend/Dockerfile`. Build args: `REQUIREMENTS_FILE`, `BACKEND_ALGOS`. |
| **Coolify** | Two applications, both from same repo + `backend/Dockerfile`; different build args and env; container port 5000 each. |
| **Subdomains** | Two A records → VPS IP: e.g. `vrptw-api.arnobmahmud.com`, `vrptw-ils.arnobmahmud.com`. |
| **Let’s Encrypt** | Via Traefik labels (`certresolver=letsencrypt`) in Coolify for each app. |
| **Vercel** | One frontend; root `frontend`, set `VITE_API_URL` and `VITE_ILS_API_URL`; add Vercel URL to both backends’ `CORS_ORIGINS`. |
