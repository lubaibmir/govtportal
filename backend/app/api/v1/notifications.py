import datetime
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc

from app.core.db import get_db
from app.core.security import get_current_user
from app.core.notifications import send_notification
from app.db.models import Notification, User

router = APIRouter(prefix="/notifications", tags=["Citizen Notifications & Multi-Channel Alerts"])

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    channel: str
    category: str
    is_read: bool
    metadata_info: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

class NotificationListResponse(BaseModel):
    unread_count: int
    notifications: List[NotificationResponse]

class SimulateNotificationPayload(BaseModel):
    channel: str = "SMS"  # SMS, WHATSAPP, EMAIL
    title: str
    message: str
    category: str = "STATUS_UPDATE"

@router.get("", response_model=NotificationListResponse, summary="Get Current User Notifications")
async def get_user_notifications(
    channel_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(Notification.user_id == current_user.id).order_by(desc(Notification.created_at))
    if channel_filter and channel_filter.upper() != "ALL":
        stmt = stmt.where(Notification.channel == channel_filter.upper())

    result = await db.execute(stmt)
    notifications = result.scalars().all()

    unread_stmt = select(Notification).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    unread_count = len((await db.execute(unread_stmt)).scalars().all())

    return NotificationListResponse(
        unread_count=unread_count,
        notifications=[
            NotificationResponse(
                id=str(n.id),
                user_id=str(n.user_id),
                title=n.title,
                message=n.message,
                channel=n.channel,
                category=n.category,
                is_read=n.is_read,
                metadata_info=n.metadata_info,
                created_at=n.created_at
            )
            for n in notifications
        ]
    )

@router.patch("/{notification_id}/read", response_model=NotificationResponse, summary="Mark Notification as Read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        notif_uuid = uuid.UUID(notification_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification UUID")

    stmt = select(Notification).where(
        Notification.id == notif_uuid,
        Notification.user_id == current_user.id
    )
    notif = (await db.execute(stmt)).scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    await db.commit()
    await db.refresh(notif)

    return NotificationResponse(
        id=str(notif.id),
        user_id=str(notif.user_id),
        title=notif.title,
        message=notif.message,
        channel=notif.channel,
        category=notif.category,
        is_read=notif.is_read,
        metadata_info=notif.metadata_info,
        created_at=notif.created_at
    )

@router.post("/read-all", summary="Mark All Notifications as Read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"status": "success", "message": "All notifications marked as read"}

@router.post("/simulate", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED, summary="Simulate Dispatching Multi-Channel Alert")
async def simulate_notification(
    payload: SimulateNotificationPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notif = await send_notification(
        db=db,
        user_id=current_user.id,
        title=payload.title,
        message=payload.message,
        channel=payload.channel,
        category=payload.category,
        metadata_info={"phone": current_user.phone, "email": current_user.email}
    )
    await db.commit()
    await db.refresh(notif)

    return NotificationResponse(
        id=str(notif.id),
        user_id=str(notif.user_id),
        title=notif.title,
        message=notif.message,
        channel=notif.channel,
        category=notif.category,
        is_read=notif.is_read,
        metadata_info=notif.metadata_info,
        created_at=notif.created_at
    )
