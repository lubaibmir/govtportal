import asyncio
from typing import Dict, Any
from app.adapters.base import IDepartmentAdapter
from app.core.config import settings

class EducationAdapter(IDepartmentAdapter):
    @property
    def department_id(self) -> str:
        return "dept_education"

    async def fetch_department_data(
        self,
        citizen_id: str,
        data_type: str,
        consent_token: str
    ) -> Dict[str, Any]:
        if settings.MOCK_ADAPTER_LATENCY_MS > 0:
            await asyncio.sleep(settings.MOCK_ADAPTER_LATENCY_MS / 1000.0)

        if data_type == "DEGREE_VERIFICATION":
            return {
                "dept_system": "MAHA_HIGHER_EDU_PORTAL",
                "university_name": "University of Mumbai",
                "degree_title": "Bachelor of Technology in Computer Engineering",
                "student_roll_no": "MU-2016-CS-8891",
                "year_of_passing": 2020,
                "cumulative_grade_point": 8.75,
                "degree_certificate_no": "MU-DEG-2020-55410",
                "verification_status": "AUTHENTICATED"
            }
        else:
            raise ValueError(f"Education Department Adapter does not support data_type '{data_type}'")
