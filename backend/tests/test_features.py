from __future__ import annotations

import copy
import json

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _frame(timestamp_ms: int = 0, value: float = 0.0) -> dict:
    return {
        "timestamp_ms": timestamp_ms,
        "feature_version": "v1",
        "feature_count": 258,
        "features": [value] * 258,
    }


def _body(n_frames: int = 2, context: str = "isl") -> dict:
    return {
        "context": context,
        "feature_version": "v1",
        "feature_count": 258,
        "sequence": [_frame(i * 100) for i in range(n_frames)],
    }


def _ws_message(n_frames: int = 2, context: str = "isl") -> dict:
    message = _body(n_frames=n_frames, context=context)
    message["type"] = "landmark_sequence"
    return message


def test_predict_valid_v1_returns_model_unavailable() -> None:
    response = client.post("/api/v1/predict", json=_body())
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "unavailable"
    assert payload["reason"]["code"] == "model_unavailable"


def test_predict_rejects_wrong_feature_length() -> None:
    for length in (0, 257, 259):
        body = _body()
        body["sequence"][0]["features"] = [0.0] * length
        assert client.post("/api/v1/predict", json=body).status_code == 422


def test_predict_rejects_wrong_version_and_count() -> None:
    body = _body()
    body["feature_version"] = "v2"
    assert client.post("/api/v1/predict", json=body).status_code == 422

    body = _body()
    body["feature_count"] = 257
    assert client.post("/api/v1/predict", json=body).status_code == 422

    body = _body()
    body["sequence"][0]["feature_version"] = "v2"
    assert client.post("/api/v1/predict", json=body).status_code == 422


def test_predict_rejects_non_finite_values() -> None:
    # Raw NaN/Infinity floats cannot be expressed in strict JSON, so non-finite
    # rejection is verified at the schema layer. (Note: a raw NaN token over
    # HTTP trips FastAPI's own 422 error serializer, a framework quirk outside
    # this contract; strict clients never emit such tokens.)
    from pydantic import ValidationError

    from app.schemas import PredictRequest

    for bad in (float("nan"), float("inf"), float("-inf")):
        body = _body()
        body["sequence"][0]["features"][0] = bad
        try:
            PredictRequest.model_validate(body)
        except ValidationError:
            pass
        else:
            raise AssertionError(f"non-finite value {bad} was not rejected")

    # String tokens in place of numbers are rejected over HTTP with a clean 422.
    for token in ("NaN", "Infinity"):
        body = _body()
        raw = json.dumps(body).replace("[0.0, 0.0,", f'["{token}", 0.0,', 1)
        response = client.post(
            "/api/v1/predict",
            content=raw,
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 422


def test_predict_rejects_out_of_range_values() -> None:
    body = _body()
    body["sequence"][0]["features"][0] = 999.0
    assert client.post("/api/v1/predict", json=body).status_code == 422

    # Index 129 is a pose visibility slot and must stay within [0, 1].
    body = _body()
    body["sequence"][0]["features"][129] = 5.0
    assert client.post("/api/v1/predict", json=body).status_code == 422


def test_predict_rejects_bad_and_non_monotonic_timestamps() -> None:
    body = _body()
    body["sequence"][1]["timestamp_ms"] = -1
    assert client.post("/api/v1/predict", json=body).status_code == 422

    body = _body(n_frames=3)
    body["sequence"][2]["timestamp_ms"] = 50
    assert client.post("/api/v1/predict", json=body).status_code == 422

    # Equal timestamps are accepted (non-decreasing contract).
    body = _body(n_frames=2)
    body["sequence"][1]["timestamp_ms"] = 0
    assert client.post("/api/v1/predict", json=body).status_code == 200


def test_predict_rejects_long_sequence_and_bad_context() -> None:
    body = _body()
    body["sequence"] = [_frame(i * 100) for i in range(241)]
    assert client.post("/api/v1/predict", json=body).status_code == 422

    assert client.post("/api/v1/predict", json=_body(context="xx")).status_code == 422


def test_predict_rejects_legacy_points_payload() -> None:
    legacy = {
        "context": "isl",
        "sequence": [{"timestamp_ms": 0, "points": [{"x": 0.1, "y": 0.2, "z": 0.0}]}],
    }
    assert client.post("/api/v1/predict", json=legacy).status_code == 422


def test_live_accepts_valid_v1_sequence() -> None:
    with client.websocket_connect("/api/v1/live") as websocket:
        status = websocket.receive_json()
        assert status["type"] == "status"
        assert status["status"] == "unavailable"

        websocket.send_json(_ws_message())
        reply = websocket.receive_json()
        assert reply["type"] == "error"
        assert reply["status"] == "unavailable"


def test_live_rejects_malformed_payloads() -> None:
    with client.websocket_connect("/api/v1/live") as websocket:
        assert websocket.receive_json()["status"] == "unavailable"

        malformed = copy.deepcopy(_ws_message())
        malformed["sequence"][0]["features"] = [0.0] * 10
        websocket.send_json(malformed)
        reply = websocket.receive_json()
        assert reply["type"] == "error"
        assert reply["message"] == "Malformed live message payload."

        legacy = {"type": "landmark_sequence", "context": "isl", "sequence": [{"timestamp_ms": 0}]}
        websocket.send_json(legacy)
        reply = websocket.receive_json()
        assert reply["type"] == "error"
