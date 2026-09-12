import random
import datetime
from datetime import timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.db import get_db
from app.core.security import get_current_user, require_roles
from app.core.events import publish_event
from app.core.audit import create_audit_log
from app.db.models import Grievance, Application, ApplicationEvent, Department, User

router = APIRouter(prefix="/grievances", tags=["Unified Grievances"])

def utc_now():
    return datetime.datetime.now(timezone.utc)

def generate_grievance_number() -> str:
    now_str = datetime.datetime.now().strftime("%Y%m%d")
    rand_num = random.randint(1000, 9999)
    return f"GRV-{now_str}-{rand_num}"

class GrievanceCreate(BaseModel):
    department_id: str
    category: str = Field(..., description="e.g. DELAYED_PROCESSING, DOCUMENT_VERIFICATION_ISSUE, TECHNICAL_GLITCH, SERVICE_DENIAL, OTHER")
    description: str = Field(..., min_length=10)
    application_id: Optional[str] = None
    application_number: Optional[str] = None

class GrievanceUpdate(BaseModel):
    status: Optional[str] = Field(None, description="OPEN, IN_PROGRESS, RESOLVED")
    resolution_notes: Optional[str] = None
    escalated: Optional[bool] = None

class GrievanceResponse(BaseModel):
    id: str
    grievance_number: str
    application_id: Optional[str] = None
    application_number: Optional[str] = None
    citizen_id: str
    citizen_name: str
    department_id: str
    category: str
    description: str
    status: str
    resolution_notes: Optional[str] = None
    escalated: bool
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}

@router.post("", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED, summary="Raise a New Grievance")
async def create_grievance(
    payload: GrievanceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify department exists
    dept_stmt = select(Department).where(Department.id == payload.department_id)
    dept = (await db.execute(dept_stmt)).scalar_one_or_none()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department '{payload.department_id}' not found."
        )

    # If application_id is provided, verify it exists
    app_obj = None
    app_uuid = None
    app_num = payload.application_number
    if payload.application_id:
        try:
            app_uuid = uuid.UUID(payload.application_id)
            app_stmt = select(Application).where(Application.id == app_uuid)
            app_obj = (await db.execute(app_stmt)).scalar_one_or_none()
            if app_obj:
                app_num = app_obj.application_number
        except Exception:
            pass

    grv_num = generate_grievance_number()
    grievance = Grievance(
        grievance_number=grv_num,
        application_id=app_uuid,
        application_number=app_num,
        citizen_id=current_user.id,
        citizen_name=current_user.full_name,
        department_id=payload.department_id,
        category=payload.category,
        description=payload.description,
        status="OPEN",
        escalated=False
    )
    db.add(grievance)
    await db.flush()

    # If linked to an application, log an ApplicationEvent
    if app_obj:
        event = ApplicationEvent(
            application_id=app_obj.id,
            event_type="GRIEVANCE_RAISED",
            actor_name=current_user.full_name,
            description=f"Grievance raised ({grv_num}): {payload.category} - {payload.description[:60]}...",
            metadata_info={"grievance_number": grv_num, "category": payload.category}
        )
        db.add(event)

    await create_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role_id,
        action="GRIEVANCE_RAISED",
        resource=f"grievances/{grievance.id}",
        result="SUCCESS",
        details={"grievance_number": grv_num, "department_id": payload.department_id, "category": payload.category}
    )

    from app.core.notifications import send_notification
    await send_notification(
        db=db,
        user_id=current_user.id,
        title="RTS Grievance Registered",
        message=f"Grievance #{grv_num} has been registered with {payload.department_id} under Maharashtra RTS Act.",
        channel="SMS",
        category="GRIEVANCE_UPDATE",
        metadata_info={"grievance_number": grv_num, "department_id": payload.department_id}
    )

    await db.commit()
    await db.refresh(grievance)

    await publish_event(
        event_type="GRIEVANCE_CREATED",
        actor_name=grievance.citizen_name,
        description=f"Grievance {grv_num} logged for {grievance.department_id}",
        payload={
            "grievance_id": str(grievance.id),
            "grievance_number": grv_num,
            "department_id": grievance.department_id,
            "citizen_name": grievance.citizen_name,
            "category": grievance.category
        }
    )

    return GrievanceResponse(
        id=str(grievance.id),
        grievance_number=grievance.grievance_number,
        application_id=str(grievance.application_id) if grievance.application_id else None,
        application_number=grievance.application_number,
        citizen_id=str(grievance.citizen_id),
        citizen_name=grievance.citizen_name,
        department_id=grievance.department_id,
        category=grievance.category,
        description=grievance.description,
        status=grievance.status,
        resolution_notes=grievance.resolution_notes,
        escalated=grievance.escalated,
        created_at=grievance.created_at,
        resolved_at=grievance.resolved_at
    )

