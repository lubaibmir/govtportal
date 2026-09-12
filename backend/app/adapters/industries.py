import asyncio
from typing import Dict, Any
from app.adapters.base import IDepartmentAdapter
from app.core.config import settings

class IndustriesAdapter(IDepartmentAdapter):
    @property
    def department_id(self) -> str:
        return "dept_industries"

    async def fetch_department_data(
        self,
        citizen_id: str,
        data_type: str,
        consent_token: str
    ) -> Dict[str, Any]:
        if settings.MOCK_ADAPTER_LATENCY_MS > 0:
            await asyncio.sleep(settings.MOCK_ADAPTER_LATENCY_MS / 1000.0)

        if data_type == "BUSINESS_LICENSE":
            return {
                "dept_system": "MAHA_INDUSTRIES_MAITRI_PORTAL",
                "registration_no": "IND-MSME-2024-0091",
                "enterprise_name": "Sharma Tech Enterprises",
                "category": "MICRO_ENTERPRISE",
                "compliance_status": "ACTIVE_COMPLIANT"
            }
        else:
            raise ValueError(f"Industries Department Adapter does not support data_type '{data_type}'")
