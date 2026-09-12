import asyncio
from typing import Dict, Any
from app.adapters.base import IDepartmentAdapter
from app.core.config import settings

class SkillsAdapter(IDepartmentAdapter):
    """
    Simulated Adapter for Maharashtra State Innovation Society & Department of Skills,
    Employment, Entrepreneurship and Innovation (MSSDS / MahaSwayam Portal).
    """
    @property
    def department_id(self) -> str:
        return "dept_skills"

    async def fetch_department_data(
        self,
        citizen_id: str,
        data_type: str,
        consent_token: str
    ) -> Dict[str, Any]:
        # Simulate realistic external REST API network latency
        if settings.MOCK_ADAPTER_LATENCY_MS > 0:
            await asyncio.sleep(settings.MOCK_ADAPTER_LATENCY_MS / 1000.0)

        if data_type == "SKILL_CERTIFICATE":
            return {
                "dept_system": "MAHA_SKILL_DEVELOPMENT_REGISTRY_V1",
                "trainee_id": "MH-SKILL-2024-88319",
                "trainee_name": "Rahul Sharma",
                "institute_name": "Government Polytechnic & ITI Pune",
                "trade_course": "Advanced Industrial Automation & Embedded IoT Systems",
                "certification_level": "NSQF Level 6",
                "year_of_completion": 2023,
                "grade": "DISTINCTION",
                "issuing_board": "Maharashtra State Board of Technical Education (MSBTE)",
                "verification_status": "VERIFIED_VALID",
                "digital_registry_hash": "a7f92b435c8e19d7b409a8342c129e4d58129cba83b482a17f694e9f3b58402a"
            }
        elif data_type == "ROJGAR_REGISTRATION":
            return {
                "dept_system": "MAHA_SWAYAM_ROJGAR_VAHINI",
                "registration_no": "MH-ROJ-PUN-2023-44912",
                "candidate_name": "Rahul Sharma",
                "employment_status": "ENTREPRENEUR_ASPIRANT",
                "registered_district": "Pune",
                "validity_year": 2026,
                "verification_status": "ACTIVE_REGISTERED"
            }
        else:
            raise ValueError(f"Skills Department Adapter does not support data_type '{data_type}'")
