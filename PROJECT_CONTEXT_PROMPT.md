# 🚀 MAHASETU — Master AI Context & Project Blueprint Prompt

> **Instructions for the AI Assistant:**
> You are receiving the complete architecture, folder structure, UI layout, data model, API contracts, security mechanisms, and implementation details for **MAHASETU** — a Government-to-Citizen (G2C) and Government-to-Government (G2G) Interoperability Gateway & Consent-Based Data Exchange Platform built for Smart India Hackathon (SIH 2026).
> 
> Use this context to answer questions, write code, refactor components, add new features, debug issues, or generate documentation for this project. Maintain full consistency with the established patterns, schemas, folder structure, and design choices detailed below.

---

## 📌 1. Project Overview & Objective

- **Project Name:** MAHASETU (महासेतु — *The Unified Governance Data Bridge*)
- **Domain / Theme:** Smart India Hackathon (SIH 2026) — Government & G2C / G2G Interoperability Middleware
- **Core Mission:** Eliminate repetitive document submissions by citizens across government departments by establishing a secure, consent-based, canonical data exchange gateway connecting disparate departmental silos (Revenue, Education, Industries, etc.).
- **Key Capability:** When a citizen applies for a service in Department B (e.g. Industries Business License), MahaSetu requests verified data from Department A (e.g. Revenue Income Certificate) with the citizen's explicit digital consent, auto-populating application forms and embedding cryptographic verification hashes into the workflow.

---

## 📁 2. Complete Folder & File Directory Structure

