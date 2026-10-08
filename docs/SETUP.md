# Setup

## Frontend
1. `cd frontend`
2. `cp .env.example .env.local`
3. `npm install`
4. `npm run dev`

## Backend
1. `python -m venv .venv && source .venv/bin/activate`
2. `pip install -r backend/requirements.txt`
3. `uvicorn app.main:app --app-dir backend --reload`
