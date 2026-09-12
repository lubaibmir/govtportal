import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.db import get_db
from app.scripts.seed_db import seed_data
from app.core.workflow_engine import workflow_registry

@pytest.mark.asyncio
async def test_workflow_rules_and_auto_approval():
    db_gen = app.dependency_overrides[get_db]()
    session = await db_gen.__anext__()
    try:
        await seed_data(session=session)
    finally:
        try:
            await db_gen.__anext__()
        except StopAsyncIteration:
            pass

    # Reset rules to default
    workflow_registry.reset_defaults()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as Admin
        admin_res = await ac.post("/api/v1/auth/login", json={
            "email": "admin.mahagov@example.gov.in",
            "password": "Password@123"
        })
        assert admin_res.status_code == 200
        admin_token = admin_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Login as Citizen
        citizen_res = await ac.post("/api/v1/auth/login", json={
            "email": "rahul.sharma@example.gov.in",
            "password": "Password@123"
        })
        assert citizen_res.status_code == 200
        citizen_token = citizen_res.json()["access_token"]
        citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

        # 3. Get Rules list
        rules_res = await ac.get("/api/v1/workflow/rules")
        assert rules_res.status_code == 200
        rules = rules_res.json()
        assert len(rules) >= 2
        assert any(r["rule_id"] == "rule_ind_msme_auto_approval" for r in rules)

        # 4. Submit application qualifying for auto-approval (income ₹4,50,000 <= ₹5,00,000)
        app_res = await ac.post("/api/v1/applications", headers=citizen_headers, json={
            "service_id": "srv_ind_biz_license",
            "department_id": "dept_industries",
            "application_data": {
                "enterprise_name": "FastTrack Auto Tech",
                "income_certificate_number": "MH-REV-2026-98112",
                "verified_annual_income": 450000.00
            }
        })
        assert app_res.status_code == 201
        app_data = app_res.json()
        assert app_data["status"] == "APPROVED"  # Auto-approved by policy engine

        # Check tracking events include policy rule
        track_res = await ac.get(f"/api/v1/applications/track/{app_data['application_number']}")
        assert track_res.status_code == 200
        track_data = track_res.json()
        assert any(e["event_type"] == "AUTO_APPROVED_BY_POLICY_RULE" for e in track_data["events"])

        # 5. Admin updates rule: disable auto-approval
        patch_res = await ac.patch("/api/v1/workflow/rules/rule_ind_msme_auto_approval", headers=admin_headers, json={
            "enabled": False
        })
        assert patch_res.status_code == 200
        assert patch_res.json()["enabled"] is False

        # 6. Submit another application -> should remain SUBMITTED for manual review
        app_res2 = await ac.post("/api/v1/applications", headers=citizen_headers, json={
            "service_id": "srv_ind_biz_license",
            "department_id": "dept_industries",
            "application_data": {
                "enterprise_name": "Manual Review Tech",
                "income_certificate_number": "MH-REV-2026-98113",
                "verified_annual_income": 450000.00
            }
        })
        assert app_res2.status_code == 201
        assert app_res2.json()["status"] == "SUBMITTED"

        # 7. Reset rules to defaults
        reset_res = await ac.post("/api/v1/workflow/rules/reset", headers=admin_headers)
        assert reset_res.status_code == 200
        assert any(r["rule_id"] == "rule_ind_msme_auto_approval" and r["enabled"] for r in reset_res.json())
