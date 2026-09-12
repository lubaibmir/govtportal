import uuid
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import AuditLog

async def create_audit_log(
    db: AsyncSession,
    action: str,
    resource: str,
    actor_role: str,
    result: str = "SUCCESS",
    actor_id: Optional[uuid.UUID] = None,
    request_id: Optional[str] = None,
    ip_address: str = "127.0.0.1",
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    req_id = request_id or f"req_{uuid.uuid4().hex[:12]}"
    audit_entry = AuditLog(
        request_id=req_id,
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        resource=resource,
        result=result,
        ip_address=ip_address,
        details=details or {}
    )
    db.add(audit_entry)
    await db.commit()
    await db.refresh(audit_entry)
    return audit_entry
