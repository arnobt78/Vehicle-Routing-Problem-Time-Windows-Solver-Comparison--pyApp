"""
Start uvicorn with log config that suppresses 404 access logs (bot probes).
Usage: python run_server.py  (or from backend: python run_server.py)
"""
import os

import uvicorn

from app.log_config import get_log_config


def main() -> None:
    # Local: default 8000 (avoids macOS port 5000). Production: set PORT=3000 in Coolify (e.g. 5004:3000).
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_config=get_log_config(),
    )


if __name__ == "__main__":
    main()
