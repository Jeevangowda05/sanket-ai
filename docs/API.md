# API

- `GET /health`
- `GET /api/v1/signs`
- `GET /api/v1/mudras`
- `POST /api/v1/predict`
- `WS /api/v1/live`
- `POST /api/v1/video/analyze`
- `GET /api/v1/video/{analysis_id}/status`
- `GET /api/v1/video/{analysis_id}/results`

Prediction endpoints return explicit model-unavailable status until valid weights are installed.

## Live WebSocket and prediction v1 payload

`POST /api/v1/predict` and `WS /api/v1/live` accept the same formal v1
feature contract. Frontend sends schema-v1 sequences (buffered window, ~10 Hz):

```json
{
  "type": "landmark_sequence",
  "context": "isl",
  "feature_version": "v1",
  "feature_count": 258,
  "sequence": [
    {
      "timestamp_ms": 1234,
      "feature_version": "v1",
      "feature_count": 258,
      "features": [0.01, -0.25]
    }
  ]
}
```

(`features` holds exactly 258 finite numbers per frame; shortened here.)

Validation rules (failures return `422` on REST, `type: error` on the socket):

- `feature_version` must be `"v1"` at top level and on every frame (must match).
- `feature_count` must be `258` at top level and on every frame (must match).
- `features` must hold exactly 258 finite numeric values (`NaN`/`Infinity` rejected).
- Normalized values must lie within `[-10, 10]`; pose visibility slots
  (indices 126, 130, 134, ... — every 4th slot of the pose block) within `[0, 1]`.
- `timestamp_ms` non-negative integers, monotonic non-decreasing per sequence.
- Sequence length 1–240 frames; `context` is `"isl"` or `"mudra"`.

Valid payloads are accepted and still reply `model-unavailable` until trained
weights are installed. The legacy `points`-based shape is no longer accepted.
