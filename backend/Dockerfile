# VRPTW Solver backend — one image for main (HGS/ACO/GLS/SA) or ILS.
# Build with different args to get either pyvrp 0.6.3 (main) or pyvrp 0.13+ (ILS).
# Coolify: App 1 (vrptw-api) build args REQUIREMENTS_FILE=requirements.txt BACKEND_ALGOS=hgs,gls,aco,sa (INSTALL_RAG=1 default)
#         App 2 (vrptw-ils) build args REQUIREMENTS_FILE=requirements-ils.txt BACKEND_ALGOS=ils INSTALL_RAG=0
FROM python:3.12-slim

WORKDIR /app

# Install system deps: gcc/g++ for building pyvrp from source (C++ extension)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt requirements-ils.txt requirements-rag.txt ./

# Install the chosen requirements (default: main backend). Build with --build-arg REQUIREMENTS_FILE=requirements-ils.txt for ILS.
ARG REQUIREMENTS_FILE=requirements.txt
RUN pip install --no-cache-dir -r ${REQUIREMENTS_FILE}

# RAG (AI assistant) only on main API; skip for ILS to save image size and memory (frontend uses main API for all AI).
ARG INSTALL_RAG=1
RUN if [ "$INSTALL_RAG" = "1" ]; then pip install --no-cache-dir -r requirements-rag.txt; fi

COPY . .

# Expose port (Coolify: set PORT=3000, map e.g. 5004:3000)
EXPOSE 3000

ARG BACKEND_ALGOS=hgs,gls,aco,sa
ENV BACKEND_ALGOS=${BACKEND_ALGOS}
# Optional: set in Coolify env instead
# ENV DATASET_PATH=dataset
# ENV DEFAULT_RUNTIME=120

# run_server.py uses log_config to suppress 404 access logs (bot probes)
CMD ["python", "run_server.py"]
