# 🏆 MahaSetu (महासेतू) — First-Time User Master Walkthrough & Testing Guide

**Problem Statement ID:** 26129  
**Title:** System integration and interoperability among government digital platforms, resulting in fragmented service delivery  
**Sponsor Organization:** Government of Maharashtra & Maharashtra State Innovation Society (MSInS)

---

## 📖 What is MahaSetu? (30-Second Overview for Anyone New)
Government departments in Maharashtra (Revenue, Industries, Education, Skills) run isolated databases. When a citizen applies for a scheme or startup grant, they are forced to submit the same physical income certificates, college degrees, and trade certificates repeatedly. Officers spend weeks manually verifying these documents.

**MahaSetu solves this completely:** It is a secure, middleware interoperability gateway. With citizen consent, it connects existing government databases in real time using standardized canonical schemas, instant automated approvals, and fraud deduplication — **without replacing any legacy department system.**

---

## 🚀 Step 0: Starting the Portal (Only 2 Commands)

1. **Start Backend:**
   - Open PowerShell, navigate to `d:\govtportal\backend`, and run:
     ```powershell
     .\run.bat
     ```
   - *Backend runs on: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)*

2. **Start Frontend:**
   - Open another PowerShell window, navigate to `d:\govtportal\frontend`, and run:
     ```powershell
     npm run dev
     ```
   - *Frontend runs on: `http://localhost:5173`*

3. **Open in Browser:** Open `http://localhost:5173`.

---

## 🔑 Demo Personas (1-Click Switcher)
At any point, click the **"Sign In / Demo Accounts"** (or **"Switch User"**) button on the top-right header to switch roles with a single click:

| Persona | Email | Password | Role / Purpose |
|---|---|---|---|
| **Citizen (Startup Founder)** | `rahul.sharma@example.gov.in` | `Password@123` | Applies for zero-upload grants, manages consents, files grievances |
| **MSInS & Skills Officer** | `officer.msins@example.gov.in` | `Password@123` | Scrutinizes startup applications, inspects vocational data, resolves grievances |
| **Industries Officer** | `officer.industries@example.gov.in` | `Password@123` | Reviews business licenses, verifies cross-department revenue evidence |
| **System Administrator** | `admin.mahagov@example.gov.in` | `Password@123` | Simulates server outages, views ROI telemetry, configures workflow rules, runs MDM deduplication |

*(Tip: In the login modal, you can simply click any of the 4 demo account cards to log in instantly without typing anything!)*

---

## 🧪 Comprehensive Step-by-Step Testing Walkthrough

---

### STEP 1: Exploring the Public Landing Page (Zero Login Required)
*Before logging in, explore what a new citizen or visitor sees.*

1. **Verify Official Government Header:**
   - Top dark banner shows **"Government of Maharashtra | Digital Infrastructure Platform | Gateway: Active"**.
2. **Test Dual Language Switcher (Language Localization):**
   - In the top navigation bar, locate the language switcher: `[ English | मराठी ]`.
   - Click **"मराठी"**.
   - **What happens:** All menu items, titles, service names, and descriptions instantly translate to Marathi without reloading the page.
   - Click **"English"** to switch back.
3. **Explore Public Service Catalogue:**
   - Scroll down to the **"Integrated Department Services"** section.
   - See canonical services across 4 departments:
     - *Revenue Department:* Income & Asset Certificate Verification
     - *Higher Education:* NAD Degree Credential Verification
     - *MSBTE / Skills:* ITI & Vocational Qualification Verification
     - *Industries Department:* MSInS Startup Seed Grant & Business Licenses
4. **Public Application Tracking:**
   - Scroll to **"Track Application Status"**.
   - Enter `APP-2026-IND-00142` and click **"Track"**.
   - View the live 4-stage stepper (`Submitted` ➔ `Data Interop Verified` ➔ `In Scrutiny` ➔ `Approved`) and the immutable audit event trail.

---

### STEP 2: Citizen Flow — The Zero-Upload MSInS Seed Grant (The Main Demo)
*Show how a citizen applies for a ₹5,00,000 grant with zero document uploads.*

1. **Log in as Citizen:**
   - Click **"Sign In / Demo Accounts"** on the top right.
   - Click the **"Rahul Sharma (Citizen)"** demo card.
2. **Review the Citizen Dashboard:**
   - Notice the **Impact Telemetry Banner** showing:
     - *Avg. Time Saved: 18.4 Days*
     - *Cost Saved: ₹450+ per applicant*
     - *Zero Scanned PDF Uploads Needed*
