from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import logging
import time

from app.config import CORS_ORIGINS
from app.database import Base, engine, ensure_additive_migrations
from app.routers.auth import router as auth_router
from app.routers.resume import router as resume_router
from app.routers.jd import router as jd_router
from app.routers.analysis import router as analysis_router
from app.routers.history import router as history_router
from app.routers.career import router as career_router

# Retained for backwards compatibility with the existing SQLite project.
# Use Alembic migrations before making schema changes in production.
Base.metadata.create_all(bind=engine)
ensure_additive_migrations()

logger = logging.getLogger("placement_analyzer")

app = FastAPI(
    title="Placement Failure Analyzer API",
    description="Career intelligence, resume analysis and placement improvement platform",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(jd_router)
app.include_router(analysis_router)
app.include_router(history_router)
app.include_router(career_router)


@app.middleware("http")
async def request_observability(request, call_next):
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error: %s %s", request.method, request.url.path)
        raise
    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    logger.info("%s %s -> %s (%.2f ms)", request.method, request.url.path, response.status_code, elapsed_ms)
    response.headers["X-Process-Time-Ms"] = str(elapsed_ms)
    return response


@app.get("/")
def root():
    return {"status": "online", "system": "Placement Failure Analyzer API", "version": "2.0.0"}


@app.get("/health")
def health():
    """Liveness probe: confirms the API process is responding."""
    return {"status": "healthy", "service": "api"}


@app.get("/ready")
def ready():
    """Readiness probe: checks that the configured database can answer a query."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ready", "database": "reachable"}
    except Exception:
        logger.exception("Readiness check failed")
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database is unavailable")
