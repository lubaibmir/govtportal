import asyncio
from typing import Dict, Any
from app.adapters.base import IDepartmentAdapter
from app.core.config import settings

class RevenueAdapter(IDepartmentAdapter):
    @property
    def department_id(self) -> str:
        return "dept_revenue"

    async def fetch_department_data(
        self,
        citizen_id: str,
        data_type: str,
        consent_token: str
    ) -> Dict[str, Any]:
        # Simulate realistic external REST API network latency
        if settings.MOCK_ADAPTER_LATENCY_MS > 0:
            await asyncio.sleep(settings.MOCK_ADAPTER_LATENCY_MS / 1000.0)

        if data_type == "INCOME_CERTIFICATE":
            return {
                "dept_system": "MAHA_REVENUE_REGISTRY_V2",
                "raw_certificate_no": "MH-REV-INC-2025-99821",
                "applicant_full_name": "Rahul Sharma",
                "declared_annual_income": "450000.00",
                "income_slab": "MIDDLE_INCOME",
                "issuing_office": "Tehsildar Andheri East",
                "issue_timestamp": "2025-04-15",
                "validity_expiry_date": "2026-03-31",
                "digital_seal_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "verification_status": "VERIFIED_VALID"
            }
        elif data_type == "RESIDENCE_PROOF":
            return {
                "dept_system": "MAHA_REVENUE_REGISTRY_V2",
                "raw_certificate_no": "MH-REV-RES-2025-11029",
                "resident_name": "Rahul Sharma",
                "property_address": "Flat 402, Shiv Shahi Complex, Andheri East, Mumbai",
                "district_code": "400053",
                "years_of_residence": 12,
                "verification_status": "VERIFIED_VALID"
            }
        else:
            raise ValueError(f"Revenue Department Adapter does not support data_type '{data_type}'")
