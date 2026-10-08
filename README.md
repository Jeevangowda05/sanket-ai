# SANKET AI

**From Signs to Speech**

SANKET AI is a single-platform prototype foundation for selected Indian Sign Language (ISL) recognition to text/speech, with selected mudra interpretation as a secondary context on the same human-movement pipeline.

## Milestone status (implemented)

- Monorepo structure (`frontend/`, `backend/`, `ml/`, `data/`, `configs/`, `scripts/`, `docs/`, `models/`)
- Next.js + TypeScript + Tailwind frontend with routes: `/`, `/live`, `/video`, `/history`, `/about`
- Reusable UI components for system status, context mode, confidence, detection cards/timeline, speech controls, and empty/loading/error states
- Browser camera access and control hook with privacy notice and model-asset boundary
- Browser SpeechSynthesis abstraction (speak/pause/cancel/voices)
- Reconnect-safe WebSocket hook sending normalized landmark sequences only
- FastAPI backend versioned endpoints and websocket with model-unavailable behavior
- Video upload validation boundaries (extension/MIME/size/30-second duration via OpenCV)
- ML package: base temporal model, TCN, Transformer skeleton, preprocessing and postprocessing utilities, explicit unavailable model loader
- Structured JSON files for labels, mudras, phrase templates using pending-verification semantics
- Script scaffolds for collection/training/evaluation/export that fail clearly without real data

## Honest limitations in this milestone

- No trained model weights are bundled.
- No fabricated predictions, datasets, or metrics are produced.
- Cultural meanings are not claimed when verification sources are missing.
- MediaPipe Tasks assets are not bundled in this repository yet.

## Local run instructions

### 1) Frontend

```bash
cd /home/runner/work/sanket-ai/sanket-ai/frontend
cp .env.example .env.local
npm install
npm run dev
```

### 2) Backend

```bash
cd /home/runner/work/sanket-ai/sanket-ai
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload
```

### 3) ML tests

```bash
cd /home/runner/work/sanket-ai/sanket-ai
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
