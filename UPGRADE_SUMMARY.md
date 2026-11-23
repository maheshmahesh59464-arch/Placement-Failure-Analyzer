# Upgrade summary — Career Intelligence v2.0

## Preserved
- React 18 + Vite frontend and existing component structure.
- FastAPI backend and existing authentication endpoints.
- Existing resume and job-description upload routes.
- Existing analysis/history endpoints and admin dashboard.
- Existing SQLite-compatible database records.

## Added / upgraded
- Structured resume parsing with extraction confidence and skill-context evidence.
- Removed fabricated fallback values for education and projects.
- Optional OCR pipeline for scanned PDF resumes (explicit opt-in).
- Job-description required/preferred skill parsing.
- Explainable v2.0 compatibility analysis, score breakdown, requirement-level evidence and limitations.
- Optional locally cached Sentence Transformers embeddings; transparent token-overlap fallback.
- Skill-gap roadmap generation.
- Career Center frontend with application tracking, learning goals and interview practice.
- Career progress and application analytics APIs.
- New SQLAlchemy tables for applications, learning goals, interview sessions and progress snapshots.
- Additive database column migrations for existing SQLite/PostgreSQL installations.
- Docker Compose deployment with PostgreSQL, persistent volumes and Nginx reverse proxy.
- Additional tests and setup documentation.

## Important limitations
- The compatibility score is a heuristic estimate, not an official ATS score or hiring probability.
- Resume parsing cannot prove skills or practical competence.
- The legacy readiness score remains for API/database compatibility and is labelled as a resume-signal proxy only.
- The interview feedback uses a simple answer-structure rubric, not a validated AI interviewer.
- No hosted LLM provider is configured by default. The optional embedding model is only used when installed and cached locally.
- Frontend production build and full backend pytest suite could not be executed in this environment because package dependencies were unavailable. Python syntax compilation and isolated analysis/database smoke checks were performed.
