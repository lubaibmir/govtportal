import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, Date, BigInteger, Integer, ForeignKey, JSON
)
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.core.db import Base

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36).
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return str(value) if dialect.name != 'postgresql' else value
        return str(uuid.UUID(str(value))) if dialect.name != 'postgresql' else uuid.UUID(str(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))

def utc_now():
    return datetime.now(timezone.utc)

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(32), primary_key=True)  # CITIZEN, DEPARTMENT_OFFICER, DEPARTMENT_ADMIN, SYSTEM_ADMIN
    name = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    users = relationship("User", back_populates="role")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String(64), primary_key=True)  # dept_revenue, dept_education, dept_industries
    code = Column(String(16), unique=True, nullable=False)  # REV, EDU, IND
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    api_base_url = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    status = Column(String(20), default="ACTIVE")

    users = relationship("User", back_populates="department")
    services = relationship("Service", back_populates="department")

class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(128), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    role_id = Column(String(32), ForeignKey("roles.id"), nullable=False)
    department_id = Column(String(64), ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    role = relationship("Role", back_populates="users")
    department = relationship("Department", back_populates="users")
    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False)

class CitizenProfile(Base):
    __tablename__ = "citizens"

    id = Column(GUID(), ForeignKey("users.id"), primary_key=True)
    national_id_hash = Column(String(64), unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(16), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)

    user = relationship("User", back_populates="citizen_profile")

class Service(Base):
    __tablename__ = "services"

    id = Column(String(64), primary_key=True)
    department_id = Column(String(64), ForeignKey("departments.id"), nullable=False)
    name = Column(String(128), nullable=False)
    code = Column(String(32), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    required_data_sources = Column(JSON, nullable=False)
    status = Column(String(20), default="ACTIVE")

    department = relationship("Department", back_populates="services")

class Consent(Base):
    __tablename__ = "consents"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    citizen_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    requesting_department_id = Column(String(64), ForeignKey("departments.id"), nullable=False)
    providing_department_id = Column(String(64), ForeignKey("departments.id"), nullable=False)
    service_id = Column(String(64), ForeignKey("services.id"), nullable=False)
    purpose = Column(Text, nullable=False)
    requested_fields = Column(JSON, nullable=False)
    consent_token = Column(String(128), unique=True, nullable=True)
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    expires_at = Column(DateTime(timezone=True), nullable=False)

class DataRequest(Base):
    __tablename__ = "data_requests"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    consent_id = Column(GUID(), ForeignKey("consents.id"), nullable=False)
    providing_department_id = Column(String(64), ForeignKey("departments.id"), nullable=False)
    data_type = Column(String(64), nullable=False)
    raw_response_hash = Column(String(64), nullable=False)
    status = Column(String(20), default="SUCCESS")
    created_at = Column(DateTime(timezone=True), default=utc_now)

class Application(Base):
    __tablename__ = "applications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    application_number = Column(String(32), unique=True, nullable=False, index=True)
    citizen_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    service_id = Column(String(64), ForeignKey("services.id"), nullable=False)
    department_id = Column(String(64), ForeignKey("departments.id"), nullable=False)
    application_data = Column(JSON, nullable=False)
    status = Column(String(32), default="SUBMITTED")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    application_id = Column(GUID(), ForeignKey("applications.id"), nullable=False)
    event_type = Column(String(64), nullable=False)
    actor_name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    metadata_info = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    request_id = Column(String(64), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True)
    actor_id = Column(GUID(), nullable=True)
    actor_role = Column(String(32), nullable=False)
    action = Column(String(64), nullable=False)
    resource = Column(String(128), nullable=False)
    result = Column(String(20), nullable=False)
    ip_address = Column(String(45), nullable=False)
    details = Column(JSON, nullable=True)
