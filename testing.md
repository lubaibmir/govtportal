# MAHASETU — Testing Strategy & Verification Procedures

## 1. Overview & Test Philosophy
MahaSetu testing ensures zero data leaks, complete backend consent enforcement, strict RBAC compliance, and reliable departmental data transformations before demonstration.

---

## 2. Test Suites Structure

```
backend/tests/
├── unit/
│   ├── test_auth.py            # Password hashing, JWT token issue/verify
│   ├── test_consent_engine.py  # Consent state machine & hash verification
│   ├── test_canonical_mapper.py# Format transformations (Dept -> Canonical)
│   └── test_rbac.py            # Role permission matrix rules
├── integration/
│   ├── test_revenue_adapter.py # Mock Revenue API integration
│   ├── test_data_exchange.py   # Full consent -> data fetch pipeline
│   └── test_applications.py    # Application submission & tracking
└── e2e/
    └── test_sih_demo_flow.py   # End-to-end multi-department demo flow
```

---

## 3. Core Test Scenarios Matrix

| Test ID | Scenario Description | Expected Outcome | Mandatory Status |
|---------|----------------------|------------------|------------------|
| **TS-01** | **Citizen Login** | Valid credentials return JWT access token & user profile | PASS |
| **TS-02** | **Citizen Browses Service Catalogue** | Returns list of registered services with required source departments | PASS |
| **TS-03** | **Application Initiation Without Consent** | System identifies required Revenue data & blocks direct retrieval | PASS |
| **TS-04** | **Consent Denied by Citizen** | Consent status transitions to `DENIED`; data request fails with HTTP 403 | PASS |
| **TS-05** | **Consent Granted by Citizen** | Consent status transitions to `ACTIVE`; signed consent token issued | PASS |
| **TS-06** | **Authenticated Data Exchange** | Revenue Adapter called -> Payload mapped to `IncomeCertificateCanonical` | PASS |
| **TS-07** | **Application Auto-Population** | Verified Revenue income data pre-fills application form fields | PASS |
| **TS-08** | **Application State Machine Transition** | State advances from `SUBMITTED` to `IN_REVIEW` -> `APPROVED` | PASS |
| **TS-09** | **Simulated Department Timeout / Outage** | Middleware gracefully catches timeout and returns standardized error | PASS |
| **TS-10** | **Invalid / Expired JWT Access Token** | API Gateway returns HTTP 401 Unauthorized | PASS |
| **TS-11** | **Unauthorized Role Access Attempt** | Citizen attempting to access `/api/v1/audit-logs` returns HTTP 403 | PASS |
| **TS-12** | **Immutable Audit Log Generation** | `CONSENT_GRANTED` and `DATA_REQUESTED` events write to `audit_logs` table | PASS |
| **TS-13** | **Real-Time Notification Event Stream** | Redis Streams publishes `APPLICATION_CREATED` event consumed by listener | PASS |

---

## 4. Test Commands Reference

### Running Backend Unit & Integration Tests
```bash
# Navigate to backend directory
cd backend

# Execute all Pytest test cases
pytest -v

# Execute specific unit test module
pytest tests/unit/test_consent_engine.py -v

# Generate test coverage report
pytest --cov=app tests/
```

### Running API Integration Tests via HTTP Client
```bash
# Verify Health Endpoint
curl -X GET http://localhost:8000/api/v1/health

# Verify Login Endpoint
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rahul.sharma@example.gov.in", "password": "Password@123"}'
```
