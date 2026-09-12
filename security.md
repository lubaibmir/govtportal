# MAHASETU — Security Controls & Compliance Architecture

## 1. Security Architecture Principles

Security in MahaSetu is not an afterthought; it is built into the middleware core architecture:

1. **Zero-Trust Department Interoperability:** No departmental endpoint is assumed trustworthy. Every cross-system exchange requires API key signature and valid consent tokens.
2. **Data Minimization & Transient Exchange:** Personal records stay at the source departmental registry. MahaSetu fetches and transforms data on-demand without storing redundant copies.
3. **Defense-in-Depth:** API Gateway rate limiting, strict Pydantic payload validation, JWT authentication, and RBAC authorization guard every endpoint.
4. **Backend Consent Hard-Enforcement:** Consent is validated cryptographically on the backend; frontend state is never trusted implicitly.

---

## 2. Authentication & Session Management

- **Password Hashing:** Passwords stored in `users` table are hashed using Argon2id / bcrypt with a high work factor. Raw passwords are never logged or stored.
- **JWT (JSON Web Tokens):**
  - Symmetric key signing via `HS256` (or `RS256` for production mTLS).
  - Short token lifetimes (e.g. 15–60 minutes for access tokens, 24 hours for refresh tokens).
  - Tokens encode `user_id`, `role`, `department_id`, and `exp` timestamp.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Endpoint Group | CITIZEN | DEPARTMENT_OFFICER | DEPARTMENT_ADMIN | SYSTEM_ADMIN |
|----------------|:-------:|:------------------:|:----------------:|:------------:|
| `POST /auth/login` | Public | Public | Public | Public |
| `GET /services` | Read | Read | Read | Read |
| `POST /consents` | Create | Create Request | Deny | Manage |
| `POST /consents/{id}/approve` | Approve | Deny | Deny | Deny |
| `POST /data-requests` | Execute (Own) | Execute (Assigned) | Deny | Manage |
| `POST /applications` | Create | Deny | Deny | Deny |
| `GET /applications` | View Own | View Department Queue | View All Dept | View All System |
| `PATCH /applications/{id}/status` | Deny | Update Status | Update Status | Manage |
| `GET /audit-logs` | Deny | Deny | Deny | **Full Access** |
| `GET /health` | Public | Public | Public | Public |

---

## 4. OWASP Top 10 Mitigation Controls

### A. Broken Access Control (A01:2021)
- Handled via FastAPI `Depends(require_roles([...]))` middleware.
- Resource ownership checks verify `application.citizen_id == current_user.id` for citizen endpoints.

### B. Cryptographic Failures (A02:2021)
- TLS 1.3 enforced for HTTPS traffic in deployment.
- Sensitive fields (National ID, Aadhaar, PAN) are stored exclusively as SHA-256 hashes (`national_id_hash`).
- Synthetic data only used during hackathon demo.

### C. Injection Attacks (A03:2021)
- SQL Injection prevented via SQLAlchemy Async ORM parameterized queries.
- Input validation enforced on all JSON endpoints via Pydantic model type definitions.

### D. Insecure Design & Consent Bypass (A04:2021)
- Solved by the **Consent Engine State Machine**:
  ```
  PENDING ---> APPROVED ---> ACTIVE (Consent Token Issued)
          ---> DENIED
          ---> EXPIRED
  ```
  If `/data-requests` receives an inactive or mismatched consent token, the API Gateway immediately halts execution with `HTTP 403 CONSENT_REQUIRED`.

### E. Security Logging & Monitoring Failures (A09:2021)
- Centralized `audit_logs` table records every sensitive action with `timestamp`, `actor_id`, `role`, `action`, `resource`, `result`, and `request_id`.
- Audit logs are insert-only (PostgreSQL triggers prevent `UPDATE` or `DELETE` statements on `audit_logs`).

---

## 5. Secrets Management Policy
- Secrets (`SECRET_KEY`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`) are loaded strictly from environment variables (`.env`).
- No API keys, passwords, or tokens are committed to source control repository (`.gitignore` enforces excluding `.env`).