```
govtportal/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application entrypoint, CORS, routes & exception handlers
│   │   ├── adapters/                   # Mock Integration Adapters for Govt Dept Systems
│   │   │   ├── __init__.py
│   │   │   ├── base.py                 # IDepartmentAdapter abstract base class
│   │   │   ├── revenue.py              # Revenue Dept Adapter (Income & Residence details)
│   │   │   ├── education.py            # Education Dept Adapter (Marksheet & Degree verification)
│   │   │   └── industries.py           # Industries Dept Adapter (Business License verification)
│   │   ├── api/                        # REST API Router Modules (V1)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                 # POST /auth/login, GET /auth/me
│   │   │   ├── departments.py          # GET/POST /departments
│   │   │   ├── services.py             # GET/POST /services
│   │   │   ├── applications.py         # POST /applications, GET /applications, GET /track/{app_num}
│   │   │   ├── consents.py             # POST /consents, /approve, /deny, /revoke, GET /consents
│   │   │   ├── data_requests.py        # POST /data-requests (Interop Gateway)
│   │   │   ├── events.py               # GET /events/applications/{app_num}
│   │   │   ├── audit_logs.py           # GET /audit-logs
│   │   │   └── demo.py                 # POST /demo/reset
│   │   ├── core/                       # Platform Utilities & Core Business Logic
│   │   │   ├── config.py               # Settings, env vars (Pydantic BaseSettings)
│   │   │   ├── security.py             # Password hashing (Argon2/PBKDF2), JWT encode/decode, RBAC
│   │   │   ├── events.py               # Redis Streams event bus publisher & subscriber
│   │   │   └── audit.py                # Immutable DB audit logging helper
│   │   ├── db/                         # Database Configuration & ORM Models
│   │   │   ├── db.py                   # Async SQLAlchemy engine, session maker, SQLite/PostgreSQL fallback
│   │   │   ├── models.py               # SQLAlchemy ORM definitions (Users, Roles, Citizens, Consents, etc.)
│   │   │   └── seed.py                 # Seed script for demo users, depts, services, and default applications
│   │   ├── schemas/                    # Pydantic Schemas & Data Models
│   │   │   ├── auth.py                 # Token, LoginRequest, UserOut
│   │   │   ├── canonical.py            # Canonical Data Model (CDM) mappers & schemas
│   │   │   ├── application.py          # ApplicationCreate, ApplicationOut, StateTransition
│   │   │   ├── consent.py              # ConsentCreate, ConsentOut
│   │   │   └── audit.py                # AuditLogOut schema
│   │   └── scripts/
│   │       └── reset_demo.py           # CLI script for resetting demo state
│   ├── tests/                          # Automated Pytest Test Suites (100% Pass)
│   │   ├── conftest.py                 # Async client fixtures & test DB setup
│   │   ├── test_health.py              # Health check tests
│   │   ├── test_auth.py                # Login & JWT RBAC tests
│   │   ├── test_services.py            # Department & Service Registry tests
│   │   ├── test_applications.py        # Application creation tests
│   │   ├── test_consents.py            # Consent state machine & token generation tests
│   │   ├── test_interoperability.py    # Cross-dept adapter & CDM tests
│   │   ├── test_workflow.py            # Status transition state machine & event stream tests
│   │   ├── test_tracking.py            # Application timeline tracking tests
│   │   ├── test_officer_admin.py       # Officer review & Admin dashboard API tests
│   │   ├── test_audit_security.py      # Security headers & DB audit log tests
│   │   └── test_edge_cases.py          # Scope mismatch, consent expired/denied error tests
│   ├── Dockerfile
│   └── requirements.txt                # FastAPI, SQLAlchemy, asyncpg, aioredis, pyjwt, passlib, pytest
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── main.tsx                    # React DOM root entry
│   │   ├── App.tsx                     # Main layout router & role-based dashboard renderer
│   │   ├── index.css                   # Tailwind CSS directives, glassmorphism & animation tokens
│   │   ├── components/                 # React UI Components
│   │   │   ├── Navbar.tsx              # Brand header, persona switcher dropdown, active role badge
│   │   │   ├── Footer.tsx              # Govt portal footer & system security notices
│   │   │   ├── LoginModal.tsx          # Interactive login dialog with 4 quick-fill persona buttons
│   │   │   ├── ServiceCatalogue.tsx    # Govt service discovery cards with dept filtering
│   │   │   ├── CitizenDashboard.tsx    # Citizen application portal, identity card & application history
│   │   │   ├── ConsentModal.tsx        # Dynamic data consent request modal with purpose & field list
│   │   │   ├── ConsentCenter.tsx       # Active consent management & revocation center
│   │   │   ├── ApplicationTracking.tsx # Public application stepper & audit log timeline viewer
│   │   │   ├── OfficerDashboard.tsx    # Dept Officer queue, application drawer & data evidence inspector
│   │   │   ├── AdminDashboard.tsx      # System Admin analytics, gateway metrics & Interop traffic matrix
│   │   │   └── AuditLogExplorer.tsx    # Cryptographic audit log inspector & raw JSON viewer
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # Global auth state, user persona, token storage & persona switching
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios HTTP client instance with JWT auto-injection
│   │   │   ├── authService.ts          # Auth API calls
│   │   │   ├── serviceRegistry.ts      # Dept & Service API calls
│   │   │   ├── applicationService.ts   # Application CRUD & state transition calls
│   │   │   ├── consentService.ts       # Consent grant/revoke API calls
│   │   │   ├── dataExchangeService.ts  # Cross-department interop gateway calls
│   │   │   ├── trackingService.ts      # Unified timeline tracking API calls
│   │   │   └── auditService.ts         # System audit log API calls
│   │   └── types/                      # TypeScript Interface Definitions
│   │       ├── index.ts                # Application, Consent, User, Service, Department interfaces
│   │       └── canonical.ts            # Canonical data types
│   ├── package.json                    # React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios
│   ├── tailwind.config.js              # Custom theme, colors (emerald, slate, amber, indigo), animations
│   ├── tsconfig.json
│   ├── vite.config.ts                  # Vite build config with backend proxy (`/api` -> `localhost:8000`)
│   └── Dockerfile
├── scripts/
│   └── reset_demo.py                   # Demo state reset script
├── docker-compose.yml                  # Multi-container setup (PostgreSQL 16, Redis 7, Backend, Frontend)
├── .env.example / .env
├── architecture.md                     # High-level architecture & sequence diagrams
├── database.md                         # Database schema ERD & SQL table specs
├── api_contracts.md                    # REST API OpenAPI contracts
├── decisions.md                        # Architectural Decision Records (ADRs)
├── requirements.md                     # SIH 2026 requirements trace
├── progress.md                         # Master phase checklist (Phases 0-13 completed)
├── security.md                         # Security posture, JWT, RBAC & audit policies
├── setup.md                            # Installation & running instructions
├── testing.md                          # Test execution guide & results
└── demo.md                             # 5-7 minute SIH judge presentation script
```

---

## 🛠️ 3. Technology Stack & Technical Architecture

