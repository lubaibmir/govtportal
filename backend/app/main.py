import uuid
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.redis import init_redis
from app.api.v1.router import api_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s"
)
logger = logging.getLogger("mahasetu.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing MahaSetu Gateway Middleware...")
    await init_redis()
    try:
        from app.scripts.seed_db import seed_data
        await seed_data()
        logger.info("MahaSetu DB tables & seed data initialized successfully.")
    except Exception as e:
        logger.warning(f"DB auto-seeding notice: {e}")
    yield
    logger.info("Shutting down MahaSetu Gateway Middleware...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Unified Government Interoperability & Service Delivery Platform Gateway Middleware",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Tracing Middleware (X-Request-ID & Latency Logging)
@app.middleware("http")
async def request_tracing_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", f"req_{uuid.uuid4().hex[:12]}")
    request.state.request_id = request_id
    start_time = time.time()

    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    logger.info(f"[{request_id}] {request.method} {request.url.path} -> {response.status_code} ({process_time:.2f}ms)")
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[{request_id}] Unhandled Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred in MahaSetu Gateway Middleware",
            "request_id": request_id
        }
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", include_in_schema=False)
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "OPERATIONAL",
        "docs": f"{settings.API_V1_STR}/docs"
    }