3. **Apply for MSInS Startup Seed Grant:**
   - Click the **"Apply for Service"** tab.
   - Find **"MSInS Startup Innovation Seed Grant (₹5,00,000)"** and click **"Apply with Zero Document Upload"**.
4. **Inspect the Granular Consent Screen:**
   - A modal opens explaining that MahaSetu will digitally federate 3 data points:
     1. *Income Certificate from Revenue Dept (MahaBhulekh)*
     2. *ITI / Mechatronics Diploma from MSBTE (Skills Dept)*
     3. *Udyam Enterprise Number from Industries Dept*
   - Click **"Verify & Grant Interoperability Consent"**.
5. **Watch Real-Time Federation & Auto-Approval:**
   - The modal calls the backend canonical gateway.
   - All 3 data sources are verified within 2 seconds.
   - The application is submitted and **instantly auto-approved** by the backend workflow engine.
6. **Track the Application with RTS SLA Clock:**
   - Go to the **"My Applications"** tab.
   - See the newly created application `APP-2026-MSINS-...` marked with an **"Approved"** badge.
   - Notice the **RTS SLA Clock**: `⏳ RTS SLA: 20d 23h remaining (Max 21 Days)`.

---

### STEP 3: Citizen Flow — Consent Governance & Revocation
*Show how the citizen retains total control over their private data under DPDP Act 2023.*

1. In the Citizen Dashboard, click the **"Consent Center"** tab.
2. **What you see:**
   - A table of active cryptographic consent tokens (`cst_...`).
   - Details: Requesting department, providing department, specific data requested, and validity expiry date.
3. **Revoke a Consent:**
   - Click **"Revoke Consent"** on any active entry.
   - **What happens:** The token status instantly changes to `REVOKED`. The backend registers an immutable audit event preventing any further data access.

---

### STEP 4: Citizen Flow — Raising an RTS Grievance & Notifications
*Show what happens when a citizen faces a delay or issue.*

1. Click the **"RTS Grievances"** tab.
2. Click **"+ Raise New Grievance"**.
3. **Fill the Modal:**
   - *Department:* Select `Skills & Innovation (MSInS)` or `Revenue Department`.
   - *Category:* Select `Service Delay (Beyond RTS SLA)` or `Data Interoperability Failure`.
   - *Description:* Type: *"Income certificate verification taking longer than expected."*
   - Click **"Submit Grievance"**.
4. **Check Multi-Channel Notifications:**
   - Look at the **Bell Icon** on the top header.
   - A **red badge (`1` or `2`)** appears automatically via live polling.
   - Click the Bell icon to open the **Notification Drawer**.
   - See the incoming alert: `[SMS via MHA-GOVT] Grievance #GRV-2026-XXX registered under Maharashtra RTS Act.`

---

### STEP 5: Officer Flow — Application Scrutiny & Applicant 360° Graph
*Show how a government officer reviews applications with pre-verified canonical data.*

1. Click **"Switch User"** on top right ➔ Click the **"Officer MSInS"** (or **"Officer Industries"**) demo card.
2. **Scrutiny Queue:**
   - The table lists incoming applications for the department.
   - Notice the green badge: `Revenue Cert #REV-2026-IN-88912 (₹4,20,000) - AUTO-FETCHED`.
3. **Inspect Application:**
   - Click **"Inspect & Process"** on any application.
   - An inspection modal opens displaying:
     - Verified Revenue Financial Evidence (Annual income, issuing tahsildar, SHA-256 hash).
     - Verified Skills Qualification (Trade course, grade, MSBTE board).
4. **Launch Beneficiary 360° Identity Graph (Key Feature):**
   - Inside the inspection modal header, click the button **"👁️ View Applicant 360° Profile"**.
   - **What you see:** A full 360° modal showing:
     - **Identity Graph:** 4 connected state registries (Revenue, Higher Education, MSBTE, MSME).
     - **Cross-Department History:** All past applications submitted across all ministries.
     - **Total Benefits Disbursed (₹):** Real-time cumulative financial disbursement tracker.
5. **Submit Officer Decision (Approve or Reject):**
   - **To Approve:** Select **`Approve Application`**, enter remarks (e.g. *"Canonical verification confirmed, verified under MSInS Rule 4B"*), and click **"Confirm Approval & Issue"**.
   - **To Reject:**
     - Select **`Reject Application`**.
     - Notice the red alert banner appears: `⚠️ Rejection Notice: Citizen will receive an instant SMS alert with official remarks and 30-day statutory right to appeal under Maharashtra RTS Act 2015.`
     - Enter the Rejection Reason in the remarks box (e.g. *"Annual income evidence exceeds MSInS eligibility threshold of ₹8,00,000"* or *"Incomplete trade certificate level"*).
     - Click the red button **"Confirm Rejection"**.
   - **Auto-Close & Immediate Feedback:**
     - The inspection modal automatically closes immediately upon submitting the decision.
     - A green confirmation banner displays on the officer dashboard, and the applications queue refreshes instantly.
   - **What Happens Behind the Scenes When an Application is Rejected:**
     - ⚡ **State Transition:** Application status transitions to `REJECTED` in the database.
     - 📜 **Event Timeline:** An immutable `APPLICATION_REJECTED` event is appended with the officer's name, timestamp, and exact reason.
     - 🔒 **Audit Ledger:** A cryptographic SHA-256 audit entry is committed to the central audit log for vigilance & anti-corruption compliance.
     - 📱 **SMS / WhatsApp Alert:** Citizen receives an instant SMS notification stating: *"[SMS via MHA-GOVT] Application #MH-2026-XXXX was marked REJECTED by Nodal Officer. Reason: '...'. You may raise an RTS appeal on MahaSetu."*
     - ⚖️ **RTS Appeal Window:** Under the **Maharashtra Right to Public Services Act 2015**, the citizen gets a 30-day statutory right to file a First Appeal.
6. **Verify Rejection on Citizen Dashboard & Public Tracker:**
   - Click **"Switch User"** ➔ **"Rahul Sharma (Citizen)"**.
   - Under **"My Applications"**, see the status badge updated to **`● Rejected`** with a direct **"Raise Grievance / RTS Appeal"** button.
   - Go to the public landing page **"Track Application Status"**, enter the application number, and verify that the public timeline displays the rejection event along with the officer's remarks.

---

### STEP 6: Officer / Admin Flow — Master Data Management (MDM) & Deduplication
*Show how the system catches fraud, ghost beneficiaries, and duplicate claims.*

1. While logged in as **Officer** or **Admin**, click the **"Beneficiary 360° & MDM Deduplication"** tab.
2. **Test Fuzzy Matching with a Misspelled Name:**
   - Click the quick test button **`Fuzzy Name: "Rahul Sharrma"`** (or type it into the name box).
   - Click **"🚀 Run Deduplication"**.
3. **Inspect Deduplication Results:**
   - The engine scans across all registries using Python `difflib.SequenceMatcher` algorithms.
   - Candidate **Rahul Sharma** is detected with a **92% Confidence Score** and marked as **HIGH RISK**.
   - Displays reasons: *High fuzzy name similarity, matching phone number, identical Aadhaar hash*.
   - Shows **4 Connected Registries** and provides a 1-click **"👁️ View 360° Profile"** button.

---

### STEP 7: System Admin Flow — Outage Simulator & Circuit Breaker Resilience
*Show how MahaSetu survives department server crashes without failing.*

1. Click **"Switch User"** ➔ Click the **"Admin Mahagov"** demo card.
2. Go to the **"Overview"** tab and scroll to **"Department Adapter Resilience & Circuit Breaker"**.
3. **Simulate an Outage:**
   - Select **"Revenue Department (dept_revenue)"**.
   - Click **"Simulate Outage"**.
   - **Observe on Admin Dashboard:**
     - Status turns red: `OUTAGE_SIMULATED`.
     - Circuit Breaker trips to **`OPEN`** state.
4. **Verify Zero Crash & Amber Resilience Badge (Citizen Perspective):**
   - While the Revenue Department is offline, switch to **Citizen Rahul Sharma**.
   - Go to **Apply for Service** ➔ **MSInS Startup Innovation Seed Grant** ➔ click **"Verify & Grant Interoperability Consent"**.
   - **What happens on screen:**
     - The portal does **NOT** crash or throw an HTTP 500 error.
     - Notice the Revenue Department card displays an **Amber Badge: `⚡ Cache Replica (Dept Offline)`** and an alert banner:
       > *"Circuit Breaker & Resilience Active: Upstream Revenue Department is simulating an outage. MahaSetu automatically attempted 3x exponential backoff retries and gracefully served your verified certificate (₹4,20,000 / REV-2026-IN-88912) from the encrypted local cache without failing your application."*
5. **Inspect Live Circuit Breaker Retry Logs (Admin Perspective):**
   - Switch back to **Admin Mahagov** ➔ Scroll down to the **"Live Resilience & Retry Audit Logs"** panel.
   - See the real-time event trail generated during the outage:
     1. `OUTAGE_DETECTED` (Initiated 3-step exponential backoff retry protocol)
     2. `RETRY_ATTEMPT_FAILED` (Attempts 1/3, 2/3, 3/3 timed out with HTTP 504)
     3. `CACHE_FALLBACK_SERVED` (Served verified record under Once-Only Principle)
