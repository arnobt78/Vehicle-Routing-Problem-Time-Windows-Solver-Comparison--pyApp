"""
Start uvicorn with log config that suppresses 404 access logs (bot probes).
Usage: python run_server.py  (or from backend: python run_server.py)
"""
import os

import uvicorn

from app.log_config import get_log_config


def main() -> None:
    port = int(os.getenv("PORT", "5000"))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_config=get_log_config(),
    )


if __name__ == "__main__":
    main()
