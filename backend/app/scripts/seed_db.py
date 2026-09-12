import asyncio
import uuid
import datetime
from sqlalchemy import select
from app.core.db import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.core.resilience import resilience_manager
from app.db.models import (
    Role, Department, Service, User, CitizenProfile, Application, ApplicationEvent
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
            ),
            Department(
                id="dept_skills",
                code="MSINS",
                name="Skills & Innovation Society (MSInS)",
                description="Maharashtra State Innovation Society & Skill Development, Startup Seed Grants, ITI/Polytechnic Verification",
                api_base_url="http://localhost:8000/api/v1/adapters/skills",
                contact_email="nodal.msins@maharashtra.gov.in",
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
            ),
            Service(
                id="srv_msins_seed_grant",
                department_id="dept_skills",
                name="MSInS Startup Innovation Seed Grant",
                code="MSINS-GRANT-01",
                description="Early-stage startup funding grant for certified tech innovators and skilled diploma holders",
                required_data_sources=[
                    {
                        "department_id": "dept_revenue",
                        "data_type": "INCOME_CERTIFICATE",
                        "fields": ["annual_income", "certificate_number", "verification_status"]
                    },
                    {
                        "department_id": "dept_skills",
                        "data_type": "SKILL_CERTIFICATE",
                        "fields": ["trainee_id", "trade_course", "certification_level", "grade"]
                    }
                ],
                status="ACTIVE"
            ),
            Service(
                id="srv_skills_cert",
                department_id="dept_skills",
                name="ITI / Polytechnic Skill Certification",
                code="SKILLS-CERT-01",
                description="Verification of technical trade diploma and NSQF vocational certification",
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

        # MSInS / Skills Officer
        msins_email = "officer.msins@example.gov.in"
        existing_msins = await session.execute(select(User).where(User.email == msins_email))
        if not existing_msins.scalar_one_or_none():
            session.add(User(
                id=uuid.UUID("44444444-4444-4444-4444-444444444444"),
                email=msins_email,
                password_hash=password_hash,
                full_name="MSInS Innovation Officer",
                phone="+919876543214",
                role_id="DEPARTMENT_OFFICER",
                department_id="dept_skills",
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

        # 5. Seed Initial Sample Applications & Lifecycle Events for Instant Tracking Demo
        app1_num = "APP-2026-IND-00142"
        existing_app1 = await session.execute(select(Application).where(Application.application_number == app1_num))
        if not existing_app1.scalar_one_or_none():
            app1 = Application(
                id=uuid.UUID("a1111111-1111-1111-1111-111111111111"),
                application_number=app1_num,
                citizen_id=citizen_user.id,
                service_id="srv_ind_biz_license",
                department_id="dept_industries",
                application_data={
                    "business_name": "Sharma Precision Technologies Pvt Ltd",
                    "incorporation_date": "2024-02-15",
                    "income_certificate_number": "REV-2026-IN-88912",
                    "verified_annual_income": 420000,
                    "issuing_authority": "Revenue Dept Tahsildar",
                    "revenue_verification": {
                        "certificate_number": "REV-2026-IN-88912",
                        "annual_income": 420000,
                        "issuing_authority": "Tahsildar Mumbai Suburban",
                        "status": "VERIFIED"
                    }
                },
                status="APPROVED"
            )
            session.add(app1)
            await session.flush()

            events_app1 = [
                ApplicationEvent(
                    application_id=app1.id,
                    event_type="APPLICATION_CREATED",
                    actor_name="Rahul Sharma (Citizen)",
                    description="Application submitted online via MahaSetu Citizen Portal.",
                    metadata_info={"service": "Small Scale Business License", "channel": "WEB"}
                ),
                ApplicationEvent(
                    application_id=app1.id,
                    event_type="DATA_INTEROP_VERIFIED",
                    actor_name="MahaSetu Gateway",
                    description="Revenue Income Certificate #REV-2026-IN-88912 auto-verified via Revenue Dept Adapter.",
                    metadata_info={"income_cert": "REV-2026-IN-88912", "verified_income": 420000}
                ),
                ApplicationEvent(
                    application_id=app1.id,
                    event_type="IN_SCRUTINY",
                    actor_name="Nodal Industries Officer",
                    description="Application underwent desk verification. Verified all enterprise parameters.",
                    metadata_info={"desk_officer": "Nodal Industries Officer"}
                ),
                ApplicationEvent(
                    application_id=app1.id,
                    event_type="APPLICATION_APPROVED",
                    actor_name="Nodal Industries Officer",
                    description="Small Business Operating License granted and signed with cryptographic seal.",
                    metadata_info={"license_no": "IND-LIC-2026-9901", "valid_until": "2029-03-31"}
                )
            ]
            for ev in events_app1:
                session.add(ev)

        app2_num = "APP-2026-MSINS-00912"
        existing_app2 = await session.execute(select(Application).where(Application.application_number == app2_num))
        if not existing_app2.scalar_one_or_none():
            app2 = Application(
                id=uuid.UUID("a2222222-2222-2222-2222-222222222222"),
                application_number=app2_num,
                citizen_id=citizen_user.id,
                service_id="srv_msins_seed_grant",
                department_id="dept_skills",
                application_data={
                    "startup_name": "AeroSetu Robotics",
                    "cin_or_udyam": "UDYAM-MH-03-0099881",
                    "revenue_verification": {
                        "certificate_number": "REV-2026-IN-88912",
                        "annual_income": 420000,
                        "issuing_authority": "Tahsildar Mumbai Suburban",
                        "status": "VERIFIED"
                    },
                    "skills_verification": {
                        "trainee_id": "MSBTE-2024-MECH-4481",
                        "trade_course": "Advanced Mechatronics Diploma",
                        "certification_level": "NSQF Level 5",
                        "grade": "Distinction",
                        "issuing_board": "Maharashtra State Board of Technical Education"
                    }
                },
                status="APPROVED"
            )
            session.add(app2)
            await session.flush()

            events_app2 = [
                ApplicationEvent(
                    application_id=app2.id,
                    event_type="APPLICATION_CREATED",
                    actor_name="Rahul Sharma (Citizen)",
                    description="Application submitted for MSInS Early Stage Seed Grant (₹5,00,000).",
                    metadata_info={"grant_amount_inr": 500000}
                ),
                ApplicationEvent(
                    application_id=app2.id,
                    event_type="DATA_INTEROP_VERIFIED",
                    actor_name="MahaSetu Gateway",
                    description="Federated verification completed across Revenue (Income), MSBTE (Skills) and MSME (Udyam).",
                    metadata_info={"registries_verified": ["REV", "MSBTE", "MSME"]}
                ),
                ApplicationEvent(
                    application_id=app2.id,
                    event_type="AUTO_APPROVED_BY_POLICY_RULE",
                    actor_name="MahaSetu Policy Engine",
                    description="Auto-approved under MSInS Fast-Track Innovation Policy Rule (Verified Income < ₹8L + NSQF Diploma).",
                    metadata_info={"rule_id": "RULE_AUTO_APPROVE_SEED_GRANT"}
                )
            ]
            for ev in events_app2:
                session.add(ev)

        # Pre-warm local resilience cache replicas (Once-Only Principle)
        if citizen_user:
            resilience_manager.cached_responses[f"{citizen_user.id}:dept_revenue:INCOME_CERTIFICATE"] = {
                "raw_certificate_no": "REV-2026-IN-88912",
                "declared_annual_income": 420000.0,
                "income_slab": "MIDDLE_INCOME",
                "issuing_office": "Tehsildar Office (MahaBhulekh)",
                "applicant_full_name": "Rahul Sharma",
                "verification_status": "VERIFIED"
            }
            resilience_manager.cached_responses[f"{citizen_user.id}:dept_skills:SKILL_CERTIFICATE"] = {
                "trainee_id": "MSBTE-2023-9912",
                "trade_course": "Diploma in Advanced Mechatronics & Robotics",
                "certification_level": "NSQF Level 6",
                "grade": "DISTINCTION",
                "issuing_board": "Maharashtra State Board of Technical Education (MSBTE)",
                "trainee_name": "Rahul Sharma",
                "verification_status": "VERIFIED_VALID"
            }

        await session.commit()
    finally:
        if close_session:
            await session.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
