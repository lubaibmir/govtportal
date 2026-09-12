from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.db import get_db
from app.core.audit import create_audit_log
from app.core.security import (
    verify_password,
    create_access_token,
    get_current_user
)
from app.db.models import User, CitizenProfile
from app.schemas.auth import LoginRequest, TokenResponse, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication & SSO"])

@router.post("/login", response_model=TokenResponse, summary="Login with Email & Password")
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == login_data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role_id,
        "department_id": user.department_id
    }
    access_token = create_access_token(token_payload, expires_delta=access_token_expires)

    await create_audit_log(
        db=db,
        action="USER_LOGIN",
        resource="/api/v1/auth/login",
        actor_role=user.role_id,
        actor_id=user.id,
        details={"email": user.email, "full_name": user.full_name}
    )

    user_profile = UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role_id=user.role_id,
        role=user.role_id,
        department_id=user.department_id,
        is_active=user.is_active
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_profile
    )

@router.get("/me", response_model=dict, summary="Get Current Authenticated User Profile")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_dict = {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role_id,
        "department_id": current_user.department_id,
        "is_active": current_user.is_active,
        "citizen_profile": None
    }

    if current_user.role_id == "CITIZEN":
        stmt = select(CitizenProfile).where(CitizenProfile.id == current_user.id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        if profile:
            user_dict["citizen_profile"] = {
                "national_id_hash": profile.national_id_hash,
                "date_of_birth": str(profile.date_of_birth),
                "gender": profile.gender,
                "address_line1": profile.address_line1,
                "city": profile.city,
                "district": profile.district,
                "pincode": profile.pincode
            }

    return user_dict
