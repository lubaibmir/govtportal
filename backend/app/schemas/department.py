from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List

class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    api_base_url: str
    contact_email: EmailStr
    status: str = "ACTIVE"

class DepartmentCreate(DepartmentBase):
    id: str

class DepartmentResponse(DepartmentBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
