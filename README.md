# SANKET AI

**From Signs to Speech**

SANKET AI is a single-platform prototype foundation for selected Indian Sign Language (ISL) recognition to text/speech, with selected mudra interpretation as a secondary context on the same human-movement pipeline.

## Milestone status (implemented)

- Monorepo structure (`frontend/`, `backend/`, `ml/`, `data/`, `configs/`, `scripts/`, `docs/`, `models/`)
- Next.js + TypeScript + Tailwind frontend with routes: `/`, `/live`, `/video`, `/history`, `/about`
- Reusable UI components for system status, context mode, confidence, detection cards/timeline, speech controls, and empty/loading/error states
- Browser camera access and control hook with privacy notice and model-asset boundary
- Browser SpeechSynthesis abstraction (speak/pause/cancel/voices)
- Reconnect-safe WebSocket hook sending normalized v1 landmark sequences only
- Browser MediaPipe Tasks tracking (`@mediapipe/tasks-vision`): hand/pose/face landmarkers, subtle canvas overlay, v1 feature schema (258/frame, face excluded), rolling 45-frame buffer sending 30-frame windows at ~10 Hz, tracker states unavailable/loading/ready/processing/error/stopped
- FastAPI backend versioned endpoints and websocket with model-unavailable behavior
- Video upload validation boundaries (extension/MIME/size/30-second duration via OpenCV)
- ML package: base temporal model, TCN, Transformer skeleton, preprocessing and postprocessing utilities, explicit unavailable model loader
- Structured JSON files for labels, mudras, phrase templates using pending-verification semantics
- Script scaffolds for collection/training/evaluation/export that fail clearly without real data

## Honest limitations in this milestone

- No trained model weights are bundled.
- No fabricated predictions, datasets, or metrics are produced.
- Cultural meanings are not claimed when verification sources are missing.
- MediaPipe Tasks assets are not bundled in this repository yet (configure `NEXT_PUBLIC_MEDIAPIPE_*_MODEL_URL` or place `.task` files under `frontend/public/models/`; tracker stays `unavailable` until then).

## Local run instructions

### 1) Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Windows PowerShell: use `Copy-Item .env.example .env.local` instead of `cp`.

### 2) Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Windows PowerShell: use `.\.venv\Scripts\Activate.ps1` instead of `source`.

### 3) ML tests

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt
PYTHONPATH=ml pytest ml/tests -q
```

### Optional orchestration

```bash
docker compose up
```

## Checks used in this milestone

- Frontend type/lint/build checks (Next.js)
- Backend API tests (pytest)
- ML utility/model tests (pytest)

See `/docs` for architecture, API, scope, privacy, and roadmap.
