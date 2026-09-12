from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class ApplicationCreate(BaseModel):
    service_id: str
    department_id: str
    application_data: Dict[str, Any]
    consent_ids: Optional[List[UUID]] = []

class ApplicationResponse(BaseModel):
    id: UUID
    application_number: str
    citizen_id: UUID
    service_id: str
    department_id: str
    application_data: Dict[str, Any]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TrackingEventItem(BaseModel):
    id: UUID
    event_type: str
    actor_name: str
    description: str
    metadata_info: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApplicationTrackingResponse(BaseModel):
    id: UUID
    application_number: str
    citizen_id: UUID
    service_id: str
    service_title: Optional[str] = None
    department_id: str
    department_name: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    application_data: Dict[str, Any]
    events: List[TrackingEventItem] = []

    model_config = ConfigDict(from_attributes=True)
