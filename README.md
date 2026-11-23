# Placement Failure Analyzer — Career Intelligence Platform

Python 3.15-compatible incremental upgrade of the existing React + FastAPI project. Existing authentication, resume upload, job-description upload, analysis history and admin dashboard are retained.

## Capabilities

- JWT-based user and environment-configured administrator authentication.
- Private PDF resume upload with extension, signature and size checks.
- Structured resume extraction with skill evidence and extraction confidence.
- Job-description parsing with required/preferred skill separation.
- Explainable resume-to-role compatibility scoring (scoring version 2.0).
- Optional local Sentence Transformers embeddings; otherwise a clearly identified token-overlap fallback is used.
- Personalized skill-gap roadmap, application tracker, learning goals API, interview practice prompts and career analytics, including note-based rejection categories and offer-rate summaries.
- Liveness and database-readiness probes (`/health`, `/ready`) plus structured request timing logs and an `X-Process-Time-Ms` response header.
- User-scoped records and additive SQLite schema upgrades.

**Important product limitation:** This app does not predict hiring outcomes, certify ATS scores, or measure practical competence from a resume. The compatibility score is a heuristic signal. The legacy readiness field is retained only for backward compatibility and is explicitly labelled as a resume-signal proxy. Practical readiness needs separately validated coding, project and interview assessments.

## Requirements

- Python 3.15 (CPython)
- Node.js 20+
- Backend packages in `backend/app/requirements.txt`

Optional local embedding model:

```bash
pip install -r requirements-ai.txt
```

The model is loaded only if it is already available in the local Hugging Face cache; no automatic model download occurs. To download it intentionally once, run `python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"`. Without it, a token-overlap fallback is used.

Optional OCR:

```bash
pip install -r requirements-ocr.txt
```

Install the system Poppler and Tesseract binaries, then set `ENABLE_OCR=true`. OCR is off by default.

## Python 3.15 on Windows

Use CPython 3.15 (standard GIL build, not the free-threaded `3.15t` build).
From PowerShell in the project root:

```powershell
cd backend
py -3.15 --version
py -3.15 -m venv venv
.\\venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
pip install --only-binary=pydantic-core -r app/requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

The `pydantic-core` binary wheel is important on Windows: it avoids compiling the Rust extension locally. If pip still tries to build it from source, check that `python --version` reports CPython 3.15 (not a free-threaded build), and that pip is up to date.

## Local development

1. `cd backend`
2. Copy `.env.example` to `.env`.
3. Generate `SECRET_KEY` with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
4. Set a unique administrator email and password (at least 16 characters). Never commit `.env`.
5. `pip install -r app/requirements.txt`
6. `uvicorn app.main:app --reload`
7. In another terminal: `cd frontend && npm ci && npm run dev`
8. Open `http://localhost:5173`.

## Docker

Create the root `.env` from `.env.example` and set a strong `POSTGRES_PASSWORD`. Create `backend/.env` from `backend/.env.example`, set `SECRET_KEY`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD`, then run `docker compose up --build`. Open `http://localhost:8080`. PostgreSQL data and uploaded resumes are stored in named Docker volumes.

## Tests

From `backend/`:

```bash
pip install -r app/requirements.txt -r requirements-dev.txt
python -m pytest -q
```

From `frontend/`:

```bash
npm ci
npm run build
```

## New API routes

All `/career/*` routes require `Authorization: Bearer <access_token>`.

- `GET /career/roadmap`
- `GET /career/progress`
- `GET /career/analytics/overview`
- `GET|POST /career/applications`
- `PATCH|DELETE /career/applications/{application_id}`
- `GET|POST /career/goals`
- `PATCH /career/goals/{goal_id}`
- `POST /career/interviews/start`
- `POST /career/interviews/{session_id}/answer`

## Security and deployment notes

- Configure explicit `CORS_ORIGINS` for the deployed frontend.
- Use HTTPS in production and a high-entropy unique `SECRET_KEY`.
- Keep resumes and the SQLite/PostgreSQL database out of public web roots and source control.
- Back up the database and upload volume; define retention/deletion rules for personal data.
- Browser token storage is retained for compatibility with the original client. For a public production deployment, migrate to Secure, HttpOnly, SameSite cookies and add CSRF protections.
- SQLite changes are additive and safe for the new fields. Docker Compose uses PostgreSQL; local development defaults to SQLite. Use Alembic migrations before future production schema changes. The current startup uses SQLAlchemy `create_all` plus small additive SQLite/PostgreSQL migrations to preserve the legacy project database.
- The current interview feedback is a lightweight response-structure rubric, not an LLM evaluator or validated interview score. The career roadmap is rule-guided from detected gaps; a hosted generative-AI coach is not configured by default. Rejection categories are keyword summaries of notes the user entered; they are not verified employer feedback. The optional embedding model only activates when its model files are already cached locally.
