"""
Logging config for uvicorn. Suppresses 404 access logs from bots/scanners
so production logs stay readable.
"""
import logging
import os


class Skip404AccessFilter(logging.Filter):
    """
    Drops access log records for 404 responses (bot probes, scanners).
    Set env LOG_404=1 to log 404s anyway (debugging).
    """

    def filter(self, record: logging.LogRecord) -> bool:
        if os.getenv("LOG_404", "").strip().lower() in ("1", "true", "yes"):
            return True
        msg = getattr(record, "msg", "") or ""
        if isinstance(msg, str) and " 404 " in msg:
            return False
        return True


def get_log_config() -> dict:
    """Uvicorn log_config: access log with 404 lines suppressed unless LOG_404=1."""
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(levelname)s:     %(message)s",
            },
            "access": {
                # uvicorn passes (client_addr, method, path, version, status) as msg % args
                "format": "%(levelname)s:     %(message)s",
            },
        },
        "filters": {
            "skip_404": {
                "()": "app.log_config.Skip404AccessFilter",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
            "access": {
                "formatter": "access",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
                "filters": ["skip_404"],
            },
        },
        "loggers": {
            "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
            "uvicorn.error": {"handlers": ["default"], "level": "INFO", "propagate": False},
            "uvicorn.access": {
                "handlers": ["access"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }
