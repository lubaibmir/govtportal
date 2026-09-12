import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data

@pytest.mark.asyncio
async def test_notifications_lifecycle():
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
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Simulate Dispatching a multi-channel alert
        sim_res = await ac.post("/api/v1/notifications/simulate", headers=headers, json={
            "channel": "WHATSAPP",
            "title": "MahaSetu Interoperability Alert",
            "message": "Your income certificate was successfully verified from Revenue Department.",
            "category": "DATA_VERIFIED"
        })
        assert sim_res.status_code == 201
        notif_data = sim_res.json()
        assert notif_data["channel"] == "WHATSAPP"
        assert notif_data["is_read"] is False
        notif_id = notif_data["id"]

        # 3. List notifications
        list_res = await ac.get("/api/v1/notifications", headers=headers)
        assert list_res.status_code == 200
        data = list_res.json()
        assert data["unread_count"] >= 1
        assert any(n["id"] == notif_id for n in data["notifications"])

        # 4. Mark notification as read
        read_res = await ac.patch(f"/api/v1/notifications/{notif_id}/read", headers=headers)
        assert read_res.status_code == 200
        assert read_res.json()["is_read"] is True

        # 5. Mark all as read
        all_read_res = await ac.post("/api/v1/notifications/read-all", headers=headers)
        assert all_read_res.status_code == 200

        # Verify unread count is 0
        list_res2 = await ac.get("/api/v1/notifications", headers=headers)
        assert list_res2.status_code == 200
        assert list_res2.json()["unread_count"] == 0
