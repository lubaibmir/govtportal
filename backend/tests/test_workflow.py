import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_application_workflow_and_state_machine():
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
        cit_login = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        cit_token = cit_login.json()["access_token"]
        cit_headers = {"Authorization": f"Bearer {cit_token}"}

        # 2. Login Industries Officer
        off_login = await ac.post("/api/v1/auth/login", json={
            "email": "officer.industries@example.gov.in",
            "password": "Password@123"
        })
        off_token = off_login.json()["access_token"]
        off_headers = {"Authorization": f"Bearer {off_token}"}

        # 3. Citizen submits Business License Application
        sub_res = await ac.post("/api/v1/applications", headers=cit_headers, json={
            "service_id": "srv_ind_biz_license",
            "department_id": "dept_industries",
            "application_data": {"enterprise": "Sharma Tech"}
        })
        assert sub_res.status_code == 201
        app_num = sub_res.json()["application_number"]
        assert sub_res.json()["status"] == "SUBMITTED"

        # 4. Officer Invalid Transition Attempt (SUBMITTED -> APPROVED directly fails HTTP 400)
        invalid_tr = await ac.patch(f"/api/v1/applications/{app_num}/status", headers=off_headers, json={
            "status": "APPROVED",
            "remarks": "Bypassing review"
        })
        assert invalid_tr.status_code == 400

        # 5. Officer Valid Transition 1 (SUBMITTED -> IN_REVIEW)
        review_tr = await ac.patch(f"/api/v1/applications/{app_num}/status", headers=off_headers, json={
            "status": "IN_REVIEW",
            "remarks": "Nodal Officer started document verification"
        })
        assert review_tr.status_code == 200
        assert review_tr.json()["status"] == "IN_REVIEW"

        # 6. Officer Valid Transition 2 (IN_REVIEW -> APPROVED)
        approve_tr = await ac.patch(f"/api/v1/applications/{app_num}/status", headers=off_headers, json={
            "status": "APPROVED",
            "remarks": "Verified Revenue income certificate and approved business license"
        })
        assert approve_tr.status_code == 200
        assert approve_tr.json()["status"] == "APPROVED"

        # 7. Check Event Timeline (GET /events/applications/{app_num})
        events_res = await ac.get(f"/api/v1/events/applications/{app_num}", headers=cit_headers)
        assert events_res.status_code == 200
        events = events_res.json()
        assert len(events) >= 3
        event_types = [e["event_type"] for e in events]
        assert "APPLICATION_CREATED" in event_types
        assert "APPLICATION_IN_REVIEW" in event_types
        assert "APPLICATION_APPROVED" in event_types
