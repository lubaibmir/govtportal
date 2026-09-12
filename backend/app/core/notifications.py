import logging
import datetime
import uuid
import httpx
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.models import Notification, User
from app.core.events import publish_event

logger = logging.getLogger("mahasetu.notifications")

async def send_brevo_transactional_email(
    to_email: str,
    to_name: str,
    subject: str,
    body_text: str,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """Dispatches a real transactional email via Brevo (Sendinblue) API v3 if API key configured"""
    api_key = settings.BREVO_API_KEY
    if not api_key:
        logger.info(f"[BREVO EMAIL SIMULATOR] (No BREVO_API_KEY configured) Email to {to_name} <{to_email}> | Subject: '{subject}' | Message: '{body_text}'")
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }}
        .card {{ background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; margin: auto; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
        .header {{ border-bottom: 2px solid #166534; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }}
        .header h1 {{ color: #166534; font-size: 20px; margin: 0; font-weight: bold; }}
        .badge {{ background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }}
        .content {{ color: #1e293b; font-size: 14px; line-height: 1.6; }}
        .message-box {{ background: #f8fafc; border-left: 4px solid #166534; padding: 14px; margin: 16px 0; border-radius: 0 4px 4px 0; font-size: 13px; color: #334155; }}
        .footer {{ margin-top: 28px; padding-top: 14px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🏛️ MahaSetu — शासन निर्णय व नागरिक सूचना</h1>
        </div>
        <span class="badge">Government of Maharashtra Notification</span>
        <div class="content">
          <p><strong>Dear {to_name},</strong></p>
          <div class="message-box">
            {body_text}
          </div>
          <p>You can track the live status, view cryptographic audit seals, or raise statutory appeals under the Maharashtra RTS Act by logging into MahaSetu.</p>
        </div>
        <div class="footer">
          <p>This is an automated statutory notification from MahaSetu Interoperability Platform (Government of Maharashtra & MSInS). Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
    """

    payload = {
        "sender": {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL
        },
        "to": [
            {
                "email": to_email,
                "name": to_name
            }
        ],
        "subject": f"[MahaSetu Govt] {subject}",
        "htmlContent": html_content
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code in [200, 201, 202]:
                logger.info(f"[BREVO EMAIL SUCCESS] Dispatched to {to_email} (Msg ID: {resp.json().get('messageId')})")
                return True
            else:
                logger.warning(f"[BREVO EMAIL ERROR] HTTP {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        logger.error(f"[BREVO EMAIL EXCEPTION] Failed to dispatch via Brevo: {str(e)}")
        return False

async def send_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    message: str,
    channel: str = "EMAIL",  # EMAIL, SMS, WHATSAPP, IN_APP
    category: str = "STATUS_UPDATE",
    metadata_info: Optional[Dict[str, Any]] = None
) -> Notification:
    """Creates a notification record, broadcasts multi-channel alert, and triggers Brevo email"""
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

    # Fetch user details to dispatch real Brevo email
    try:
        stmt_user = select(User).where(User.id == user_id)
        user_obj = (await db.execute(stmt_user)).scalar_one_or_none()
        if user_obj and user_obj.email:
            await send_brevo_transactional_email(
                to_email=user_obj.email,
                to_name=user_obj.full_name or "Citizen Applicant",
                subject=title,
                body_text=message,
                metadata=metadata_info
            )
    except Exception as e:
        logger.warning(f"[EMAIL DISPATCH SKIPPED] Could not fetch user email: {str(e)}")

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
