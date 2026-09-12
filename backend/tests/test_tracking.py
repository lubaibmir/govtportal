import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_unified_application_tracking():
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
        # 1. Citizen login
        cit_login = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        cit_token = cit_login.json()["access_token"]
        cit_headers = {"Authorization": f"Bearer {cit_token}"}

        # 2. Submit application
        sub_res = await ac.post("/api/v1/applications", headers=cit_headers, json={
            "service_id": "srv_ind_biz_license",
            "department_id": "dept_industries",
            "application_data": {
                "enterprise_name": "Sharma Tech",
                "income_certificate_number": "REV-2026-994821"
            }
        })
        assert sub_res.status_code == 201
        app_num = sub_res.json()["application_number"]

        # 3. Track application publicly by tracking number
        track_res = await ac.get(f"/api/v1/applications/track/{app_num}")
        assert track_res.status_code == 200
        track_data = track_res.json()
        assert track_data["application_number"] == app_num
        assert track_data["status"] == "SUBMITTED"
        assert track_data["service_title"] == "Small Scale Business License"
        assert track_data["department_name"] == "Industries Department"
        assert len(track_data["events"]) >= 1
        assert track_data["events"][0]["event_type"] == "APPLICATION_CREATED"

        # 4. Non-existent application tracking returns HTTP 404
        bad_track = await ac.get("/api/v1/applications/track/MH-9999-000000")
        assert bad_track.status_code == 404
