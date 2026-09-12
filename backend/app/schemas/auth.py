from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    phone: str
    role_id: str
    role: Optional[str] = None
    department_id: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class CitizenProfileData(BaseModel):
    national_id_hash: str
    date_of_birth: str
    gender: str
    address_line1: str
    city: str
    district: str
    pincode: str

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfileResponse
