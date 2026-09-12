from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_db
from app.core.security import require_roles
from app.db.models import Service, User
from app.schemas.service import ServiceCreate, ServiceResponse

router = APIRouter(prefix="/services", tags=["Service Registry & Discovery"])

@router.get("", response_model=List[ServiceResponse], summary="List Registered Government Services")
async def list_services(
    department_id: Optional[str] = None,
    status: Optional[str] = "ACTIVE",
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Service)
    if department_id:
        stmt = stmt.where(Service.department_id == department_id)
    if status:
        stmt = stmt.where(Service.status == status)
    
    result = await db.execute(stmt)
    services = result.scalars().all()
    return services

@router.get("/{service_id}", response_model=ServiceResponse, summary="Get Registered Service Details")
async def get_service(
    service_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Service).where(Service.id == service_id)
    result = await db.execute(stmt)
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service with ID '{service_id}' not found in registry"
        )
    return service

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED, summary="Register Service in Service Registry")
async def create_service(
    service_in: ServiceCreate,
    current_user: User = Depends(require_roles(["DEPARTMENT_ADMIN", "SYSTEM_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Service).where(Service.id == service_in.id)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Service ID '{service_in.id}' already exists in registry"
        )

    new_service = Service(
        id=service_in.id,
        department_id=service_in.department_id,
        name=service_in.name,
        code=service_in.code,
        description=service_in.description,
        required_data_sources=[ds.model_dump() for ds in service_in.required_data_sources],
        status=service_in.status
    )
    db.add(new_service)
    await db.commit()
    await db.refresh(new_service)
    return new_service
