from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_db
from app.core.security import get_current_user
from app.db.models import Application, ApplicationEvent, User

router = APIRouter(prefix="/events", tags=["Event Bus & Notifications"])

class EventResponse(BaseModel):
    id: UUID
    application_id: UUID
    event_type: str
    actor_name: str
    description: str
    metadata_info: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

@router.get("/applications/{application_number}", response_model=List[EventResponse], summary="Get Application Lifecycle Event History")
async def get_application_events(
    application_number: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt_app = select(Application).where(Application.application_number == application_number)
    app_obj = (await db.execute(stmt_app)).scalar_one_or_none()

    if not app_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_number}' not found"
        )

    if current_user.role_id == "CITIZEN" and app_obj.citizen_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to access events for this application"
        )

    stmt_events = select(ApplicationEvent).where(ApplicationEvent.application_id == app_obj.id).order_by(ApplicationEvent.created_at.asc())
    result = await db.execute(stmt_events)
    return result.scalars().all()
