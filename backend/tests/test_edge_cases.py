import pytest
import datetime
from datetime import timezone, timedelta
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data
from app.db.models import Consent

@pytest.mark.asyncio
async def test_security_and_edge_case_hardening():
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
        
        # 1. Invalid JWT Bearer token returns HTTP 401
        bad_auth = await ac.get("/api/v1/auth/me", headers={"Authorization": "Bearer INVALID_JWT_TOKEN"})
        assert bad_auth.status_code == 401

        # 2. Citizen login
        cit_login = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        cit_token = cit_login.json()["access_token"]
        cit_headers = {"Authorization": f"Bearer {cit_token}"}

        # 3. Data Exchange without valid consent token returns HTTP 403 CONSENT_REQUIRED
        bad_data_req = await ac.post("/api/v1/data-requests", headers=cit_headers, json={
            "consent_token": "cnt_token_INVALID_12345",
            "providing_department_id": "dept_revenue",
            "data_type": "INCOME_CERTIFICATE"
        })
        assert bad_data_req.status_code == 403
        assert "CONSENT_REQUIRED" in bad_data_req.json()["detail"]

        # 4. Create consent request
        c_req = await ac.post("/api/v1/consents", headers=cit_headers, json={
            "requesting_department_id": "dept_industries",
            "providing_department_id": "dept_revenue",
            "service_id": "srv_ind_biz_license",
            "purpose": "Test Edge Cases",
            "requested_fields": ["annual_income"],
            "valid_duration_hours": 24
        })
        assert c_req.status_code == 201
        c_id = c_req.json()["id"]

        # 5. Approve consent
        appr = await ac.post(f"/api/v1/consents/{c_id}/approve", headers=cit_headers)
        assert appr.status_code == 200
        consent_token = appr.json()["consent_token"]

        # 6. Scope mismatch e.g. token is for dept_revenue, but data_request asks for dept_education
        scope_mismatch = await ac.post("/api/v1/data-requests", headers=cit_headers, json={
            "consent_token": consent_token,
            "providing_department_id": "dept_education",
            "data_type": "DEGREE_VERIFICATION"
        })
        assert scope_mismatch.status_code == 403
        assert "CONSENT_SCOPE_MISMATCH" in scope_mismatch.json()["detail"]

        # 7. Valid Data Exchange for dept_revenue succeeds
        valid_ex = await ac.post("/api/v1/data-requests", headers=cit_headers, json={
            "consent_token": consent_token,
            "providing_department_id": "dept_revenue",
            "data_type": "INCOME_CERTIFICATE"
        })
        assert valid_ex.status_code == 200
        assert valid_ex.json()["status"] == "SUCCESS"

        # 8. Expired Consent Token test
        # Manually expire consent in DB
        db_gen2 = app.dependency_overrides[get_db]()
        sess2 = await db_gen2.__anext__()
        try:
            consent_obj = await sess2.get(Consent, c_id)
            if consent_obj:
                consent_obj.expires_at = datetime.datetime.now(timezone.utc) - timedelta(hours=5)
                await sess2.commit()
        finally:
            try:
                await db_gen2.__anext__()
            except StopAsyncIteration:
                pass

        expired_req = await ac.post("/api/v1/data-requests", headers=cit_headers, json={
            "consent_token": consent_token,
            "providing_department_id": "dept_revenue",
            "data_type": "INCOME_CERTIFICATE"
        })
        assert expired_req.status_code == 403
        assert "CONSENT_EXPIRED" in expired_req.json()["detail"]

        # 9. Non-existent application tracking returns HTTP 404
        non_exist = await ac.get("/api/v1/applications/track/MH-0000-000000")
        assert non_exist.status_code == 404
