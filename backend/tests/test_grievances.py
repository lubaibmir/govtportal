import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_grievances_flow():
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
        # 1. Login as Citizen
        res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert res.status_code == 200
        citizen_token = res.json()["access_token"]
        citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

        # 2. Login as Industries Officer
        res = await ac.post("/api/v1/auth/login", json={
            "email": "officer.industries@example.gov.in",
            "password": "Password@123"
        })
        assert res.status_code == 200
        officer_token = res.json()["access_token"]
        officer_headers = {"Authorization": f"Bearer {officer_token}"}

        # 3. Citizen raises grievance
        create_res = await ac.post("/api/v1/grievances", headers=citizen_headers, json={
            "department_id": "dept_industries",
            "category": "DELAYED_PROCESSING",
            "description": "My license application is pending verification for more than 5 days."
        })
        assert create_res.status_code == 201
        grv_data = create_res.json()
        assert grv_data["grievance_number"].startswith("GRV-")
        assert grv_data["status"] == "OPEN"
        grv_id = grv_data["id"]

        # 4. Officer lists grievances (sees it)
        list_res = await ac.get("/api/v1/grievances", headers=officer_headers)
        assert list_res.status_code == 200
        grv_list = list_res.json()
        assert any(g["id"] == grv_id for g in grv_list)

        # 5. Officer resolves grievance
        patch_res = await ac.patch(f"/api/v1/grievances/{grv_id}", headers=officer_headers, json={
            "status": "RESOLVED",
            "resolution_notes": "Application fast-tracked after document cross-verification completed."
        })
        assert patch_res.status_code == 200
        updated = patch_res.json()
        assert updated["status"] == "RESOLVED"
        assert updated["resolution_notes"] is not None
        assert updated["resolved_at"] is not None
