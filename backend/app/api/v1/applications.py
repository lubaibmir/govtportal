import random
import datetime
from datetime import timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_db
from app.core.security import get_current_user, require_roles
from app.core.events import publish_event
from app.core.audit import create_audit_log
from app.db.models import Application, ApplicationEvent, Department, Service, User
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationTrackingResponse, TrackingEventItem

router = APIRouter(prefix="/applications", tags=["Applications & Tracking"])

class StatusUpdatePayload(BaseModel):
    status: str  # IN_REVIEW, APPROVED, REJECTED
    remarks: Optional[str] = None

def generate_application_number() -> str:
    year = datetime.datetime.now().year
    rand_num = random.randint(100000, 999999)
    return f"MH-{year}-{rand_num}"

VALID_TRANSITIONS = {
    "SUBMITTED": ["IN_REVIEW", "REJECTED"],
    "IN_REVIEW": ["APPROVED", "REJECTED"],
    "APPROVED": [],
    "REJECTED": []
}

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED, summary="Submit New Service Application")
async def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(require_roles(["CITIZEN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Service).where(Service.id == app_in.service_id)
    service = (await db.execute(stmt)).scalar_one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service ID '{app_in.service_id}' not found"
        )

    app_number = generate_application_number()

    new_app = Application(
        application_number=app_number,
        citizen_id=current_user.id,
        service_id=app_in.service_id,
        department_id=app_in.department_id,
        application_data=app_in.application_data,
        status="SUBMITTED"
    )
    db.add(new_app)
    await db.flush()

    # Log initial submission event
    initial_event = ApplicationEvent(
        application_id=new_app.id,
        event_type="APPLICATION_CREATED",
        actor_name=current_user.full_name,
        description=f"Application {app_number} created and submitted by citizen.",
        metadata_info={"consent_ids": [str(c) for c in (app_in.consent_ids or [])]}
    )
    db.add(initial_event)
    await db.commit()
    await db.refresh(new_app)

    # Publish event to Event Bus
    await publish_event(
        event_type="APPLICATION_CREATED",
        actor_name=current_user.full_name,
        description=f"Application {app_number} submitted to department {app_in.department_id}.",
        payload={"application_number": app_number, "citizen_id": str(current_user.id)}
    )

    return new_app

@router.get("", response_model=List[ApplicationResponse], summary="List Applications for User or Department")
async def list_applications(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Application)

    if current_user.role_id == "CITIZEN":
        stmt = stmt.where(Application.citizen_id == current_user.id)
    elif current_user.role_id == "DEPARTMENT_OFFICER" and current_user.department_id:
        stmt = stmt.where(Application.department_id == current_user.department_id)

    if status_filter:
        stmt = stmt.where(Application.status == status_filter)

    stmt = stmt.order_by(Application.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{application_number}", response_model=ApplicationResponse, summary="Get Application Details by Number")
async def get_application(
    application_number: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Application).where(Application.application_number == application_number)
    result = await db.execute(stmt)
    app_obj = result.scalar_one_or_none()

    if not app_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application number '{application_number}' not found"
        )

    if current_user.role_id == "CITIZEN" and app_obj.citizen_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this application"
        )

    return app_obj

@router.patch("/{application_number}/status", response_model=ApplicationResponse, summary="Transition Application Status State Machine")
async def update_application_status(
    application_number: str,
    payload: StatusUpdatePayload,
    current_user: User = Depends(require_roles(["DEPARTMENT_OFFICER", "SYSTEM_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Application).where(Application.application_number == application_number)
    result = await db.execute(stmt)
    app_obj = result.scalar_one_or_none()

    if not app_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application number '{application_number}' not found"
        )

    if current_user.role_id == "DEPARTMENT_OFFICER" and app_obj.department_id != current_user.department_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Officer belongs to department '{current_user.department_id}', cannot manage application for '{app_obj.department_id}'"
        )

    allowed_next = VALID_TRANSITIONS.get(app_obj.status, [])
    if payload.status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid state transition from '{app_obj.status}' to '{payload.status}'. Allowed transitions: {allowed_next}"
        )

    old_status = app_obj.status
    app_obj.status = payload.status
    app_obj.updated_at = datetime.datetime.now(timezone.utc)

    # Record event
    event_type = f"APPLICATION_{payload.status}"
    event_desc = f"Status changed from '{old_status}' to '{payload.status}' by {current_user.full_name}."
    if payload.remarks:
        event_desc += f" Remarks: {payload.remarks}"

    event_rec = ApplicationEvent(
        application_id=app_obj.id,
        event_type=event_type,
        actor_name=current_user.full_name,
        description=event_desc,
        metadata_info={"old_status": old_status, "new_status": payload.status, "remarks": payload.remarks}
    )
    db.add(event_rec)

    await create_audit_log(
        db=db,
        action="STATUS_TRANSITIONED",
        resource=f"/api/v1/applications/{application_number}/status",
        actor_role=current_user.role_id,
        actor_id=current_user.id,
        details={
            "application_number": application_number,
            "old_status": old_status,
            "new_status": payload.status,
            "remarks": payload.remarks
        }
    )

    await db.commit()
    await db.refresh(app_obj)

    # Publish to Event Bus
    await publish_event(
        event_type=event_type,
        actor_name=current_user.full_name,
        description=event_desc,
        payload={"application_number": application_number, "new_status": payload.status}
    )

    return app_obj

@router.get("/track/{application_number}", response_model=ApplicationTrackingResponse, summary="Track Application Timeline & Status by Number")
async def track_application(
    application_number: str,
    db: AsyncSession = Depends(get_db)
):
    stmt_app = select(Application).where(Application.application_number == application_number)
    app_obj = (await db.execute(stmt_app)).scalar_one_or_none()

    if not app_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_number}' not found"
        )

    # Resolve Service title
    stmt_srv = select(Service).where(Service.id == app_obj.service_id)
    srv_obj = (await db.execute(stmt_srv)).scalar_one_or_none()
    service_title = srv_obj.name if srv_obj else app_obj.service_id

    # Resolve Department name
    stmt_dept = select(Department).where(Department.id == app_obj.department_id)
    dept_obj = (await db.execute(stmt_dept)).scalar_one_or_none()
    department_name = dept_obj.name if dept_obj else app_obj.department_id

    # Resolve timeline events
    stmt_events = (
        select(ApplicationEvent)
        .where(ApplicationEvent.application_id == app_obj.id)
        .order_by(ApplicationEvent.created_at.asc())
    )
    events = (await db.execute(stmt_events)).scalars().all()

    return ApplicationTrackingResponse(
        id=app_obj.id,
        application_number=app_obj.application_number,
        citizen_id=app_obj.citizen_id,
        service_id=app_obj.service_id,
        service_title=service_title,
        department_id=app_obj.department_id,
        department_name=department_name,
        status=app_obj.status,
        created_at=app_obj.created_at,
        updated_at=app_obj.updated_at,
        application_data=app_obj.application_data,
        events=[TrackingEventItem.model_validate(e) for e in events]
    )
