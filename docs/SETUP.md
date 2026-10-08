# Setup

## Prerequisites

- Python 3.12, Node.js 22+, Docker (optional, for compose).

## Frontend (native)

1. `cd frontend`
2. Windows PowerShell: `Copy-Item .env.example .env.local` / macOS-Linux: `cp .env.example .env.local`
3. `npm install`
4. `npm run dev` (http://localhost:3000)
5. MediaPipe model URLs are empty by default, so the live page shows
   `MediaPipe Tasks model assets are required...` with tracker `unavailable`.
   To enable tracking, set in `frontend/.env.local`:
   `NEXT_PUBLIC_MEDIAPIPE_HAND_MODEL_URL`, `NEXT_PUBLIC_MEDIAPIPE_POSE_MODEL_URL`,
   `NEXT_PUBLIC_MEDIAPIPE_FACE_MODEL_URL` to HTTPS URLs or `/models/*.task`
   files placed under `frontend/public/models/`, then restart `npm run dev`.

## Backend (native, Windows PowerShell)

1. `python -m venv .venv`
2. `.\.venv\Scripts\Activate.ps1`
3. `pip install -r backend/requirements.txt`
4. `uvicorn app.main:app --app-dir backend --reload --port 8000`
5. Verify: `GET http://localhost:8000/health` returns `{"status":"ok"}`.
6. macOS-Linux equivalent: `python -m venv .venv && source .venv/bin/activate`.

Backend env is optional; `backend/.env.example` documents
`APP_ENV`, `BACKEND_PORT`, `FRONTEND_ORIGIN`, `MAX_VIDEO_DURATION_SECONDS`,
`MAX_VIDEO_UPLOAD_MB`. Defaults work without any env file.

## Docker (backend :8000 + frontend :3000)

1. `docker compose up --build`
2. Verify: frontend http://localhost:3000, backend http://localhost:8000/health.
3. Compose already sets `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_WS_URL`
   for the frontend container.
