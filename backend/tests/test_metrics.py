import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_impact_metrics_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/metrics/impact")
        assert response.status_code == 200
        data = response.json()
        assert "manual_baseline_days" in data
        assert data["manual_baseline_days"] == 21
        assert "duplicate_submissions_prevented" in data
        assert "estimated_admin_cost_saved_inr" in data
        assert "assumptions" in data
        assert "time_baseline" in data["assumptions"]
