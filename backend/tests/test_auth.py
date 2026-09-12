import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.core.security import verify_password, get_password_hash
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_password_hashing():
    raw_password = "Password@123"
    hashed = get_password_hash(raw_password)
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

@pytest.mark.asyncio
async def test_login_flow():
    # Retrieve active session from dependency override
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
        # Test 1: Valid Citizen Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert login_res.status_code == 200
        data = login_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "rahul.sharma@example.gov.in"
        assert data["user"]["role_id"] == "CITIZEN"

        token = data["access_token"]

        # Test 2: Invalid Login
        invalid_res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "WrongPassword"
        })
        assert invalid_res.status_code == 401

        # Test 3: Authenticated Profile Fetch (GET /me)
        me_res = await ac.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["full_name"] == "Rahul Sharma"
        assert me_data["citizen_profile"] is not None
        assert me_data["citizen_profile"]["city"] == "Mumbai"

        # Test 4: Unauthenticated Request
        unauth_res = await ac.get("/api/v1/auth/me")
        assert unauth_res.status_code == 401

        # Test 5: Login as System Admin
        admin_login = await ac.post("/api/v1/auth/login", json={
            "email": "admin.mahagov@example.gov.in",
            "password": "Password@123"
        })
        assert admin_login.status_code == 200
        assert admin_login.json()["user"]["role_id"] == "SYSTEM_ADMIN"
