import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_db
from app.core.security import get_current_user
from app.db.models import Consent, DataRequest, User, AuditLog
from app.adapters.revenue import RevenueAdapter
from app.adapters.education import EducationAdapter
from app.adapters.industries import IndustriesAdapter
from app.adapters.skills import SkillsAdapter
from app.schemas.canonical import CanonicalDataMapper
from app.core.resilience import resilience_manager

router = APIRouter(prefix="/data-requests", tags=["Interoperability & Data Exchange Core"])

class DataExchangeRequest(BaseModel):
    consent_token: str
    providing_department_id: str
    data_type: str

class DataExchangeResponse(BaseModel):
    request_id: UUID
    status: str
    providing_department_id: str
    data_type: str
    canonical_payload: Dict[str, Any]
    raw_response_hash: str
    transformed_at: datetime

    model_config = ConfigDict(from_attributes=True)

def is_datetime_expired(expires_at: datetime) -> bool:
    if expires_at.tzinfo is not None:
        return expires_at < datetime.now(timezone.utc)
    return expires_at < datetime.now(timezone.utc).replace(tzinfo=None)

# Adapter Registry Mapping
ADAPTER_MAP = {
    "dept_revenue": RevenueAdapter(),
    "dept_education": EducationAdapter(),
    "dept_industries": IndustriesAdapter(),
    "dept_skills": SkillsAdapter()
}

@router.post("", response_model=DataExchangeResponse, summary="Execute Inter-Department Data Exchange (Consent Verified)")
async def execute_data_exchange(
    req: DataExchangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. HARD BACKEND CONSENT ENFORCEMENT VERIFICATION
    stmt = select(Consent).where(Consent.consent_token == req.consent_token)
    result = await db.execute(stmt)
    consent = result.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CONSENT_REQUIRED: Invalid or missing consent token. Backend access blocked."
        )

    if consent.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"CONSENT_INACTIVE: Consent status is '{consent.status}'. Must be ACTIVE to exchange data."
        )

    if is_datetime_expired(consent.expires_at):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CONSENT_EXPIRED: The citizen consent token has expired."
        )

    if consent.providing_department_id != req.providing_department_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"CONSENT_SCOPE_MISMATCH: Token grants scope for '{consent.providing_department_id}', but requested '{req.providing_department_id}'."
        )

    # 2. RESOLVE DEPARTMENT ADAPTER
    adapter = ADAPTER_MAP.get(req.providing_department_id)
    if not adapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No adapter registered for department '{req.providing_department_id}'"
        )

    # 3. FETCH RAW DEPARTMENT DATA PAYLOAD VIA RESILIENT ADAPTER LAYER
    try:
        raw_payload = await resilience_manager.execute_resilient_call(
            adapter=adapter,
            citizen_id=str(current_user.id),
            data_type=req.data_type,
            consent_token=req.consent_token
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"DEPARTMENT_ADAPTER_ERROR: Failed to fetch data from {req.providing_department_id} ({str(e)})"
        )

    # 4. COMPUTE RAW RESPONSE CRYPTOGRAPHIC HASH (SHA-256)
    raw_bytes = json.dumps(raw_payload, sort_keys=True).encode('utf-8')
    raw_hash = hashlib.sha256(raw_bytes).hexdigest()

    # 5. CANONICAL DATA MODEL TRANSFORMATION
    if req.data_type == "INCOME_CERTIFICATE":
        canonical_obj = CanonicalDataMapper.transform_income_certificate(raw_payload)
        canonical_dict = canonical_obj.model_dump()
    elif req.data_type == "DEGREE_VERIFICATION":
        canonical_obj = CanonicalDataMapper.transform_degree_verification(raw_payload)
        canonical_dict = canonical_obj.model_dump()
    elif req.data_type == "SKILL_CERTIFICATE":
        canonical_obj = CanonicalDataMapper.transform_skill_certificate(raw_payload)
        canonical_dict = canonical_obj.model_dump()
    else:
        canonical_dict = raw_payload  # Direct passthrough fallback

    # 6. PERSIST DATA REQUEST RECORD & LOG AUDIT TRAIL
    new_request = DataRequest(
        consent_id=consent.id,
        providing_department_id=req.providing_department_id,
        data_type=req.data_type,
        raw_response_hash=raw_hash,
        status="SUCCESS"
    )
    db.add(new_request)
    await db.flush()

    audit_entry = AuditLog(
        request_id=f"req_{new_request.id.hex[:12]}",
        actor_id=current_user.id,
        actor_role=current_user.role_id,
        action="DATA_EXCHANGE_EXECUTED",
        resource=f"{req.providing_department_id}.{req.data_type}",
        result="SUCCESS",
        ip_address="127.0.0.1",
        details={
            "consent_id": str(consent.id),
            "providing_department": req.providing_department_id,
            "raw_hash": raw_hash
        }
    )
    db.add(audit_entry)
    await db.commit()
    await db.refresh(new_request)

    return DataExchangeResponse(
        request_id=new_request.id,
        status="SUCCESS",
        providing_department_id=req.providing_department_id,
        data_type=req.data_type,
        canonical_payload=canonical_dict,
        raw_response_hash=raw_hash,
        transformed_at=new_request.created_at
    )
