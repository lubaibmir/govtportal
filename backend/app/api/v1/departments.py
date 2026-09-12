from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.db import get_db
from app.core.security import require_roles
from app.db.models import Department, User
from app.schemas.department import DepartmentCreate, DepartmentResponse

router = APIRouter(prefix="/departments", tags=["Government Departments"])

@router.get("", response_model=List[DepartmentResponse], summary="List All Government Departments")
async def list_departments(
    status: Optional[str] = "ACTIVE",
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Department)
    if status:
        stmt = stmt.where(Department.status == status)
    result = await db.execute(stmt)
    departments = result.scalars().all()
    return departments

@router.get("/{department_id}", response_model=DepartmentResponse, summary="Get Department Details")
async def get_department(
    department_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Department).where(Department.id == department_id)
    result = await db.execute(stmt)
    department = result.scalar_one_or_none()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID '{department_id}' not found"
        )
    return department

@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED, summary="Onboard New Government Department")
async def create_department(
    department_in: DepartmentCreate,
    current_user: User = Depends(require_roles(["SYSTEM_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Department).where(Department.id == department_in.id)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department ID '{department_in.id}' already exists"
        )

    new_dept = Department(
        id=department_in.id,
        code=department_in.code,
        name=department_in.name,
        description=department_in.description,
        api_base_url=department_in.api_base_url,
        contact_email=department_in.contact_email,
        status=department_in.status
    )
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)
    return new_dept
