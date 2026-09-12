import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_consent_engine_flow():
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
        # 1. Login as Citizen (Rahul Sharma)
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Consent Request (Revenue -> Industries for Business License)
        create_res = await ac.post("/api/v1/consents", headers=headers, json={
            "requesting_department_id": "dept_industries",
            "providing_department_id": "dept_revenue",
            "service_id": "srv_ind_biz_license",
            "purpose": "Income verification for Small Scale Business License application",
            "requested_fields": ["annual_income", "certificate_no", "validity_until"],
            "valid_duration_hours": 24
        })
        assert create_res.status_code == 201
        consent_data = create_res.json()
        assert consent_data["status"] == "PENDING"
        consent_id = consent_data["id"]

        # 3. Approve Consent Request
        approve_res = await ac.post(f"/api/v1/consents/{consent_id}/approve", headers=headers)
        assert approve_res.status_code == 200
        approved_data = approve_res.json()
        assert approved_data["status"] == "ACTIVE"
        assert approved_data["consent_token"] is not None
        assert approved_data["consent_token"].startswith("cnt_token_")

        # 4. List Consents for Citizen
        list_res = await ac.get("/api/v1/consents", headers=headers)
        assert list_res.status_code == 200
        consents = list_res.json()
        assert len(consents) >= 1
        assert consents[0]["id"] == consent_id

        # 5. Revoke Active Consent
        revoke_res = await ac.post(f"/api/v1/consents/{consent_id}/revoke", headers=headers)
        assert revoke_res.status_code == 200
        assert revoke_res.json()["status"] == "REVOKED"
