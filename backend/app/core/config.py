import os

from pydantic import BaseModel


def _get_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def _get_cors_origins() -> list[str]:
    raw = os.getenv("FRONTEND_ORIGIN", "")
    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    if not raw.strip():
        return defaults
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    # Keep localhost defaults so local dev keeps working when an extra origin is set.
    for fallback in defaults:
        if fallback not in origins:
            origins.append(fallback)
    return origins


class Settings(BaseModel):
    app_name: str = "SANKET AI API"
    app_version: str = "0.1.0"
    app_env: str = os.getenv("APP_ENV", "development")
    backend_port: int = _get_int("BACKEND_PORT", 8000)
    max_video_duration_seconds: int = _get_int("MAX_VIDEO_DURATION_SECONDS", 30)
    max_video_upload_bytes: int = (
        _get_int("MAX_VIDEO_UPLOAD_MB", 25) * 1024 * 1024
    )
    allowed_video_extensions: set[str] = {".mp4", ".mov", ".avi", ".mkv"}
    cors_origins: list[str] = _get_cors_origins()


settings = Settings()
