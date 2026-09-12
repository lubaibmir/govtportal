import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_beneficiary_360_and_deduplication():
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
        # 1. Login as Officer
        officer_res = await ac.post("/api/v1/auth/login", json={
            "email": "officer.industries@example.gov.in",
            "password": "Password@123"
        })
        assert officer_res.status_code == 200
        officer_token = officer_res.json()["access_token"]
        officer_headers = {"Authorization": f"Bearer {officer_token}"}

        # 2. Login as Citizen (Rahul Sharma)
        citizen_res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert citizen_res.status_code == 200
        citizen_user = citizen_res.json()["user"]
        citizen_id = citizen_user["id"]

        # 3. Get Beneficiary 360 View
        res_360 = await ac.get(f"/api/v1/beneficiary/360/{citizen_id}", headers=officer_headers)
        assert res_360.status_code == 200
        data_360 = res_360.json()
        assert data_360["full_name"] == "Rahul Sharma"
        assert len(data_360["federated_identities"]) >= 3
        assert any(f["department_id"] == "dept_revenue" for f in data_360["federated_identities"])
        assert any(f["department_id"] == "dept_skills" for f in data_360["federated_identities"])

        # 4. Fuzzy Deduplication Search (Matching "Rahul S. Sharma")
        dedup_res = await ac.post("/api/v1/beneficiary/deduplicate", headers=officer_headers, json={
            "query_name": "Rahul S. Sharma",
            "phone": "+919876543210"
        })
        assert dedup_res.status_code == 200
        dedup_data = dedup_res.json()
        assert dedup_data["matches_found"] >= 1
        assert dedup_data["candidates"][0]["citizen_id"] == citizen_id
        assert dedup_data["candidates"][0]["match_score"] >= 80.0
