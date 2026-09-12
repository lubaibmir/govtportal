from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ConsentCreate(BaseModel):
    requesting_department_id: str
    providing_department_id: str
    service_id: str
    purpose: str
    requested_fields: List[str]
    valid_duration_hours: int = 24

class ConsentResponse(BaseModel):
    id: UUID
    citizen_id: UUID
    requesting_department_id: str
    providing_department_id: str
    service_id: str
    purpose: str
    requested_fields: List[str]
    consent_token: Optional[str] = None
    status: str  # PENDING, ACTIVE, DENIED, EXPIRED, REVOKED
    created_at: datetime
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)