@router.get("", response_model=List[GrievanceResponse], summary="List Grievances (Role-filtered with Auto-Escalation)")
async def list_grievances(
    department_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Grievance).order_by(desc(Grievance.created_at))

    if current_user.role_id == "CITIZEN":
        stmt = stmt.where(Grievance.citizen_id == current_user.id)
    elif current_user.role_id == "DEPARTMENT_OFFICER":
        if current_user.department_id:
            stmt = stmt.where(Grievance.department_id == current_user.department_id)
    elif current_user.role_id in ["SYSTEM_ADMIN", "DEPARTMENT_ADMIN"]:
        if department_id:
            stmt = stmt.where(Grievance.department_id == department_id)

    if status_filter:
        stmt = stmt.where(Grievance.status == status_filter.upper())

    result = await db.execute(stmt)
    grievances = result.scalars().all()

    # Dynamic SLA / Auto-Escalation Check:
    # If a grievance is open > 2 minutes (demo threshold) and not resolved, flag as escalated
    now = utc_now()
    responses = []
    updated_any = False

    for grv in grievances:
        is_escalated = grv.escalated
        if grv.status != "RESOLVED" and not is_escalated:
            time_diff = (now - grv.created_at.replace(tzinfo=timezone.utc) if grv.created_at.tzinfo is None else now - grv.created_at).total_seconds()
            if time_diff > 120:  # 2 minutes demo escalation SLA
                grv.escalated = True
                is_escalated = True
                updated_any = True

        responses.append(GrievanceResponse(
            id=str(grv.id),
            grievance_number=grv.grievance_number,
            application_id=str(grv.application_id) if grv.application_id else None,
            application_number=grv.application_number,
            citizen_id=str(grv.citizen_id),
            citizen_name=grv.citizen_name,
            department_id=grv.department_id,
            category=grv.category,
            description=grv.description,
            status=grv.status,
            resolution_notes=grv.resolution_notes,
            escalated=is_escalated,
            created_at=grv.created_at,
            resolved_at=grv.resolved_at
        ))

    if updated_any:
        await db.commit()

    return responses

@router.patch("/{grievance_id}", response_model=GrievanceResponse, summary="Update / Resolve Grievance")
async def update_grievance(
    grievance_id: str,
    payload: GrievanceUpdate,
    current_user: User = Depends(require_roles(["DEPARTMENT_OFFICER", "DEPARTMENT_ADMIN", "SYSTEM_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    try:
        grv_uuid = uuid.UUID(grievance_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid grievance UUID")

    stmt = select(Grievance).where(Grievance.id == grv_uuid)
    grievance = (await db.execute(stmt)).scalar_one_or_none()
    if not grievance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grievance not found")

    # Officers can only update grievances in their department
    if current_user.role_id == "DEPARTMENT_OFFICER" and current_user.department_id:
        if grievance.department_id != current_user.department_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update grievances of another department"
            )

    if payload.status:
        valid_statuses = ["OPEN", "IN_PROGRESS", "RESOLVED"]
        if payload.status.upper() not in valid_statuses:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of {valid_statuses}")
        grievance.status = payload.status.upper()
        if grievance.status == "RESOLVED":
            grievance.resolved_at = utc_now()
            grievance.escalated = False

    if payload.resolution_notes is not None:
        grievance.resolution_notes = payload.resolution_notes

    if payload.escalated is not None:
        grievance.escalated = payload.escalated

    # If linked to an application, log an ApplicationEvent
    if grievance.application_id:
        event = ApplicationEvent(
            application_id=grievance.application_id,
            event_type="GRIEVANCE_UPDATED",
            actor_name=current_user.full_name,
            description=f"Grievance {grievance.grievance_number} updated to {grievance.status}. Notes: {payload.resolution_notes or 'None'}",
            metadata_info={"grievance_number": grievance.grievance_number, "status": grievance.status}
        )
        db.add(event)

    await create_audit_log(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role_id,
        action="GRIEVANCE_UPDATED",
        resource=f"grievances/{grievance.id}",
        result="SUCCESS",
        details={"grievance_number": grievance.grievance_number, "new_status": grievance.status, "escalated": grievance.escalated}
    )

    from app.core.notifications import send_notification
    await send_notification(
        db=db,
        user_id=grievance.citizen_id,
        title=f"Grievance Status: {grievance.status}",
        message=f"Grievance #{grievance.grievance_number} updated to '{grievance.status}'. Resolution: {payload.resolution_notes or 'Under Review'}",
        channel="SMS",
        category="GRIEVANCE_UPDATE",
        metadata_info={"grievance_number": grievance.grievance_number, "status": grievance.status}
    )

    await db.commit()
    await db.refresh(grievance)

    await publish_event(
        event_type="GRIEVANCE_UPDATED",
        actor_name=current_user.full_name,
        description=f"Grievance {grievance.grievance_number} updated to {grievance.status}",
        payload={
            "grievance_id": str(grievance.id),
            "grievance_number": grievance.grievance_number,
            "status": grievance.status,
            "resolved_at": grievance.resolved_at.isoformat() if grievance.resolved_at else None
        }
    )

    return GrievanceResponse(
        id=str(grievance.id),
        grievance_number=grievance.grievance_number,
        application_id=str(grievance.application_id) if grievance.application_id else None,
        application_number=grievance.application_number,
        citizen_id=str(grievance.citizen_id),
        citizen_name=grievance.citizen_name,
        department_id=grievance.department_id,
        category=grievance.category,
        description=grievance.description,
        status=grievance.status,
        resolution_notes=grievance.resolution_notes,
        escalated=grievance.escalated,
        created_at=grievance.created_at,
        resolved_at=grievance.resolved_at
    )
