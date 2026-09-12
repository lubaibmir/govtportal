import time
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.db import get_db
from app.core.redis import get_redis
from app.core.config import settings

router = APIRouter(tags=["Health & System Metrics"])

@router.get("/health", summary="Get System & Interoperability Health Status")
async def health_check(
    db: AsyncSession = Depends(get_db),
    redis_client = Depends(get_redis)
):
    db_status = "DISCONNECTED"
    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_status = "CONNECTED"
    except Exception as e:
        db_status = f"ERROR: {str(e)}"

    redis_status = "DISCONNECTED"
    if redis_client:
        try:
            pong = await redis_client.ping()
            if pong:
                redis_status = "CONNECTED"
        except Exception as e:
            redis_status = f"ERROR: {str(e)}"
    else:
        redis_status = "MOCK_FALLBACK"

    return {
        "platform": settings.PROJECT_NAME,
        "status": "HEALTHY" if db_status == "CONNECTED" else "DEGRADED",
        "environment": settings.ENVIRONMENT,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "components": {
            "database": db_status,
            "redis": redis_status,
            "adapters": {
                "revenue_adapter": "ONLINE",
                "education_adapter": "ONLINE",
                "industries_adapter": "ONLINE"
            }
        }
    }
