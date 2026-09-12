from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class RequiredDataSource(BaseModel):
    department_id: str
    data_type: str
    fields: List[str]

class ServiceBase(BaseModel):
    department_id: str
    name: str
    code: str
    description: str
    required_data_sources: List[RequiredDataSource] = []
    status: str = "ACTIVE"

class ServiceCreate(ServiceBase):
    id: str

class ServiceResponse(ServiceBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
