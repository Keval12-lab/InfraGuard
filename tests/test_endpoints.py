import sys
import os
import json

# Insert backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app import create_app

def test_endpoints():
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()

    # 1. Test /api/health
    response = client.get("/api/health")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "ok"
    assert "message" in data

    # 2. Test /api/version
    response = client.get("/api/version")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["version"] == "1.0.0"

    # 3. Test /api/system
    response = client.get("/api/system")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["database"] == "connected"
    assert "uptime_seconds" in data
    assert data["build"] == "production-ready-v1.0.0"

if __name__ == "__main__":
    test_endpoints()
    print("All python API diagnostics tests PASSED successfully!")
