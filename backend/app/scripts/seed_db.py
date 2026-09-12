import asyncio
import uuid
import datetime
from sqlalchemy import select
from app.core.db import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.db.models import (
    Role, Department, Service, User, CitizenProfile
)

async def seed_data(session=None):
    close_session = False
    if session is None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        session = AsyncSessionLocal()
        close_session = True

    try:
        # 1. Seed Roles
        roles_data = [
            Role(id="CITIZEN", name="Citizen", description="Public citizen account"),
            Role(id="DEPARTMENT_OFFICER", name="Department Officer", description="Nodal department officer"),
            Role(id="DEPARTMENT_ADMIN", name="Department Admin", description="Department administrator"),
            Role(id="SYSTEM_ADMIN", name="System Admin", description="MahaSetu platform administrator")
        ]
        for role in roles_data:
            existing = await session.execute(select(Role).where(Role.id == role.id))
            if not existing.scalar_one_or_none():
                session.add(role)

        # 2. Seed Departments
        departments_data = [
            Department(
                id="dept_revenue",
                code="REV",
                name="Revenue Department",
                description="Land records, income certificates, residence proofs",
                api_base_url="http://localhost:8000/api/v1/adapters/revenue",
                contact_email="nodal.revenue@maharashtra.gov.in",
                status="ACTIVE"
            ),
            Department(
                id="dept_education",
                code="EDU",
                name="Education Department",
                description="Student records, marksheets, degree verifications",
                api_base_url="http://localhost:8000/api/v1/adapters/education",
                contact_email="nodal.education@maharashtra.gov.in",
                status="ACTIVE"
            ),
            Department(
                id="dept_industries",
                code="IND",
                name="Industries Department",
                description="Business registrations, industrial licenses, MSME NOCs",
                api_base_url="http://localhost:8000/api/v1/adapters/industries",
                contact_email="nodal.industries@maharashtra.gov.in",
                status="ACTIVE"
            )
        ]
        for dept in departments_data:
            existing = await session.execute(select(Department).where(Department.id == dept.id))
            if not existing.scalar_one_or_none():
                session.add(dept)

        await session.commit()

        # 3. Seed Services
        services_data = [
            Service(
                id="srv_rev_income_cert",
                department_id="dept_revenue",
                name="Income Certificate Verification",
                code="REV-INC-01",
                description="Official verification of annual household income certificate",
                required_data_sources=[],
                status="ACTIVE"
            ),
            Service(
                id="srv_ind_biz_license",
                department_id="dept_industries",
                name="Small Scale Business License",
                code="IND-BIZ-01",
                description="Issuance of industrial operational license for small scale enterprises",
                required_data_sources=[
                    {
                        "department_id": "dept_revenue",
                        "data_type": "INCOME_CERTIFICATE",
                        "fields": ["annual_income", "certificate_no", "validity_until"]
                    }
                ],
                status="ACTIVE"
            ),
            Service(
                id="srv_edu_degree_verify",
                department_id="dept_education",
                name="Higher Education Degree Verification",
                code="EDU-DEG-01",
                description="Verification of university degree certificate and marksheet",
                required_data_sources=[],
                status="ACTIVE"
            )
        ]
        for srv in services_data:
            existing = await session.execute(select(Service).where(Service.id == srv.id))
            if not existing.scalar_one_or_none():
                session.add(srv)

        # 4. Seed Users
        password_hash = get_password_hash("Password@123")

        # Citizen User: Rahul Sharma
        citizen_email = "rahul.sharma@example.gov.in"
        existing_citizen = await session.execute(select(User).where(User.email == citizen_email))
        citizen_user = existing_citizen.scalar_one_or_none()
        
        if not citizen_user:
            citizen_user = User(
                id=uuid.UUID("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"),
                email=citizen_email,
                password_hash=password_hash,
                full_name="Rahul Sharma",
                phone="+919876543210",
                role_id="CITIZEN",
                department_id=None,
                is_active=True
            )
            session.add(citizen_user)
            await session.flush()

            profile = CitizenProfile(
                id=citizen_user.id,
                national_id_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
                date_of_birth=datetime.date(1994, 6, 15),
                gender="MALE",
                address_line1="Flat 402, Shiv Shahi Complex",
                city="Mumbai",
                district="Mumbai Suburban",
                pincode="400053"
            )
            session.add(profile)

        # Revenue Officer
        rev_email = "officer.revenue@example.gov.in"
        existing_rev = await session.execute(select(User).where(User.email == rev_email))
        if not existing_rev.scalar_one_or_none():
            session.add(User(
                id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
                email=rev_email,
                password_hash=password_hash,
                full_name="Tehsildar Revenue Officer",
                phone="+919876543211",
                role_id="DEPARTMENT_OFFICER",
                department_id="dept_revenue",
                is_active=True
            ))

        # Industries Officer
        ind_email = "officer.industries@example.gov.in"
        existing_ind = await session.execute(select(User).where(User.email == ind_email))
        if not existing_ind.scalar_one_or_none():
            session.add(User(
                id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
                email=ind_email,
                password_hash=password_hash,
                full_name="Nodal Industries Officer",
                phone="+919876543212",
                role_id="DEPARTMENT_OFFICER",
                department_id="dept_industries",
                is_active=True
            ))

        # System Admin
        admin_email = "admin.mahagov@example.gov.in"
        existing_admin = await session.execute(select(User).where(User.email == admin_email))
        if not existing_admin.scalar_one_or_none():
            session.add(User(
                id=uuid.UUID("33333333-3333-3333-3333-333333333333"),
                email=admin_email,
                password_hash=password_hash,
                full_name="MahaSetu System Admin",
                phone="+919876543213",
                role_id="SYSTEM_ADMIN",
                department_id=None,
                is_active=True
            ))

        await session.commit()
    finally:
        if close_session:
            await session.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
