# MAHASETU — REST API Specifications & Contracts

## 1. Overview
Base URL: `/api/v1`  
Protocol: `HTTPS / HTTP`  
Content-Type: `application/json`  
Authentication Header: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 2. Authentication Endpoints

### 2.1 Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth Required:** None
- **Request Body:**
```json
{
  "email": "rahul.sharma@example.gov.in",
  "password": "Password@123"
}
```
- **Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "rahul.sharma@example.gov.in",
    "full_name": "Rahul Sharma",
    "role": "CITIZEN",
    "department_id": null
  }
}
```
- **Error Response (401 Unauthorized):**
```json
{
  "error": "AUTHENTICATION_FAILED",
  "message": "Invalid email or password"
}
```

### 2.2 Get Current User Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth Required:** `Bearer Token`
- **Success Response (200 OK):**
```json
{
  "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "email": "rahul.sharma@example.gov.in",
  "full_name": "Rahul Sharma",
  "phone": "+91 9876543210",
  "role": "CITIZEN",
  "citizen_profile": {
    "national_id_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    "address_line1": "Flat 402, Shiv Shahi Complex",
    "city": "Mumbai",
    "district": "Mumbai Suburban",
    "pincode": "400053"
  }
}
```

---

## 3. Department & Service Registry Endpoints

### 3.1 List All Registered Departments
- **Endpoint:** `GET /api/v1/departments`
- **Auth Required:** Optional / Public
- **Success Response (200 OK):**
```json
[
  {
    "id": "dept_revenue",
    "code": "REV",
    "name": "Revenue Department",
    "description": "Land records, income certificates, residence proofs",
    "contact_email": "support@revenue.maharashtra.gov.in",
    "status": "ACTIVE"
  },
  {
    "id": "dept_industries",
    "code": "IND",
    "name": "Industries Department",
    "description": "Business registrations, industrial licenses, MSME NOCs",
    "contact_email": "nodal@industries.maharashtra.gov.in",
    "status": "ACTIVE"
  }
]
```

### 3.2 List Services in Registry
- **Endpoint:** `GET /api/v1/services`
- **Query Params:** `department_id` (optional), `category` (optional)
- **Success Response (200 OK):**
```json
[
  {
    "id": "srv_ind_biz_license",
    "department_id": "dept_industries",
    "name": "Small Scale Business License",
    "code": "IND-BIZ-01",
    "description": "Issuance of industrial operational license for small scale enterprises",
    "required_data_sources": [
      {
        "department_id": "dept_revenue",
        "data_type": "INCOME_CERTIFICATE",
        "fields": ["annual_income", "certificate_no", "validity_until"]
      }
    ],
    "status": "ACTIVE"
  }
]
```

---

## 4. Consent Engine Endpoints

### 4.1 Create Consent Request
- **Endpoint:** `POST /api/v1/consents`
- **Auth Required:** `CITIZEN` or `DEPARTMENT_OFFICER`
- **Request Body:**
```json
{
  "requesting_department_id": "dept_industries",
  "providing_department_id": "dept_revenue",
  "service_id": "srv_ind_biz_license",
  "purpose": "Income verification for Small Scale Business License application",
  "requested_fields": ["annual_income", "certificate_no", "validity_until"],
  "valid_duration_hours": 24
}
```
- **Success Response (201 Created):**
```json
{
  "consent_id": "cst_82f1b0a2-4a11-4e2b-9e20-1a89c90f1234",
  "citizen_id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "requesting_department": "Industries Department",
  "providing_department": "Revenue Department",
  "purpose": "Income verification for Small Scale Business License application",
  "requested_fields": ["annual_income", "certificate_no", "validity_until"],
  "status": "PENDING",
  "created_at": "2026-09-08T21:47:00Z",
  "expires_at": "2026-09-09T21:47:00Z"
}
```

### 4.2 Approve Consent
- **Endpoint:** `POST /api/v1/consents/{id}/approve`
- **Auth Required:** `CITIZEN`
- **Success Response (200 OK):**
```json
{
  "consent_id": "cst_82f1b0a2-4a11-4e2b-9e20-1a89c90f1234",
  "status": "ACTIVE",
  "consent_token": "cnt_token_a90f8234bc12984712039481023948"
}
```

### 4.3 Deny Consent
- **Endpoint:** `POST /api/v1/consents/{id}/deny`
- **Auth Required:** `CITIZEN`
- **Success Response (200 OK):**
```json
{
  "consent_id": "cst_82f1b0a2-4a11-4e2b-9e20-1a89c90f1234",
  "status": "DENIED"
}
```

---

## 5. Interoperability & Data Exchange Endpoints

### 5.1 Execute Cross-Department Data Exchange
- **Endpoint:** `POST /api/v1/data-requests`
- **Auth Required:** `CITIZEN` or `DEPARTMENT_OFFICER`
- **Request Body:**
```json
{
  "consent_token": "cnt_token_a90f8234bc12984712039481023948",
  "providing_department_id": "dept_revenue",
  "data_type": "INCOME_CERTIFICATE"
}
```
- **Success Response (200 OK):**
```json
{
  "request_id": "req_88f910a2-11bc-48a0-99bb-772211904422",
  "status": "SUCCESS",
  "canonical_payload": {
    "certificate_number": "MH-REV-INC-2025-99821",
    "citizen_name": "Rahul Sharma",
    "annual_income": 450000.00,
    "income_category": "MIDDLE_INCOME",
    "issuing_authority": "Tehsildar Andheri East",
    "issued_date": "2025-04-15",
    "valid_until": "2026-03-31",
    "verification_status": "VERIFIED"
  },
  "transformed_at": "2026-09-08T21:47:05Z"
}
```
- **Error Response (403 Forbidden - Missing or Invalid Consent):**
```json
{
  "error": "CONSENT_REQUIRED",
  "message": "Consent token is invalid, expired, or does not grant scope 'INCOME_CERTIFICATE'"
}
```

---

## 6. Applications & Unified Tracking Endpoints

### 6.1 Submit Application
- **Endpoint:** `POST /api/v1/applications`
- **Auth Required:** `CITIZEN`
- **Request Body:**
```json
{
  "service_id": "srv_ind_biz_license",
  "department_id": "dept_industries",
  "application_data": {
    "enterprise_name": "Sharma Tech Enterprises",
    "category": "MSME_MICRO",
    "verified_income_cert": "MH-REV-INC-2025-99821",
    "annual_income_verified": 450000.00
  },
  "consent_ids": ["cst_82f1b0a2-4a11-4e2b-9e20-1a89c90f1234"]
}
```
- **Success Response (201 Created):**
```json
{
  "application_number": "MH-2026-000123",
  "service_name": "Small Scale Business License",
  "status": "SUBMITTED",
  "submitted_at": "2026-09-08T21:47:10Z"
}
```

### 6.2 Get Application Tracking Details
- **Endpoint:** `GET /api/v1/applications/{application_number}`
- **Auth Required:** `CITIZEN`, `DEPARTMENT_OFFICER`, or `SYSTEM_ADMIN`
- **Success Response (200 OK):**
```json
{
  "application_number": "MH-2026-000123",
  "service_name": "Small Scale Business License",
  "department": "Industries Department",
  "current_status": "IN_REVIEW",
  "timeline": [
    {
      "stage": "APPLICATION_SUBMITTED",
      "timestamp": "2026-09-08T21:47:10Z",
      "status": "COMPLETED",
      "actor": "Citizen (Rahul Sharma)"
    },
    {
      "stage": "REVENUE_DATA_VERIFIED",
      "timestamp": "2026-09-08T21:47:12Z",
      "status": "COMPLETED",
      "actor": "MahaSetu Middleware (Auto)"
    },
    {
      "stage": "DEPARTMENT_OFFICER_REVIEW",
      "timestamp": "2026-09-08T21:47:15Z",
      "status": "IN_PROGRESS",
      "actor": "Industries Nodal Officer"
    },
    {
      "stage": "FINAL_LICENSE_ISSUANCE",
      "timestamp": null,
      "status": "PENDING",
      "actor": "Industries Department"
    }
  ]
}
```

---

## 7. Audit & Observability Endpoints

### 7.1 Fetch Audit Logs
- **Endpoint:** `GET /api/v1/audit-logs`
- **Auth Required:** `SYSTEM_ADMIN`
- **Query Params:** `actor_id` (optional), `action` (optional), `limit` (default 50)
- **Success Response (200 OK):**
```json
{
  "total_records": 125,
  "audit_entries": [
    {
      "id": "aud_1029384756",
      "timestamp": "2026-09-08T21:47:05Z",
      "request_id": "req_88f910a2-11bc-48a0-99bb-772211904422",
      "actor_id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "actor_role": "CITIZEN",
      "action": "DATA_REQUEST_EXECUTED",
      "resource": "Revenue.IncomeCertificate",
      "status": "SUCCESS",
      "ip_address": "192.168.1.50"
    }
  ]
}
```

### 7.2 System Health Check
- **Endpoint:** `GET /api/v1/health`
- **Auth Required:** None
- **Success Response (200 OK):**
```json
{
  "status": "HEALTHY",
  "timestamp": "2026-09-08T21:47:00Z",
  "components": {
    "database": "CONNECTED",
    "redis": "CONNECTED",
    "revenue_adapter": "ONLINE",
    "education_adapter": "ONLINE",
    "industries_adapter": "ONLINE"
  }
}
```
