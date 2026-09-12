# MAHASETU — System Architecture & Interoperability Blueprint

## 1. High-Level System Architecture

MahaSetu operates as an **Interoperability & Data Exchange Core (Middleware Gateway)** connecting disparate government departmental systems, registries, and citizen-facing services.

```mermaid
flowchart TB
    subgraph Clients["Client Layer"]
        CP["Citizen Web Portal\n(React + TS)"]
        DP["Department Officer Dashboard\n(React + TS)"]
        AP["System Admin Portal\n(React + TS)"]
    end

    subgraph Gateway["API Gateway Layer (FastAPI / Nginx)"]
        AUTH_MW["JWT Auth Middleware"]
        RBAC_MW["RBAC & Security Policy"]
        RATE_MW["Rate Limiting & Request Tracing"]
    end

    subgraph Core["MahaSetu Interoperability Core Engine"]
        SR["Service Registry &\nDiscovery Engine"]
        CE["Backend Consent\nEnforcement Engine"]
        DX["Data Exchange &\nCanonical Mapper"]
        FI["Federated Identity &\nSSO Engine"]
        EB["Event Bus &\nNotification Core (Redis Streams)"]
        AL["Immutable Audit\nLogger"]
    end

    subgraph Storage["Data & Cache Layer"]
        PG[(PostgreSQL 16\nRelational DB)]
        RD[(Redis 7\nCache & Streams)]
    end

    subgraph Adapters["Department Integration Adapters"]
        REV_AD["Revenue Dept Adapter\n(Income, Residence, Certificates)"]
        EDU_AD["Education Dept Adapter\n(Student Records, Marksheets)"]
        IND_AD["Industries Dept Adapter\n(Business Registration, NOC)"]
    end

    subgraph DeptSystems["Simulated Department Systems"]
        REV_SYS[("Revenue Dept System &\nDatabase")]
        EDU_SYS[("Education Dept System &\nDatabase")]
        IND_SYS[("Industries Dept System &\nDatabase")]
    end

    Clients --> Gateway
    Gateway --> Core
    Core --> Storage
    Core --> Adapters
    Adapters --> DeptSystems

    REV_AD <--> REV_SYS
    EDU_AD <--> EDU_SYS
    IND_AD <--> IND_SYS
```

---

## 2. Core Architectural Components

### A. API Gateway & Middleware Layer
- **Authentication:** Validates OAuth2 / JWT tokens issued by MahaSetu Federated Identity Engine.
- **Role-Based Access Control (RBAC):** Restricts endpoints based on system roles (`CITIZEN`, `DEPARTMENT_OFFICER`, `DEPARTMENT_ADMIN`, `SYSTEM_ADMIN`).
- **Request Tracing:** Assigns a unique `X-Request-ID` (UUIDv4) to every incoming request for end-to-end distributed tracing across departmental calls.
- **Rate Limiting:** Enforces per-IP and per-user request limits via Redis token bucket.

### B. Interoperability Core Engine
1. **Service Registry:** A dynamic registry where government departments publish available APIs, data contracts, input requirements, output schemas, and security scopes.
2. **Backend Consent Engine:** Enforces user-granted data sharing authorizations. Requests fail hard with `403 Consent Required` unless a valid, unexpired, purpose-bound consent token exists.
3. **Data Exchange & Canonical Mapper:** Translates proprietary department data formats into standardized MahaSetu Canonical Schemas (e.g. `CitizenProfileCanonical`, `CertificateCanonical`).
4. **Federated Identity & SSO Engine:** Single Sign-On broker mapping unified Citizen ID to internal departmental IDs without storing unnecessary raw personal data.
5. **Event Bus (Redis Streams):** Asynchronous pub/sub processing application workflow changes (`APPLICATION_CREATED`, `CONSENT_GRANTED`, `DATA_REQUESTED`, `APPLICATION_APPROVED`).
6. **Immutable Audit Logger:** Writes structured audit records (`timestamp`, `actor_id`, `role`, `action`, `resource`, `result`, `request_id`) to PostgreSQL audit tables with optional SHA-256 hash chaining.

### C. Department Adapters (Mock Integration Layer)
- Isolated Python modules implementing standardized `IDepartmentAdapter` interfaces:
  - `RevenueAdapter.fetch_income_certificate(citizen_id, consent_token)`
  - `RevenueAdapter.fetch_residence_details(citizen_id, consent_token)`
  - `EducationAdapter.fetch_degree_verification(student_id, consent_token)`
  - `IndustriesAdapter.verify_license_status(business_id, consent_token)`

