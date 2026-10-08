from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _write_test_video(path: Path, duration_seconds: int = 1, fps: int = 10) -> None:
    frame_size = (64, 64)
    writer = cv2.VideoWriter(
        str(path), cv2.VideoWriter_fourcc(*"mp4v"), fps, frame_size
    )
    total_frames = duration_seconds * fps
    for _ in range(total_frames):
        frame = np.zeros((64, 64, 3), dtype=np.uint8)
        writer.write(frame)
    writer.release()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_signs_catalog() -> None:
    response = client.get("/api/v1/signs")
    assert response.status_code == 200
    payload = response.json()
    assert payload["context"] == "isl"
    assert isinstance(payload["items"], list)


def test_predict_unavailable() -> None:
    body = {
        "context": "isl",
        "sequence": [
            {
                "timestamp_ms": 0,
                "points": [{"x": 0.1, "y": 0.2, "z": 0.0}],
            }
        ],
    }
    response = client.post("/api/v1/predict", json=body)
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "unavailable"


def test_video_validation_and_status(tmp_path: Path) -> None:
    test_video = tmp_path / "sample.mp4"
    _write_test_video(test_video)

    with test_video.open("rb") as handle:
        response = client.post(
            "/api/v1/video/analyze",
            files={"file": ("sample.mp4", handle, "video/mp4")},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "model_unavailable"

    status_response = client.get(f"/api/v1/video/{payload['analysis_id']}/status")
    assert status_response.status_code == 200
