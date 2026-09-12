# MAHASETU — Smart India Hackathon 2026 Demonstration Guide

## 1. Demo Storyline Overview
**Duration:** 5 to 7 Minutes  
**Problem Highlight:** Citizens traditionally must visit Revenue offices, obtain physical Income Certificates, scan/upload them to the Industries portal, and wait weeks for manual cross-verification.  
**MahaSetu Solution:** MahaSetu acts as an interoperability middleware bridge. Citizen grants consent -> Revenue data is fetched in real-time -> Industries application form is auto-populated -> Application submitted -> Real-time tracking updated -> Audit log generated.

---

## 2. Demo Persona & Accounts

| Role | Account Email | Password | Persona Purpose |
|------|---------------|----------|-----------------|
| **Citizen** | `rahul.sharma@example.gov.in` | `Password@123` | Demonstrates unified SSO, service discovery, consent grant, pre-filled application, and application tracking. |
| **Department Officer** | `officer.industries@example.gov.in` | `Password@123` | Demonstrates receiving auto-verified application in Industries Dept queue and approving it. |
| **System Admin** | `admin.mahagov@example.gov.in` | `Password@123` | Demonstrates system service registry, interoperability integrations monitoring, and live audit logs. |

---

## 3. Step-by-Step Judges Presentation Script (5–7 Mins)

```
[0:00 - 1:00] PROBLEM INTRODUCTION & PLATFORM PURPOSE
- Speaker logs into MahaSetu Landing Page.
- Explains SIH PS 26129: "System integration & interoperability among government digital platforms."
- Emphasizes: "We are NOT presenting another simple government portal. We are presenting MAHASETU — an Interoperability Middleware Layer connecting siloed departments."

[1:00 - 2:30] CITIZEN UNIFIED EXPERIENCE & SERVICE SELECTION
- Log in as Citizen (Rahul Sharma).
- Open Service Catalogue -> Select "Small Scale Business License" (Industries Dept).
- Show application form requiring Income Verification.
- Click "Initiate Cross-Department Auto-Fetch".

[2:30 - 3:30] BACKEND CONSENT ENGINE IN ACTION
- Interactive Consent Modal appears:
  - Requesting Dept: Industries Department
  - Source Dept: Revenue Department
  - Fields Requested: Annual Income, Certificate No, Validity Date
  - Purpose: Business License Verification
- Citizen clicks "GRANT CONSENT".
- Explain: "Behind the scenes, MahaSetu generated a cryptographically signed consent token. The backend middleware enforces that no data moves without this active token."

[3:30 - 4:30] DATA EXCHANGE, CANONICAL MAPPING & AUTO-POPULATION
- The application form instantly populates with:
  - Income Certificate No: `MH-REV-INC-2025-99821`
  - Verified Income: ₹4,50,000.00
  - Status: VERIFIED BY REVENUE DEPT
- Explain: "MahaSetu's Revenue Adapter retrieved raw department data and mapped it into a Canonical Data Model (`IncomeCertificateCanonical`)."
- Citizen submits application -> Receives Application Tracking No: `MH-2026-000123`.

[4:30 - 5:30] DEPARTMENT OFFICER WORKFLOW & UNIFIED TRACKING
- Switch window -> Log in as Industries Department Officer.
- Open Department Application Queue -> Click `MH-2026-000123`.
- Point out verified Revenue data badge.
- Click "APPROVE APPLICATION".
- Switch back to Citizen Dashboard -> Show real-time timeline updated to `APPROVED` stage.

[5:30 - 7:00] ADMIN OBSERVABILITY, SERVICE REGISTRY & AUDIT TRAIL
- Log in as System Admin (`admin.mahagov@example.gov.in`).
- Open Service Registry -> Show dynamic services registered for Revenue, Education, and Industries.
- Open Live Audit Logs -> Show exact audit records:
  - `LOGIN`
  - `CONSENT_GRANTED`
  - `DATA_REQUESTED` (Revenue Adapter)
  - `APPLICATION_SUBMITTED`
  - `APPLICATION_APPROVED`
- Conclude demo: "MahaSetu provides secure, consent-driven, interoperable government digital infrastructure."
```

---

## 4. Demo Fallback & Recovery Procedures

If database or reset is required during presentation:

1. **1-Click API Reset Endpoint:**
   - Send `POST /api/v1/demo/reset` to reset database tables and re-seed clean demo accounts.

2. **CLI Reset Command:**
   ```bash
   python scripts/reset_demo.py
   ```
   *Resets SQLite/PostgreSQL to pristine demo state in < 2 seconds.*

3. **Offline Deterministic Mode:**
   All Department Adapters (Revenue, Education, Industries) operate in deterministic mock adapter mode by default, guaranteeing 100% demo uptime without external internet dependencies.