### **Frontend Stack:**
- **Framework:** React 18 with TypeScript (`.tsx`)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Custom CSS Variables (Glassmorphism, Government Gold/Emerald Theme)
- **Icons:** `lucide-react`
- **State Management:** React Context (`AuthContext`) + Local Component State
- **HTTP Client:** Axios with Request/Response Interceptors for JWT authorization headers

### **Backend Stack:**
- **Framework:** FastAPI (Python 3.11+)
- **ORM & Database:** SQLAlchemy 2.0 (Async Engine) with SQLite (`mahasetu.db`) for lightweight demo and PostgreSQL 16 ready for production.
- **Data Validation:** Pydantic v2
- **Authentication & Security:** JWT (`pyjwt`), Passlib (`pbkdf2_sha256`, `argon2`), CORS middleware, OWASP Security Headers
- **Event Bus:** Redis Streams (`redis.asyncio`) for async application lifecycle events (`APPLICATION_SUBMITTED`, `CONSENT_GRANTED`, `DATA_FETCHED`, `STATUS_CHANGED`)

---

## 🎨 4. Frontend UI/UX Architecture & User Flows

The UI is built with state-of-the-art government aesthetics featuring an **Emerald/Teal & Deep Navy** palette, glowing badges, glassmorphic cards, dynamic persona switching, and 4 major application views:

### **User Personas & Dynamic Switching (Top Navbar):**
1. **Rahul Sharma (Citizen):** Can browse services, request business licenses, view consent prompts, grant/revoke consents, track application status, and inspect verified data.
2. **Officer Revenue (Department Officer):** Can inspect income verification requests and view citizen identity data.
3. **Officer Industries (Department Officer):** Manages incoming Business License applications, reviews auto-populated Revenue data evidence hashes, and approves/rejects applications.
4. **Admin Mahagov (System Admin):** Monitors platform observability, cryptographic audit logs, consent security metrics, and live cross-department interoperability traffic matrix.

### **Core UI Views & Components:**
- **`Navbar.tsx`**: Header with logo, brand, navigation links, quick persona selection dropdown, and active persona indicator.
- **`LoginModal.tsx`**: Quick-fill credentials modal allowing 1-click login as any of the 4 demo personas.
- **`ServiceCatalogue.tsx`**: Service discovery engine filtered by department (Revenue, Education, Industries) with "Apply Now" triggers.
- **`CitizenDashboard.tsx`**: Personal identity badge, active application tracking cards, and consent state indicators.
- **`ConsentModal.tsx`**: High-priority modal displayed when applying for a cross-department service. Shows requesting department, source department, required data fields, purpose, and expiry time before user grants permission.
- **`ConsentCenter.tsx`**: Dedicated hub for managing active digital consents with live "Revoke Access" buttons.
- **`ApplicationTracking.tsx`**: Interactive 4-stage visual timeline stepper (`Submitted` ➔ `Interoperability Verified` ➔ `Department Review` ➔ `Approved/Rejected`) with audit log payload drawer.
- **`OfficerDashboard.tsx`**: Departmental workflow portal with status filters, application inspection side-drawer, auto-fetched data evidence verification, and approval/rejection forms.
- **`AdminDashboard.tsx`**: Platform analytics with interoperability traffic matrix, active consents counter, and audit trail metrics.
- **`AuditLogExplorer.tsx`**: Cryptographic audit log stream with search, filtering by action, and raw JSON context inspector.

---

## 🔒 5. Interoperability & Security Core Logic

### **A. Hard Backend Consent Enforcement Engine (`ConsentCenter` & `data_requests.py`)**
- Interoperability requests **cannot** bypass consent.
- When Department B requests data from Department A via `POST /api/v1/data-requests`, the gateway validates:
  1. Does a consent record exist for this citizen and purpose?
  2. Is the consent status `ACTIVE`?
  3. Is `current_time < expires_at`?
  4. Does the requested scope match the granted scope?
- If validation fails, the backend returns HTTP `403 Forbidden` with detailed error codes (`CONSENT_REQUIRED`, `CONSENT_EXPIRED`, `CONSENT_SCOPE_MISMATCH`, `CONSENT_REVOKED`).

