from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.security import require_roles
from app.core.resilience import resilience_manager
from app.db.models import User

router = APIRouter(prefix="/resilience", tags=["Resilience & Circuit Breaker"])

class ToggleOutageRequest(BaseModel):
    department_id: str
    is_outage: bool

class ResilienceStatusResponse(BaseModel):
    active_outages: List[str]
    cached_records_count: int
    pending_queue_count: int
    recent_logs_count: int

@router.get("/status", response_model=ResilienceStatusResponse, summary="Get active outage and circuit breaker status")
async def get_resilience_status():
    return ResilienceStatusResponse(
        active_outages=list(resilience_manager.outage_departments),
        cached_records_count=len(resilience_manager.cached_responses),
        pending_queue_count=len(resilience_manager.pending_retry_queue),
        recent_logs_count=len(resilience_manager.logs)
    )

@router.post("/toggle-outage", summary="Simulate or restore department API outage")
async def toggle_department_outage(
    req: ToggleOutageRequest,
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN", "DEPARTMENT_ADMIN", "DEPARTMENT_OFFICER"]))
):
    result = resilience_manager.toggle_outage(
        dept_id=req.department_id,
        is_outage=req.is_outage
    )
    return {
        "status": "SUCCESS",
        "toggled_by": current_user.full_name,
        **result
    }

@router.get("/logs", summary="Get real-time retry and circuit breaker event logs")
async def get_resilience_logs(limit: int = 50):
    return resilience_manager.logs[:limit]

@router.get("/queue", summary="Get pending resilient retry queue")
async def get_resilience_queue():
    return resilience_manager.pending_retry_queue
