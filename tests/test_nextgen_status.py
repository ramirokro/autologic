import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from nextgen_backend.main import app

client = TestClient(app)

def test_nextgen_status():
    resp = client.get('/api/status')
    assert resp.status_code == 200
    assert resp.json()['status'] == 'ok'

