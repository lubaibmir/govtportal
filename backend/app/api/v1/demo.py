from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db, engine, Base
from app.scripts.seed_db import seed_data

router = APIRouter(prefix="/demo", tags=["SIH 2026 Demo Mode"])

@router.post("/reset", summary="Reset Demo Database & Re-seed Demo Personas")
async def reset_demo_database(
    db: AsyncSession = Depends(get_db)
):
    try:
        # Re-create tables & seed default data
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
            
        await seed_data(session=db)
        return {
            "status": "SUCCESS",
            "message": "MahaSetu Demo Database cleanly reset and re-seeded for SIH 2026 Presentation.",
            "personas": [
                {"role": "CITIZEN", "email": "rahul.sharma@example.gov.in"},
                {"role": "REVENUE_OFFICER", "email": "officer.revenue@example.gov.in"},
                {"role": "INDUSTRIES_OFFICER", "email": "officer.industries@example.gov.in"},
                {"role": "SYSTEM_ADMIN", "email": "admin.mahagov@example.gov.in"}
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Demo reset failed: {str(e)}"
        )
