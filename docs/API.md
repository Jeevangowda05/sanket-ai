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
