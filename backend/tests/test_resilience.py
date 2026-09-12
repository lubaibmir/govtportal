import pytest
from app.core.resilience import resilience_manager
from app.adapters.revenue import RevenueAdapter

@pytest.mark.asyncio
async def test_resilience_circuit_breaker_and_cache_fallback():
    adapter = RevenueAdapter()
    citizen_id = "test-citizen-uuid-999"
    data_type = "INCOME_CERTIFICATE"
    token = "cnt_token_test_resilience"

    # Ensure clean state
    resilience_manager.outage_departments.clear()
    resilience_manager.cached_responses.clear()
    resilience_manager.pending_retry_queue.clear()

    # 1. Normal Call -> Populates Cache
    res1 = await resilience_manager.execute_resilient_call(adapter, citizen_id, data_type, token)
    assert res1["_resilience_status"] == "LIVE_DIRECT"
    assert f"{citizen_id}:dept_revenue:{data_type}" in resilience_manager.cached_responses

    # 2. Toggle Outage -> Triggers Retry Loop + Cache Fallback
    resilience_manager.toggle_outage("dept_revenue", True)
    assert resilience_manager.is_outage_active("dept_revenue") is True

    res2 = await resilience_manager.execute_resilient_call(adapter, citizen_id, data_type, token)
    assert res2["_resilience_status"] == "CACHE_FALLBACK"
    assert "Revenue" in res2["_resilience_message"] or "dept_revenue" in res2["_resilience_message"]

    # 3. Request for uncached citizen -> Queues in offline buffer
    new_citizen = "uncached-citizen-123"
    res3 = await resilience_manager.execute_resilient_call(adapter, new_citizen, data_type, token)
    assert res3["_resilience_status"] == "QUEUED_OFFLINE"
    assert len(resilience_manager.pending_retry_queue) == 1

    # 4. Restore Healthy Service -> Resumes Queued Items
    toggle_res = resilience_manager.toggle_outage("dept_revenue", False)
    assert resilience_manager.is_outage_active("dept_revenue") is False
    assert toggle_res["pending_queue_count"] == 0