6. **Restore the Service:**
   - On the Admin Dashboard, click **"Restore Service"**.
   - The Circuit Breaker resets to **`CLOSED`** (Healthy) and processes any queued offline items automatically.

---

### STEP 8: System Admin Flow — Workflow Rules & Auto-Approval Engine
*Show how government policies and auto-approval criteria are configured dynamically without touching source code.*

1. **Navigate to Rules Engine:**
   - Log in as **`admin.mahagov@example.gov.in`** (or click **"Switch User"** ➔ **"Admin Mahagov"**).
   - In the top tab bar, click **"Workflow Rules & SLA"**.
2. **Inspect & Customize Active Rules:**
   - **`MSInS Tier-1 Innovator Fast-Track Approval`:**
     - Drag the **Max Annual Income Auto-Approval Cap slider** (e.g., from ₹8,00,000 to ₹10,00,000).
     - Change the **Statutory RTS SLA Target** dropdown (12h Express, 24h Next-Day, 48h Standard).
     - Toggle the rule **ON / OFF** using the switch in the top right of the card.
     - Click **"Deploy Rule"** to commit the change live with cryptographic audit proof.
   - **`MSME Micro-Enterprise Income Auto-Approval`:**
     - Adjust the turnover cap and statutory RTS SLA target.
3. **Use the Interactive Rule Simulation Sandbox (Directly on Screen):**
   - Scroll down to the **"Interactive Rule Simulation & Verification Sandbox"** card.
   - Select **Target Service**: `MSInS Startup Innovation Seed Grant`.
   - Set **Test Verified Income**: Click the **`₹4.2L`** quick button.
   - Select **Verified Skill Grade**: `Distinction (MSBTE Level 6)`.
   - Click **"🚀 Run Rule Simulation"**.
   - **What happens instantly:**
     - See the green decision box: `✅ POLICY DECISION: AUTO-APPROVED (Bypasses Manual Queue)`.
     - Displays: `⚡ Execution Time: 12ms` and explanation: *"Verified income (₹4,20,000) is <= configured Cap (₹8,00,000) and MSBTE skill qualification 'Distinction' is pre-verified."*
4. **Test the Edge Case (Manual Scrutiny Fallback):**
   - In the tester, change the income to **`₹12L`** (or select **Pass Class** grade) and click **"🚀 Run Rule Simulation"**.
   - **Observe:** The decision changes to `⏳ POLICY DECISION: ROUTED TO MANUAL OFFICER SCRUTINY` because criteria exceeded the auto-approval threshold.

---

### STEP 9: System Admin Flow — Cryptographic Audit Log Explorer
*Show CERT-In and government security compliance.*

1. In Admin Dashboard, click the **"Audit Logs"** tab.
2. **Observe:**
   - Complete tabular ledger of all platform actions (`CONSENT_GRANTED`, `DATA_EXCHANGE_DISPATCHED`, `STATUS_TRANSITION`).
   - Requesting & Providing department identifiers.
   - Immutable **SHA-256 Record Hashes** ensuring non-repudiation.

---

## 📊 Summary of What Wins the Problem Statement

| SIH Judging Criteria | How MahaSetu Wins |
|---|---|
| **Core Problem Solved** | Eliminates repetitive document submissions via 3-department zero-upload federation. |
| **No Legacy Replacement** | Non-invasive middleware layer that sits on top of existing department databases. |
| **Data Privacy & Governance** | DPDP Act 2023 compliant consent gateway with revocable cryptographic tokens. |
| **System Resiliency** | 3-state Circuit Breaker, exponential backoff, and offline cache fallback. |
| **Fraud Prevention** | Fuzzy MDM deduplication engine flags duplicate beneficiaries and ghost claims. |
| **Government Compliance** | Full Maharashtra RTS Act 2015 integration (21-day SLA clock) and Marathi localization. |
| **Security & Auditing** | Tamper-evident SHA-256 audit ledger across all inter-departmental transactions. |
| **Code Quality & Testing** | 19/19 passing automated pytest suites with 0 frontend compilation errors. |

---

## 💻 Quick Commands for Evaluators & Live Jury

```powershell
# 1. Run all 19 automated backend test suites
cd d:\govtportal\backend
.\venv\Scripts\python.exe -m pytest

# 2. Verify clean production frontend build
cd d:\govtportal\frontend
npm run build
```
