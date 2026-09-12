import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_departments_and_services_api():
    # Retrieve active session from dependency override & seed database
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
        # Test 1: List Departments
        dept_res = await ac.get("/api/v1/departments")
        assert dept_res.status_code == 200
        depts = dept_res.json()
        assert len(depts) >= 3
        dept_ids = [d["id"] for d in depts]
        assert "dept_revenue" in dept_ids
        assert "dept_industries" in dept_ids

        # Test 2: Get Specific Department
        rev_res = await ac.get("/api/v1/departments/dept_revenue")
        assert rev_res.status_code == 200
        assert rev_res.json()["name"] == "Revenue Department"

        # Test 3: List Services
        srv_res = await ac.get("/api/v1/services")
        assert srv_res.status_code == 200
        services = srv_res.json()
        assert len(services) >= 3
        srv_ids = [s["id"] for s in services]
        assert "srv_ind_biz_license" in srv_ids

        # Test 4: Filter Services by Department
        ind_srv_res = await ac.get("/api/v1/services?department_id=dept_industries")
        assert ind_srv_res.status_code == 200
        ind_services = ind_srv_res.json()
        assert len(ind_services) >= 1
        assert ind_services[0]["department_id"] == "dept_industries"

        # Test 5: Register New Department Without Admin Auth (Fails HTTP 401)
        unauth_post = await ac.post("/api/v1/departments", json={
            "id": "dept_health",
            "code": "HEALTH",
            "name": "Public Health Department",
            "api_base_url": "http://localhost:8000/api/v1/adapters/health",
            "contact_email": "nodal.health@maharashtra.gov.in"
        })
        assert unauth_post.status_code == 401
