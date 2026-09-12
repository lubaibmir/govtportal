# MAHASETU — Architecture Decision Records (ADR Log)

## ADR-001: Adoption of FastAPI as Primary Backend API Gateway & Middleware Core

- **Status:** APPROVED
- **Date:** 2026-09-08
- **Context:** MahaSetu requires a high-performance async API gateway capable of managing cross-department REST calls, data transformation, JWT validation, and RBAC enforcement.
- **Decision:** Use Python 3.11 with FastAPI.
- **Reason:** FastAPI provides native async execution (`asyncio`), automatic Pydantic schema validation, high throughput, and automatic OpenAPI documentation generation out-of-the-box.
- **Alternatives Considered:**
  - *Express.js (Node.js):* Good async I/O, but lacks built-in strong schema validation compared to Pydantic.
  - *Django:* Heavy overhead, monolithic structure less suitable for an agile API gateway middleware.
- **Consequences:** Developers must ensure non-blocking async adapter calls using `httpx` or async clients.

---

## ADR-002: Frontend Architecture using React, TypeScript, Vite, and Tailwind CSS

- **Status:** APPROVED
- **Date:** 2026-09-08
- **Context:** The frontend must provide a responsive, professional government-grade user interface for Citizens, Department Officers, and System Administrators.
- **Decision:** React 18 + TypeScript + Vite + Tailwind CSS.
- **Reason:** TypeScript ensures strict type safety across complex application states and consent payloads. Vite provides sub-second HMR during development. Tailwind CSS allows rapid creation of clean, consistent, accessible government design tokens.
- **Alternatives Considered:**
  - *Next.js:* Server-Side Rendering (SSR) is valuable, but for a fast prototype SPA with complex client-side state machine modals (Consent Engine), Client-Side React with Vite is more straightforward and fast to run locally.
- **Consequences:** Must keep component design modular with reusable UI components for modals, application tracking timelines, and audit logs.

---

## ADR-003: Relational Datastore Choice — PostgreSQL 16 with UUID Keys

- **Status:** APPROVED
- **Date:** 2026-09-08
- **Context:** Interoperability systems rely heavily on structured entities, foreign key constraints, consent life cycles, and immutable audit logs.
- **Decision:** Use PostgreSQL 16 as the primary database, using UUIDv4 primary keys for user and application entities.
- **Reason:** PostgreSQL offers robust ACID compliance, native JSONB support for storing raw mock departmental payloads alongside structured data, and strong relational integrity. UUIDs prevent sequential enumeration attacks across departmental application references.
- **Alternatives Considered:**
  - *MongoDB:* Flexible schemas, but lacks strict ACID relational guarantees essential for government audit logs and state machine transitions.
- **Consequences:** Requires DB migrations via Alembic or structured SQL initialization scripts.

---

## ADR-004: Redis for Caching, Rate Limiting, and Event Streaming

- **Status:** APPROVED
- **Date:** 2026-09-08
- **Context:** Need a fast, lightweight event processing mechanism to handle application status events and enforce rate-limiting without adding heavy infrastructure like Kafka.
- **Decision:** Use Redis 7 for session caching, token bucket rate-limiting, and Redis Streams as the lightweight event bus.
- **Reason:** Redis is lightweight, fast, easy to run in Docker Compose on a normal laptop, and Redis Streams provides reliable consumer-group event pub/sub.
- **Alternatives Considered:**
  - *Apache Kafka / RabbitMQ:* Enterprise-grade, but adds excessive memory and CPU overhead for a hackathon laptop setup.
- **Consequences:** Events are persistent in Redis append-only file (AOF), but core audit logs are also redundantly committed to PostgreSQL for long-term immutability.

---

## ADR-005: Cryptographic Consent Enforcement Engine in Middleware

- **Status:** APPROVED
- **Date:** 2026-09-08
- **Context:** Government data privacy rules mandate that no data exchange occurs between departments without explicit, verified citizen consent.
- **Decision:** Enforce consent at the backend middleware API Gateway level rather than trusting frontend checks.
- **Reason:** Frontend consent checks can be bypassed by direct API calls. Hard backend verification ensures that `/data-requests` endpoint rejects any call lacking an active, valid, purpose-bound consent token.
- **Alternatives Considered:**
  - *Implicit departmental trust:* Allowing registered officers to fetch data without consent token. (REJECTED: Violates citizen privacy core requirement).
- **Consequences:** Every data exchange test must generate and pass a valid consent token.

---

## ADR-006: Dedicated Mock Adapters for Departmental Systems

- **Status:** APPROVED
- **Date:** 2026-09-08
- **Context:** We cannot access live production databases of Maharashtra State government departments during the hackathon.
- **Decision:** Build modular python adapter classes (`RevenueAdapter`, `EducationAdapter`, `IndustriesAdapter`) that mock realistic external REST endpoints.
- **Reason:** Allows full demonstration of real-world interoperability, API latency simulation, format translation, and error handling without fake frontend-only data.
- **Alternatives Considered:**
  - *Hardcoding fake data in React frontend components:* (REJECTED: Fails requirement to prove real interoperability middleware architecture).
- **Consequences:** Backend codebase must clearly encapsulate adapter code under `app/adapters/`.
