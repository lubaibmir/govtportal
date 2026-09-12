import json
import logging
import datetime
from typing import Dict, Any
from app.core.redis import get_redis

logger = logging.getLogger("mahasetu.events")

STREAM_KEY = "mahasetu:event_stream"

async def publish_event(
    event_type: str,
    actor_name: str,
    description: str,
    payload: Dict[str, Any]
):
    """Publish event to Redis Streams event bus with fallback logging"""
    event_data = {
        "event_type": event_type,
        "actor_name": actor_name,
        "description": description,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "payload": json.dumps(payload)
    }

    try:
        redis_client = await get_redis()
        if redis_client:
            await redis_client.xadd(STREAM_KEY, event_data)
            logger.info(f"Published Event '{event_type}' to Redis Stream '{STREAM_KEY}'")
        else:
            logger.info(f"[EVENT BUS] '{event_type}': {description}")
    except Exception as e:
        logger.warning(f"Failed to publish event to Redis Stream ({e}). Logged locally.")
