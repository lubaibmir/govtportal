import logging
import datetime
import uuid
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Notification, User
from app.core.events import publish_event

logger = logging.getLogger("mahasetu.notifications")

async def send_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    message: str,
    channel: str = "SMS",  # SMS, WHATSAPP, EMAIL, IN_APP
    category: str = "STATUS_UPDATE",
    metadata_info: Optional[Dict[str, Any]] = None
) -> Notification:
    """Creates a notification record and broadcasts multi-channel alert"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        channel=channel.upper(),
        category=category.upper(),
        is_read=False,
        metadata_info=metadata_info or {}
    )
    db.add(notification)
    await db.flush()

    logger.info(f"[{channel.upper()} GATEWAY] Sent alert to user {user_id}: {title} - {message}")

    await publish_event(
        event_type="NOTIFICATION_DISPATCHED",
        actor_name="MahaSetu Dispatch Gateway",
        description=f"Notification dispatched via {channel}: {title}",
        payload={
            "notification_id": str(notification.id),
            "user_id": str(user_id),
            "channel": channel,
            "title": title
        }
    )

    return notification
