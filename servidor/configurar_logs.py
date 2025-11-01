import logging
from logging.config import dictConfig

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,  # mantiene los de uvicorn y fastapi

    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },

    "handlers": {
        # --- Consola ---
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "INFO",
        },

        # --- Archivo principal ---
        "file_app": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 5_000_000,    # 5 MB por archivo
            "backupCount": 3,         # conserva 3 copias antiguas
            "formatter": "default",
            "level": "INFO",
            "encoding": "utf-8",
        },

        # --- Archivo de errores ---
        "file_error": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/errors.log",
            "maxBytes": 5_000_000,
            "backupCount": 5,
            "formatter": "default",
            "level": "ERROR",
            "encoding": "utf-8",
        },
    },

    "root": {
        "handlers": ["console", "file_app", "file_error"],
        "level": "INFO",
    },

    "loggers": {
        # uvicorn usa estos loggers; los dejamos propagar al root
        "uvicorn.error": {"propagate": True},
        "uvicorn.access": {"propagate": False},
    },
}


def configurar_logs():
    """Configura logging global para FastAPI/Uvicorn + app propia."""
    import os
    os.makedirs("logs", exist_ok=True)
    dictConfig(LOGGING_CONFIG)
    logging.getLogger("configurar_logs").info("🟢 Logging configurado correctamente")
