import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.core.db import engine, Base, AsyncSessionLocal
from app.scripts.seed_db import seed_data

async def main():
    print("============================================================")
    print("           MAHASETU — DEMO STATE RESET SCRIPT              ")
    print("============================================================")
    print("Resetting database schema & re-seeding demo personas...")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        await seed_data(session=session)
        
    print("\n[SUCCESS] Demo reset complete!")
    print("Available Demo Personas:")
    print("  1. Citizen:            rahul.sharma@example.gov.in (Password@123)")
    print("  2. Revenue Officer:    officer.revenue@example.gov.in (Password@123)")
    print("  3. Industries Officer: officer.industries@example.gov.in (Password@123)")
    print("  4. System Admin:       admin.mahagov@example.gov.in (Password@123)")
    print("============================================================")

if __name__ == "__main__":
    asyncio.run(main())
