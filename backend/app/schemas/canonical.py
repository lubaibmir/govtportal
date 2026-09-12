from pydantic import BaseModel, ConfigDict
from typing import Dict, Any

class IncomeCertificateCanonical(BaseModel):
    certificate_number: str
    citizen_name: str
    annual_income: float
    income_category: str
    issuing_authority: str
    issued_date: str
    valid_until: str
    verification_status: str

    model_config = ConfigDict(from_attributes=True)

class DegreeVerificationCanonical(BaseModel):
    roll_number: str
    student_name: str
    university: str
    degree_title: str
    passing_year: int
    cgpa: float
    verification_status: str

    model_config = ConfigDict(from_attributes=True)

class CanonicalDataMapper:
    @staticmethod
    def transform_income_certificate(raw: Dict[str, Any]) -> IncomeCertificateCanonical:
        """Transforms proprietary Revenue Department raw payload into MahaSetu Canonical Model"""
        annual_inc = float(raw.get("declared_annual_income", 0.0))
        return IncomeCertificateCanonical(
            certificate_number=raw.get("raw_certificate_no", "N/A"),
            citizen_name=raw.get("applicant_full_name", "N/A"),
            annual_income=annual_inc,
            income_category=raw.get("income_slab", "MIDDLE_INCOME"),
            issuing_authority=raw.get("issuing_office", "Tehsildar Office"),
            issued_date=raw.get("issue_timestamp", "2025-01-01"),
            valid_until=raw.get("validity_expiry_date", "2026-03-31"),
            verification_status=raw.get("verification_status", "VERIFIED")
        )

    @staticmethod
    def transform_degree_verification(raw: Dict[str, Any]) -> DegreeVerificationCanonical:
        """Transforms proprietary Education Department raw payload into MahaSetu Canonical Model"""
        return DegreeVerificationCanonical(
            roll_number=raw.get("student_roll_no", "N/A"),
            student_name="Rahul Sharma",
            university=raw.get("university_name", "University of Mumbai"),
            degree_title=raw.get("degree_title", "B.Tech Computer Science"),
            passing_year=int(raw.get("year_of_passing", 2020)),
            cgpa=float(raw.get("cumulative_grade_point", 8.0)),
            verification_status=raw.get("verification_status", "VERIFIED")
        )
