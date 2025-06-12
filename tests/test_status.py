import os
import sys
from fastapi.testclient import TestClient

os.environ.setdefault("SMARTCAR_CLIENT_ID", "dummy")
os.environ.setdefault("SMARTCAR_CLIENT_SECRET", "dummy")
os.environ.setdefault("SMARTCAR_REDIRECT_URI", "http://localhost")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app.main import app

client = TestClient(app)


def test_api_status_ok():
    os.environ["ANTHROPIC_API_KEY"] = "dummy"
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
