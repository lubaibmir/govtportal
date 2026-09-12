from abc import ABC, abstractmethod
from typing import Dict, Any

class IDepartmentAdapter(ABC):
    @property
    @abstractmethod
    def department_id(self) -> str:
        pass

    @abstractmethod
    async def fetch_department_data(
        self,
        citizen_id: str,
        data_type: str,
        consent_token: str
    ) -> Dict[str, Any]:
        """Fetch raw departmental data payload from simulated external API"""
        pass
