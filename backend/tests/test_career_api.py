import os
os.environ.setdefault("DATABASE_URL", "sqlite:///./test-career.db")
from fastapi.testclient import TestClient
from app.main import app


def test_health_endpoint():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.headers.get("x-process-time-ms") is not None


def test_readiness_endpoint_checks_database():
    client = TestClient(app)
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "reachable"}


def test_career_workspace_requires_authentication():
    client = TestClient(app)
    response = client.get("/career/applications")
    assert response.status_code == 401
