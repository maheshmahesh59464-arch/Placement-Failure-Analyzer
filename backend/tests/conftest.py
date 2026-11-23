import os

os.environ.setdefault("SECRET_KEY", "test-only-secret-key-that-is-long-enough-123456")
os.environ.setdefault("ADMIN_EMAIL", "admin@example.test")
os.environ.setdefault("ADMIN_PASSWORD", "test-only-admin-password")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
