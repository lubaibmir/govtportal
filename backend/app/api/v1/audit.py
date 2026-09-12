from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_db
from app.core.security import require_roles
from app.db.models import AuditLog, User

router = APIRouter(prefix="/audit-logs", tags=["Audit, Security & Observability"])

class AuditLogResponse(BaseModel):
    id: int
    request_id: str
    timestamp: datetime
    actor_id: Optional[UUID] = None
    actor_role: str
    action: str
    resource: str
    result: str
    ip_address: str
    details: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=List[AuditLogResponse], summary="Get System Audit Logs Explorer")
async def list_audit_logs(
    action_filter: Optional[str] = None,
    actor_role_filter: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN", "DEPARTMENT_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog)
    if action_filter:
        stmt = stmt.where(AuditLog.action == action_filter)
    if actor_role_filter:
        stmt = stmt.where(AuditLog.actor_role == actor_role_filter)

    stmt = stmt.order_by(AuditLog.timestamp.desc()).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
