# VRPTW Solver backend — one image for main (HGS/ACO/GLS/SA) or ILS.
# Build with different args to get either pyvrp 0.6.3 (main) or pyvrp 0.13+ (ILS).
# Coolify: App 1 build args REQUIREMENTS_FILE=requirements.txt BACKEND_ALGOS=hgs,gls,aco,sa
#         App 2 build args REQUIREMENTS_FILE=requirements-ils.txt BACKEND_ALGOS=ils
FROM python:3.12-slim

WORKDIR /app

# Install system deps: gcc/g++ for building pyvrp from source (C++ extension)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt requirements-ils.txt ./

# Install the chosen requirements (default: main backend). Build with --build-arg REQUIREMENTS_FILE=requirements-ils.txt for ILS.
ARG REQUIREMENTS_FILE=requirements.txt
RUN pip install --no-cache-dir -r ${REQUIREMENTS_FILE}

COPY . .

# Expose port (Coolify/Traefik will map to container port 5000)
EXPOSE 5000

ARG BACKEND_ALGOS=hgs,gls,aco,sa
ENV BACKEND_ALGOS=${BACKEND_ALGOS}
# Optional: set in Coolify env instead
# ENV DATASET_PATH=dataset
# ENV DEFAULT_RUNTIME=120

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
