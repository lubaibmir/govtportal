from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.security import require_roles
from app.core.workflow_engine import workflow_registry, WorkflowRule
from app.db.models import User

router = APIRouter(prefix="/workflow/rules", tags=["Configurable Workflow Rules Engine"])

class RuleUpdatePayload(BaseModel):
    enabled: Optional[bool] = None
    sla_hours: Optional[int] = None
    conditions: Optional[Dict[str, Any]] = None

@router.get("", response_model=List[WorkflowRule], summary="List All Workflow Rules & SLA Timers")
async def list_rules():
    """Retrieve all configured approval and orchestration rules with SLA definitions."""
    return workflow_registry.get_all_rules()

@router.patch("/{rule_id}", response_model=WorkflowRule, summary="Update Workflow Policy Rule / Thresholds")
async def update_rule(
    rule_id: str,
    payload: RuleUpdatePayload,
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN", "DEPARTMENT_ADMIN"]))
):
    """Admin endpoint to modify auto-approval thresholds, SLA deadlines, and rule enablement."""
    updated = workflow_registry.update_rule(
        rule_id=rule_id,
        updates={
            "enabled": payload.enabled,
            "sla_hours": payload.sla_hours,
            "conditions": payload.conditions
        }
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow rule '{rule_id}' not found."
        )
    return updated

@router.post("/reset", response_model=List[WorkflowRule], summary="Reset Workflow Rules to Defaults")
async def reset_rules(
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN"]))
):
    """Reset all workflow policies to default statutory configurations."""
    return workflow_registry.reset_defaults()
