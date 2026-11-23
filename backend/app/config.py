"""Environment-backed application configuration.

Set values in the process environment or in backend/.env. Never commit .env.
"""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
except ImportError:
    pass


def _required_secret() -> str:
    value = os.getenv("SECRET_KEY", "").strip()
    if len(value) < 32 or value.startswith("REPLACE_"):
        raise RuntimeError(
            "SECRET_KEY must be set to a random value of at least 32 characters. "
            "Copy .env.example to .env and generate a new secret."
        )
    return value


SECRET_KEY = _required_secret()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
ADMIN_NAME = os.getenv("ADMIN_NAME", "Platform Administrator").strip()
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "").strip().lower()
if ADMIN_EMAIL == "admin@example.com":
    ADMIN_EMAIL = ""
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
if ADMIN_PASSWORD.startswith("REPLACE_") or len(ADMIN_PASSWORD) < 16:
    ADMIN_PASSWORD = ""
MAX_RESUME_SIZE_BYTES = int(os.getenv("MAX_RESUME_SIZE_BYTES", str(10 * 1024 * 1024)))
if MAX_RESUME_SIZE_BYTES <= 0:
    raise RuntimeError("MAX_RESUME_SIZE_BYTES must be a positive integer")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/resumes")
CORS_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

if not CORS_ORIGINS or "*" in CORS_ORIGINS:
    raise RuntimeError("CORS_ORIGINS must list explicit frontend origins; wildcard origins are not allowed")
if ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
    raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be positive")

ENABLE_OCR = os.getenv("ENABLE_OCR", "false").lower() == "true"
