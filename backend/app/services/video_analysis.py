from __future__ import annotations

import mimetypes
import os
import tempfile
import uuid
from pathlib import Path

import cv2
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

VIDEO_TASKS: dict[str, dict[str, str]] = {}


def _validate_extension(filename: str) -> None:
    extension = Path(filename).suffix.lower()
    if extension not in settings.allowed_video_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video extension '{extension}'.",
        )


def _validate_mime_type(file: UploadFile) -> None:
    mime = file.content_type or mimetypes.guess_type(file.filename or "")[0]
    if not mime or not mime.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a recognized video MIME type.",
        )


def _validate_file_size(size_bytes: int) -> None:
    if size_bytes > settings.max_video_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Video file exceeds max upload size of "
                f"{settings.max_video_upload_bytes // (1024 * 1024)} MB."
            ),
        )


def _validate_duration_seconds(path: str) -> None:
    capture = cv2.VideoCapture(path)
    try:
        if not capture.isOpened():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to open uploaded video for validation.",
            )
        frame_count = capture.get(cv2.CAP_PROP_FRAME_COUNT)
        fps = capture.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to determine video frame rate.",
            )
        duration = frame_count / fps
        if duration > settings.max_video_duration_seconds:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Video exceeds allowed duration of "
                    f"{settings.max_video_duration_seconds} seconds."
                ),
            )
    finally:
        capture.release()


def validate_uploaded_video(file: UploadFile) -> str:
    filename = file.filename or ""
    _validate_extension(filename)
    _validate_mime_type(file)

    suffix = Path(filename).suffix.lower() or ".mp4"
    fd, temp_path = tempfile.mkstemp(prefix="sanket-video-", suffix=suffix)
    os.close(fd)

    try:
        content = file.file.read()
        _validate_file_size(len(content))
        with open(temp_path, "wb") as temp_file:
            temp_file.write(content)
        _validate_duration_seconds(temp_path)
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise

    return temp_path


def queue_video_analysis(temp_video_path: str) -> tuple[str, dict[str, str]]:
    analysis_id = str(uuid.uuid4())
    VIDEO_TASKS[analysis_id] = {
        "status": "model_unavailable",
        "message": (
            "Video validated, but inference is unavailable until trained weights are installed."
        ),
        "temp_video_path": temp_video_path,
    }
    return analysis_id, VIDEO_TASKS[analysis_id]


def get_video_status(analysis_id: str) -> dict[str, str]:
    task = VIDEO_TASKS.get(analysis_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis ID not found.")
    return task


def cleanup_video_temp_file(analysis_id: str) -> None:
    task = VIDEO_TASKS.get(analysis_id)
    if not task:
        return
    path = task.get("temp_video_path")
    if path and os.path.exists(path):
        os.remove(path)
