from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "SANKET AI API"
    app_version: str = "0.1.0"
    max_video_duration_seconds: int = 30
    max_video_upload_bytes: int = 25 * 1024 * 1024
    allowed_video_extensions: set[str] = {".mp4", ".mov", ".avi", ".mkv"}
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
