# MAHASETU — System Requirements & Specifications

## 1. Executive Overview
MahaSetu solves government service fragmentation by establishing a secure, consent-driven interoperability middleware platform across Maharashtra State government departments.

---

## 2. Functional Requirements

### 2.1 Citizen Requirements (CR)
- **CR-01 (Single Sign-On):** Citizens shall log into MahaSetu once using unified credentials (or simulated SSO token) to access services across all onboarded government departments.
- **CR-02 (Service Catalogue):** Citizens shall browse and search a centralized registry of government services filterable by department, category, and eligibility criteria.
- **CR-03 (Consent-Based Data Sharing):** Citizens shall be explicitly prompted with a granular consent request (showing requester, data fields, purpose, and expiration) before any data is fetched from another department.
- **CR-04 (Consent Management Center):** Citizens shall view all active, expired, and revoked consents, with the ability to revoke active consents at any time.
- **CR-05 (Unified Application Filing):** Citizens shall file applications pre-populated with verified data retrieved automatically from partner departments upon granting consent.
- **CR-06 (Real-Time Unified Tracking):** Citizens shall track the progress of all applications submitted across different departments in a single timeline view.
- **CR-07 (Data Access Transparency):** Citizens shall inspect an immutable history log showing exactly which department accessed their data, when, and for what purpose.

### 2.2 Department Officer Requirements (DR)
- **DR-01 (Department Queue):** Department Officers shall view a dashboard listing applications assigned to their department filtered by status (`SUBMITTED`, `IN_REVIEW`, `MORE_INFO_NEEDED`, `APPROVED`, `REJECTED`).
- **DR-02 (Application Review):** Officers shall inspect submitted application details, auto-populated verified data sources, and attached verification hashes.
- **DR-03 (Inter-Department Data Request):** Officers shall initiate automated data request queries to partner departments via MahaSetu when additional verification is required.
- **DR-04 (Workflow State Transition):** Officers shall approve, reject, or request clarification on applications, triggering automated real-time status updates to the citizen.

### 2.3 System Administrator Requirements (AR)
- **AR-01 (Department Onboarding):** Admins shall register new government departments, manage API endpoints, and configure authentication credentials.
- **AR-02 (Service Registry Management):** Admins shall register new departmental services, defining required input fields, source departments, and target canonical schemas.
- **AR-03 (Audit Log Inspection):** Admins shall view, filter, and export system audit logs recording authentication events, consent decisions, data exchanges, and admin configuration changes.
- **AR-04 (System Health Monitoring):** Admins shall monitor real-time system metrics including backend service health, database latency, active Redis streams, and adapter response rates.

---

## 3. Integration & Interoperability Requirements (IR)
- **IR-01 (Decoupled Adapters):** Integration with departmental databases must occur via isolated backend Adapters (`RevenueAdapter`, `EducationAdapter`, `IndustriesAdapter`) implementing standard Python interfaces.
- **IR-02 (Canonical Data Mapping):** Proprietary departmental API responses must be transformed into MahaSetu Canonical Data Models (`CitizenIdentityCanonical`, `IncomeCertificateCanonical`, etc.) before frontend consumption.
- **IR-03 (Resilience & Fallbacks):** Adapter calls must enforce configurable timeouts (e.g. 5 seconds) and return standardized error schemas when a departmental system is unavailable.

---

## 4. Security & Compliance Requirements (SR)
- **SR-01 (RBAC Authorization):** API endpoints must enforce strict Role-Based Access Control enforcing `CITIZEN`, `DEPARTMENT_OFFICER`, `DEPARTMENT_ADMIN`, and `SYSTEM_ADMIN` roles.
- **SR-02 (Password & Token Security):** Passwords must be hashed using Argon2id or bcrypt. API sessions must be secured via short-lived JWT access tokens.
- **SR-03 (Backend Consent Enforcement):** The backend API Gateway must block any cross-department data exchange request unless accompanied by an active, unexpired, signed consent token matching the required resource scope.
- **SR-04 (Synthetic Data Policy):** All demonstration data must use synthetic, mock personal information. No real Aadhaar, PAN, or financial numbers shall be processed or stored.
- **SR-05 (Immutable Audit Logs):** Audit records must be stored in write-only audit tables with strictly prohibited update and delete privileges.

---

## 5. Non-Functional Requirements (NFR)
- **NFR-01 (Performance):** The API Gateway must process intra-system requests with sub-100ms latency and cross-adapter mock exchanges within sub-500ms latency.
- **NFR-02 (Reliability):** System component failures (e.g. mock adapter downtime) must degrade gracefully without crashing the core API Gateway or Citizen Portal.
- **NFR-03 (Usability & Accessibility):** The user interface must adhere to WCAG 2.1 AA accessibility guidelines, utilize clean government-grade typography (Inter / Roboto), and present clear visual contrast.
- **NFR-04 (Maintainability):** Project codebase must strictly enforce TypeScript static typing on frontend and Pydantic validation on backend.
