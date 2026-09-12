import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_officer_and_admin_dashboards_flow():
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
        # 1. Citizen submits application
        cit_login = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        cit_token = cit_login.json()["access_token"]
        cit_headers = {"Authorization": f"Bearer {cit_token}"}

        sub_res = await ac.post("/api/v1/applications", headers=cit_headers, json={
            "service_id": "srv_ind_biz_license",
            "department_id": "dept_industries",
            "application_data": {"enterprise": "Sharma Tech"}
        })
        assert sub_res.status_code == 201
        app_num = sub_res.json()["application_number"]

        # 2. Login Industries Officer
        off_login = await ac.post("/api/v1/auth/login", json={
            "email": "officer.industries@example.gov.in",
            "password": "Password@123"
        })
        off_token = off_login.json()["access_token"]
        off_headers = {"Authorization": f"Bearer {off_token}"}

        # 3. Officer lists department applications
        list_res = await ac.get("/api/v1/applications", headers=off_headers)
        assert list_res.status_code == 200
        apps = list_res.json()
        assert any(a["application_number"] == app_num for a in apps)

        # 4. Officer transitions application to IN_REVIEW
        rev_res = await ac.patch(f"/api/v1/applications/{app_num}/status", headers=off_headers, json={
            "status": "IN_REVIEW",
            "remarks": "Officer started verification"
        })
        assert rev_res.status_code == 200
        assert rev_res.json()["status"] == "IN_REVIEW"

        # 5. Login System Admin
        admin_login = await ac.post("/api/v1/auth/login", json={
            "email": "admin.mahagov@example.gov.in",
            "password": "Password@123"
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 6. Admin lists all applications across departments
        admin_list = await ac.get("/api/v1/applications", headers=admin_headers)
        assert admin_list.status_code == 200
        assert len(admin_list.json()) >= 1
