import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_audit_logs_and_security_headers():
    db_gen = app.dependency_overrides[get_db]()
    session = await db_gen.__anext__()
    try:
        await seed_data(session=session)
    finally:
        try:
            await db_gen.__anext__()
        except StopAsyncIteration:
            pass

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Verify Security Headers on health endpoint
        health_res = await ac.get("/api/v1/health")
        assert health_res.status_code == 200
        assert health_res.headers.get("X-Frame-Options") == "DENY"
        assert health_res.headers.get("X-Content-Type-Options") == "nosniff"

        # 2. Login Citizen (generates USER_LOGIN audit log)
        cit_login = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert cit_login.status_code == 200
        cit_token = cit_login.json()["access_token"]
        cit_headers = {"Authorization": f"Bearer {cit_token}"}

        # 3. Citizen attempts to fetch audit logs (Should fail with HTTP 403 FORBIDDEN - RBAC protected)
        unauth_audit = await ac.get("/api/v1/audit-logs", headers=cit_headers)
        assert unauth_audit.status_code == 403

        # 4. Login System Admin
        admin_login = await ac.post("/api/v1/auth/login", json={
            "email": "admin.mahagov@example.gov.in",
            "password": "Password@123"
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 5. System Admin fetches audit logs
        audit_res = await ac.get("/api/v1/audit-logs", headers=admin_headers)
        assert audit_res.status_code == 200
        logs = audit_res.json()
        assert len(logs) >= 1
        actions = [l["action"] for l in logs]
        assert "USER_LOGIN" in actions
