import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_interoperability_and_consent_enforcement():
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
        # 1. Login Citizen (Rahul Sharma)
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Test Attempt Without Consent (HTTP 403 CONSENT_REQUIRED)
        no_consent = await ac.post("/api/v1/data-requests", headers=headers, json={
            "consent_token": "cnt_token_invalid_fake_token_12345",
            "providing_department_id": "dept_revenue",
            "data_type": "INCOME_CERTIFICATE"
        })
        assert no_consent.status_code == 403
        assert "CONSENT_REQUIRED" in no_consent.json()["detail"]

        # 3. Create & Approve Active Consent Token
        c_req = await ac.post("/api/v1/consents", headers=headers, json={
            "requesting_department_id": "dept_industries",
            "providing_department_id": "dept_revenue",
            "service_id": "srv_ind_biz_license",
            "purpose": "Income verification for Business License",
            "requested_fields": ["annual_income", "certificate_no"],
            "valid_duration_hours": 24
        })
        consent_id = c_req.json()["id"]
        c_app = await ac.post(f"/api/v1/consents/{consent_id}/approve", headers=headers)
        valid_consent_token = c_app.json()["consent_token"]

        # 4. Execute Valid Inter-Department Data Exchange (Revenue -> MahaSetu -> Canonical Payload)
        data_ex = await ac.post("/api/v1/data-requests", headers=headers, json={
            "consent_token": valid_consent_token,
            "providing_department_id": "dept_revenue",
            "data_type": "INCOME_CERTIFICATE"
        })
        assert data_ex.status_code == 200
        ex_res = data_ex.json()
        assert ex_res["status"] == "SUCCESS"
        assert ex_res["providing_department_id"] == "dept_revenue"
        canonical = ex_res["canonical_payload"]
        assert canonical["certificate_number"] == "MH-REV-INC-2025-99821"
        assert canonical["annual_income"] == 450000.00
        assert canonical["verification_status"] == "VERIFIED_VALID"

        # 5. Revoke Consent & Verify Direct Re-attempt Fails (HTTP 403 CONSENT_REQUIRED)
        await ac.post(f"/api/v1/consents/{consent_id}/revoke", headers=headers)
        revoked_attempt = await ac.post("/api/v1/data-requests", headers=headers, json={
            "consent_token": valid_consent_token,
            "providing_department_id": "dept_revenue",
            "data_type": "INCOME_CERTIFICATE"
        })
        assert revoked_attempt.status_code == 403
        assert "CONSENT_REQUIRED" in revoked_attempt.json()["detail"]
