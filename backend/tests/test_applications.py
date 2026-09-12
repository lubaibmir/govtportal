import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_applications_api():
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
        citizen_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {citizen_token}"}

        # 2. Submit Application for Business License
        sub_res = await ac.post("/api/v1/applications", headers=headers, json={
            "service_id": "srv_ind_biz_license",
            "department_id": "dept_industries",
            "application_data": {
                "enterprise_name": "Sharma Tech Enterprise",
                "category": "MICRO_SCALE",
                "annual_turnover": 450000.00
            }
        })
        assert sub_res.status_code == 201
        app_data = sub_res.json()
        assert "application_number" in app_data
        assert app_data["application_number"].startswith("MH-")
        app_number = app_data["application_number"]

        # 3. List Applications for Citizen
        list_res = await ac.get("/api/v1/applications", headers=headers)
        assert list_res.status_code == 200
        apps = list_res.json()
        assert len(apps) >= 1
        assert apps[0]["application_number"] == app_number

        # 4. Get Application Details by Number
        get_res = await ac.get(f"/api/v1/applications/{app_number}", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["application_data"]["enterprise_name"] == "Sharma Tech Enterprise"
