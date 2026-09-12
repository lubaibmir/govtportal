import logging
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("mahasetu.redis")

redis_client: aioredis.Redis = None

async def init_redis():
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        await redis_client.ping()
        logger.info("Connected to Redis successfully.")
    except Exception as e:
        logger.warning(f"Redis connection failed ({e}). Operating in memory/mock fallback mode.")
        redis_client = None

async def get_redis():
    return redis_client
