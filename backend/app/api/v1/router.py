from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.departments import router as departments_router
from app.api.v1.services import router as services_router
from app.api.v1.applications import router as applications_router
from app.api.v1.consents import router as consents_router
from app.api.v1.data_requests import router as data_requests_router
from app.api.v1.events import router as events_router
from app.api.v1.audit import router as audit_router
from app.api.v1.demo import router as demo_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(departments_router)
api_router.include_router(services_router)
api_router.include_router(applications_router)
api_router.include_router(consents_router)
api_router.include_router(data_requests_router)
api_router.include_router(events_router)
api_router.include_router(audit_router)
api_router.include_router(demo_router)
