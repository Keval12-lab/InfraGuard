import sys
import os
import json

# Insert backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

# pyrefly: ignore [missing-import]
from app import create_app

def test_endpoints():
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()

    # 1. Test /api/health
    response = client.get("/api/health")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["version"] == "1.0.0"
    assert "uptime" in data
    assert "environment" in data

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

    # 4. Security Audit Test: Auth Login with PBKDF2 Hash
    response = client.post("/api/v1/auth/login", json={"email": "admin@infraguard.local", "password": "AdminPassword123!"})
    assert response.status_code == 200
    admin_data = json.loads(response.data)
    admin_token = admin_data["token"]
    assert admin_data["user"]["role"] == "Admin"

    # 5. Security Audit Test: Unauthenticated Call (Expect 401)
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

    # 6. Security Audit Test: Authenticated /me Call (Expect 200)
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200

    # 7. Security Audit Test: Invalid Signature Token (Expect 401)
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.signature.token"})
    assert response.status_code == 401

    # 8. Security Audit Test: Technician Role RBAC Blocking (Expect 403)
    tech_resp = client.post("/api/v1/auth/login", json={"email": "tech@infraguard.local", "password": "TechPassword123!"})
    tech_token = json.loads(tech_resp.data)["token"]
    response = client.get("/api/v1/auth/admin-only", headers={"Authorization": f"Bearer {tech_token}"})
    assert response.status_code == 403

    # 9. Security Audit Test: Admin Role Access Granted (Expect 200)
    response = client.get("/api/v1/auth/admin-only", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200

    # 10. Security Audit Test: Logout Token Revocation (Expect 401 on reuse)
    client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {tech_token}"})
    reused_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tech_token}"})
    assert reused_resp.status_code == 401

if __name__ == "__main__":
    test_endpoints()
    print("All python API diagnostics tests & SECURITY AUDIT CHECKS PASSED successfully!")
