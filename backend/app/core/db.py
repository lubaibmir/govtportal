import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("mahasetu.db")

# Use DATABASE_URL from settings or sqlite fallback for local dev
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Default to SQLite for zero-config local dev unless USE_POSTGRES=1
if "postgresql" in db_url and os.getenv("USE_POSTGRES", "0") != "1":
    db_url = "sqlite+aiosqlite:///./mahasetu.db"

def get_engine(url: str):
    connect_args = {}
    if "sqlite" in url:
        connect_args = {"check_same_thread": False}
    return create_async_engine(
        url,
        echo=False,
        future=True,
        connect_args=connect_args
    )

engine = get_engine(db_url)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
