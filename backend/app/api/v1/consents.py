import uuid
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.db import get_db
from app.core.security import get_current_user, require_roles
from app.core.audit import create_audit_log
from app.db.models import Consent, User, ApplicationEvent
from app.schemas.consent import ConsentCreate, ConsentResponse

router = APIRouter(prefix="/consents", tags=["Consent Management Engine"])

def generate_consent_token() -> str:
    return f"cnt_token_{secrets.token_hex(16)}"

def utc_now():
    return datetime.now(timezone.utc)

@router.post("", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED, summary="Create Consent Request")
async def create_consent(
    consent_in: ConsentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    expires_at = utc_now() + timedelta(hours=consent_in.valid_duration_hours)
    
    # If citizen is creating it, it can be created directly
    new_consent = Consent(
        citizen_id=current_user.id if current_user.role_id == "CITIZEN" else current_user.id,
        requesting_department_id=consent_in.requesting_department_id,
        providing_department_id=consent_in.providing_department_id,
        service_id=consent_in.service_id,
        purpose=consent_in.purpose,
        requested_fields=consent_in.requested_fields,
        status="PENDING",
        expires_at=expires_at
    )
    db.add(new_consent)
    await db.commit()
    await db.refresh(new_consent)
    return new_consent

@router.get("", response_model=List[ConsentResponse], summary="List Consents for Citizen")
async def list_consents(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Consent)

    if current_user.role_id == "CITIZEN":
        stmt = stmt.where(Consent.citizen_id == current_user.id)
    elif current_user.role_id == "DEPARTMENT_OFFICER" and current_user.department_id:
        stmt = stmt.where(
            (Consent.requesting_department_id == current_user.department_id) |
            (Consent.providing_department_id == current_user.department_id)
        )

    if status_filter:
        stmt = stmt.where(Consent.status == status_filter)

    stmt = stmt.order_by(Consent.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{consent_id}", response_model=ConsentResponse, summary="Get Consent Details")
async def get_consent(
    consent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Consent).where(Consent.id == consent_id)
    result = await db.execute(stmt)
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consent ID '{consent_id}' not found"
        )

    if current_user.role_id == "CITIZEN" and consent.citizen_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this consent"
        )

    return consent

@router.post("/{consent_id}/approve", response_model=ConsentResponse, summary="Approve Consent Request")
async def approve_consent(
    consent_id: uuid.UUID,
    current_user: User = Depends(require_roles(["CITIZEN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Consent).where(Consent.id == consent_id, Consent.citizen_id == current_user.id)
    result = await db.execute(stmt)
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent request not found or unauthorized"
        )

    if consent.status not in ["PENDING", "ACTIVE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve consent in status '{consent.status}'"
        )

    consent.status = "ACTIVE"
    consent.consent_token = generate_consent_token()
    consent.expires_at = utc_now() + timedelta(hours=24)

    await create_audit_log(
        db=db,
        action="CONSENT_APPROVED",
        resource=f"/api/v1/consents/{consent_id}/approve",
        actor_role=current_user.role_id,
        actor_id=current_user.id,
        details={
            "consent_id": str(consent.id),
            "requesting_dept": consent.requesting_department_id,
            "providing_dept": consent.providing_department_id,
            "consent_token": consent.consent_token
        }
    )

    await db.commit()
    await db.refresh(consent)
    return consent

@router.post("/{consent_id}/deny", response_model=ConsentResponse, summary="Deny Consent Request")
async def deny_consent(
    consent_id: uuid.UUID,
    current_user: User = Depends(require_roles(["CITIZEN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Consent).where(Consent.id == consent_id, Consent.citizen_id == current_user.id)
    result = await db.execute(stmt)
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent request not found"
        )

    consent.status = "DENIED"
    consent.consent_token = None

    await create_audit_log(
        db=db,
        action="CONSENT_DENIED",
        resource=f"/api/v1/consents/{consent_id}/deny",
        actor_role=current_user.role_id,
        actor_id=current_user.id,
        details={"consent_id": str(consent.id)}
    )

    await db.commit()
    await db.refresh(consent)
    return consent

@router.post("/{consent_id}/revoke", response_model=ConsentResponse, summary="Revoke Active Consent")
async def revoke_consent(
    consent_id: uuid.UUID,
    current_user: User = Depends(require_roles(["CITIZEN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Consent).where(Consent.id == consent_id, Consent.citizen_id == current_user.id)
    result = await db.execute(stmt)
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent record not found"
        )

    consent.status = "REVOKED"
    consent.consent_token = None

    await db.commit()
    await db.refresh(consent)
    return consent