---

## 3. Core Workflow Sequence Diagrams

### Workflow 1: Consent-Based Cross-Department Data Exchange

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen (Rahul Sharma)
    participant CP as Citizen Portal
    participant GW as API Gateway
    participant Core as Interoperability Engine
    participant CE as Consent Engine
    participant Adapter as Revenue Adapter
    participant RevSys as Revenue System
    participant DB as PostgreSQL

    Citizen->>CP: Select "Apply for Industries Business License"
    CP->>GW: POST /api/v1/applications/initiate
    GW->>Core: Resolve required fields & source depts
    Core-->>CP: Required Data: Income Cert (Revenue Dept)
    
    CP->>Citizen: Display Consent Modal (Purpose, Fields, Expiry)
    Citizen->>CP: Click "Grant Consent"
    CP->>GW: POST /api/v1/consents
    GW->>CE: Issue & Store Consent Record
    CE->>DB: Save Consent (Status: ACTIVE, Expiry: 1 hr)
    CE-->>CP: Consent Granted (Consent Token)

    CP->>GW: POST /api/v1/data-requests (Consent Token, Dept: Revenue)
    GW->>CE: Validate Consent Token & Scopes
    CE-->>Core: Consent Validated
    Core->>Adapter: Fetch Income Data (Citizen ID, Consent Token)
    Adapter->>RevSys: Authenticated Mock API Call
    RevSys-->>Adapter: Raw Revenue JSON Payload
    Adapter->>Core: Return Raw Payload
    Core->>Core: Data Transformation -> Canonical Format
    Core->>DB: Log Audit Entry & Event
    Core-->>CP: Return Auto-Populated Application Form
    CP->>Citizen: Display Form Pre-filled with Verified Revenue Data
```

---

### Workflow 2: Unified Application Lifecycle & Event Processing

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen
    actor Officer as Department Officer
    participant CP as Citizen Portal
    participant GW as API Gateway
    participant Workflow as Application Workflow Engine
    participant EB as Redis Streams Event Bus
    participant DB as PostgreSQL
    participant Notif as Notification Service

    Citizen->>CP: Submit Completed Application
    CP->>GW: POST /api/v1/applications
    GW->>Workflow: Validate & Save Application
    Workflow->>DB: Save Application (Status: SUBMITTED)
    Workflow->>EB: Publish Event (APPLICATION_CREATED)
    EB-->>Notif: Consume APPLICATION_CREATED
    Notif-->>Citizen: Send SMS / Email Notification

    Officer->>GW: GET /api/v1/applications (Department Queue)
    GW->>DB: Fetch Pending Applications
    GW-->>Officer: Display Application List

    Officer->>GW: PATCH /api/v1/applications/{id}/status (Status: APPROVED)
    GW->>Workflow: Transition State Machine
    Workflow->>DB: Update Application (Status: APPROVED)
    Workflow->>EB: Publish Event (APPLICATION_APPROVED)
    EB-->>Notif: Consume APPLICATION_APPROVED
    Notif-->>Citizen: Notify Approval & Generate Certificate
```

---

## 4. Canonical Data Model Architecture

To avoid N×M integration complexity between $N$ citizen portals and $M$ government databases, MahaSetu enforces a **Canonical Data Model (CDM)**:

```
[ Revenue Dept Schema ]    ---> [ Revenue Adapter ]    ---\
[ Education Dept Schema ]  ---> [ Education Adapter ]  ----> [ Canonical Data Mapper ] ---> [ MahaSetu Canonical Model ]
[ Industries Dept Schema ] ---> [ Industries Adapter ] ---/
```

### Canonical Data Schemas:
- **`CitizenIdentityCanonical`**: Standardized name, DOB, gender, mobile, email, primary address.
- **`IncomeCertificateCanonical`**: Standardized certificate number, annual income, issuing authority, issue date, validity status.
- **`BusinessLicenseCanonical`**: Registration number, enterprise name, category, operational address, validity date.

---

## 5. Security & Boundary Controls
1. **Zero-Trust Departmental Communication:** Adapters authenticate via mutual TLS / HMAC signed API keys.
2. **Data Minimization:** MahaSetu does not act as a permanent store for department records; it proxies and transforms data on-demand during application submission.
3. **Immutability of Audit Trails:** Audit log entries are insert-only and cannot be updated or deleted by any user or administrator role.