### **B. Canonical Data Model (CDM) Mapper (`schemas/canonical.py`)**
Instead of $N \times M$ custom integration code between every pair of departments, all adapters map native data into MahaSetu Canonical Schemas:
- `CitizenIdentityCanonical`: Standardized Name, DOB, Gender, Aadhaar Hash, Address.
- `IncomeCertificateCanonical`: Certificate No, Annual Income, Category, Issuing Officer, Issue Date.
- `BusinessLicenseCanonical`: Registration No, Entity Name, Enterprise Type, Validity Status.

### **C. Mock Department Adapters (`app/adapters/`)**
- `RevenueAdapter`: Simulates connection to Maharashtra Revenue Department DB.
- `EducationAdapter`: Simulates connection to Higher Education Board DB.
- `IndustriesAdapter`: Simulates connection to Directorate of Industries DB.

---

## 🗄️ 6. Database Schema & Data Models (`app/db/models.py`)

1. **`users`**: `id`, `email`, `hashed_password`, `full_name`, `role` (`CITIZEN`, `DEPARTMENT_OFFICER`, `SYSTEM_ADMIN`), `department_id`, `created_at`
2. **`citizens`**: `id`, `user_id`, `citizen_id_number` (e.g. `MH-CIT-100293`), `phone`, `address`, `dob`
3. **`departments`**: `id`, `code` (`REV`, `EDU`, `IND`), `name`, `description`, `contact_email`
4. **`services`**: `id`, `department_id`, `code` (`REV_INCOME`, `IND_BIZ_LICENSE`, `EDU_DEGREE`), `name`, `required_consents` (JSON array)
5. **`applications`**: `id`, `application_number` (e.g. `MH-2026-891024`), `citizen_id`, `service_id`, `status` (`SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`), `form_data` (JSON), `interop_data` (JSON verified payload), `created_at`, `updated_at`
6. **`consents`**: `id`, `consent_token` (e.g. `cnt_token_89a1f2...`), `citizen_id`, `requesting_dept_id`, `source_dept_id`, `purpose`, `granted_scopes` (JSON), `status` (`PENDING`, `ACTIVE`, `DENIED`, `EXPIRED`, `REVOKED`), `expires_at`, `created_at`
7. **`audit_logs`**: `id`, `request_id`, `actor_id`, `role`, `action`, `resource`, `details` (JSON), `timestamp`

---

## 🌐 7. Key REST API Endpoints

- `POST /api/v1/auth/login` ➔ Authenticate & receive JWT token
- `GET /api/v1/auth/me` ➔ Get current logged-in user profile & role
- `GET /api/v1/departments` ➔ List registered government departments
- `GET /api/v1/services` ➔ List available services
- `POST /api/v1/applications` ➔ Submit a new application
- `GET /api/v1/applications` ➔ List user or department applications
- `GET /api/v1/applications/track/{app_number}` ➔ Public tracking API with timeline events
- `PATCH /api/v1/applications/{app_number}/status` ➔ Officer state machine status update (`IN_REVIEW`, `APPROVED`, `REJECTED`)
- `POST /api/v1/consents` ➔ Create/grant digital consent token
- `POST /api/v1/consents/{id}/revoke` ➔ Immediately revoke consent
- `POST /api/v1/data-requests` ➔ Execute cross-department data exchange via adapter + CDM
- `GET /api/v1/audit-logs` ➔ Query system security audit log stream
- `POST /api/v1/demo/reset` ➔ Reset database to default clean demo state

---

## 🔑 8. Preset Demo Credentials

| Role | Name | Email / Login | Password | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Rahul Sharma | `rahul.sharma@example.com` | `Password123!` | Apply for services, view consent popups, track status |
| **Dept Officer** | Officer Revenue | `officer.revenue@mahagov.in` | `Password123!` | Review income certificate requests |
| **Dept Officer** | Officer Industries | `officer.industries@mahagov.in` | `Password123!` | Review & approve/reject business license applications |
| **System Admin** | Admin Mahagov | `admin.mahagov@in.gov` | `Password123!` | Observability, Interop matrix, Audit logs |

---

## 🧪 9. Verification & Quality Assurance Status

- **Pytest Suite:** 12/12 test files passing (100% PASS) covering authentication, consent enforcement, adapter mapping, state transitions, tracking timeline, security headers, and edge cases.
- **Frontend Build:** `npm run build` compiled 1,503 modules cleanly with 0 TypeScript/Vite errors.
