# JeevanSetu Architecture

## Stack
Frontend: Next.js + JavaScript + React + Tailwind CSS + shadcn/ui

Backend: Node.js + Express.js + JavaScript + REST API

Database: Supabase PostgreSQL

Auth: Supabase Auth

Storage: Supabase Storage

AI: Provider-Agnostic LLM Gateway (Gemini / Claude / Fallback) through Express backend

Forecasting: Pure deterministic statistical weighted consumption engine (`forecast.utils.js`)

Early-Warning: Statistical anomaly surveillance & moving baseline engine (`anomaly.utils.js`)

Referral Intelligence: Milestone-aware care-continuity tracking & escalation engine (`referralFollowUp.service.js`)

Automation: n8n

Version control: Git + GitHub

Deployment: Vercel for frontend, Render/Railway for Express and Python services, Supabase for database/auth/storage, n8n Cloud initially.

## High-level architecture

User
→ Next.js
→ Express REST API
→ Supabase/PostgreSQL

Referral Follow-up Intelligence:
referrals + referral_events → `referralMilestones.config.js` → `referralFollowUp.service.js` → `referral_followups` & `referral_followup_events` → Staff Follow-Up Queue & District Analytics → Deduplicated Notifications → AI Context Grounding

Early-Warning Surveillance:
health_cases + medicine_usage → `HealthCasesSignalProvider` / `MedicineUsageSignalProvider` → `earlyWarning.service.js` → `anomaly.utils.js` (Pure Statistical $Z$-Score & Moving Baseline) → `early_warning_signals` & `early_warning_events` → District Admin / PHC Surveillance Feed → AI Context Grounding

Forecasting:
medicine_inventory + medicine_usage → `medicineForecast.service.js` → `forecast.utils.js` (Pure Statistical Math) → `medicine_forecasts` (Persistent Table) → PHC / Admin Dashboard & Alert Notification → AI Context Grounding

AI:
Next.js → Express (`POST /api/ai/chat`) → authorization/validation → Medical Safety Layer (Emergency/Non-Diagnostic) → Permissioned Context Retrieval (PII Minimized) → System Prompt Construction & Injection Defense → Provider Abstraction (Gemini/Claude/Fallback) → Response Validation & Grounded Cards → Frontend/Audit Log

## Repository

```text
jeevansetu/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   ├── forecasting/
│   │   │   ├── earlyWarning/
│   │   │   └── referrals/
│   │   │       ├── referralMilestones.config.js
│   │   │       └── referralFollowUp.service.js
│   │   ├── jobs/
│   │   │   ├── referralFollowUp.jobs.js
│   │   │   ├── earlyWarning.jobs.js
│   │   │   ├── forecast.jobs.js
│   │   │   ├── notification.jobs.js
│   │   │   └── cleanup.jobs.js
│   │   ├── middleware/
│   │   ├── validators/
│   │   └── utils/
│   └── server.js
├── supabase/
│   ├── migrations/
│   └── seed/
├── n8n/
├── tests/
├── docs/
├── .env.example
└── README.md
```

## Core data domains
profiles, patients, healthcare_cases, health_case_vitals, hospitals, hospital_services, government_schemes, ngos, referrals, referral_events, referral_followups, referral_followup_events, phcs, doctors, medicines, medicine_inventory, medicine_usage, medicine_forecasts, early_warning_signals, early_warning_events, feedback, notifications, audit_logs.

## Security
Use Supabase Auth, role-based access control and PostgreSQL RLS. Medical documents are private. API keys remain strictly server-side.

## Notification & Event-Driven Architecture (Phase 6)

1. **Notification Lifecycle**:
   - Application Event (Referral milestone overdue/escalated, Medicine depletion, Early-warning anomaly)
   - `notificationService` handles idempotency and deduplication (prevents alert spam)
   - Saves record into `notifications` table
   - Dispatches in-app delivery and notifies Supabase Realtime channel

2. **Delivery Channel Abstraction**:
   - `in_app` (Active)
   - `sms` / `whatsapp` (Future delivery channel abstraction)
   - `email` / `webhook` (Future external integration)

3. **Background Jobs Model**:
   - `backend/src/jobs/`: Lightweight background scheduler for periodic sweeps and maintenance.
   - `referralFollowUp.jobs.js`: Scans active referrals for milestone due/overdue/escalated states.
   - `earlyWarning.jobs.js`: Scans aggregated health signals for statistical deviations.
   - `forecast.jobs.js`: Runs periodic statistical recalculation across all PHC inventories.
   - `notification.jobs.js`: Scans for unalerted critical PHC inventory stock.
   - `cleanup.jobs.js`: Safe non-destructive maintenance.

## Referral Follow-Up Intelligence (Phase 11)

1. **Care-Continuity Workflow Tracking Only**:
   - Strict prohibition against GPS, live location tracking, or background surveillance.
   - Operates exclusively on discrete, authorized workflow events (`created` $\rightarrow$ `patient_notified` $\rightarrow$ `destination_accepted` $\rightarrow$ `patient_reached` $\rightarrow$ `treatment_started` $\rightarrow$ `completed`).

2. **Expected Milestones & Urgency Matrix**:
   - Dynamically computes deadlines based on stage and clinical urgency (`emergency`, `urgent`, `routine`).
   - Evaluates state progression: `MONITORING` $\rightarrow$ `FOLLOW_UP_DUE` $\rightarrow$ `OVERDUE` $\rightarrow$ `ESCALATED` $\rightarrow$ `RESOLVED`.

3. **Escalation Hierarchy**:
   - PHC Medical Officers $\rightarrow$ Facility Supervisor $\rightarrow$ District Health Administration.

4. **Audited Manual Overrides & Analytics**:
   - Authorized staff can resolve follow-ups with mandatory justification reasons.
   - Aggregates operational completion rate %, average arrival time, and overdue rates.

## IVR / No-Smartphone Health Access (Phase 12)

1. **Telephony Provider Abstraction & Webhook Engine**:
   - Telephony gateway abstraction (`ivr.provider.js`) with active Mock / Simulation provider and production hooks for Twilio/Exotel.
   - Webhook security: provider signature verification, timestamp replay protection, and per-caller rate limiting.
   - Real telephony availability depends on a configured provider; the system never falsely claims live PSTN calls without active credentials.

2. **Multilingual Voice Menu Navigation**:
   - Short, accessible, deterministic voice prompts in Hindi (`1`), Marathi (`2`), and English (`3`).
   - 1: Curated health education guidance.
   - 2: Authenticated referral status lookup (4-digit PIN verification).
   - 3: Verified PHC and hospital public information.
   - 4: Essential public medicine availability.
   - 5: PHC callback request creation (deduplicated to prevent staff spam).
   - 9: Repeat menu, 0: Exit.

3. **Strict Non-Diagnostic Safety & Emergency Triage Routing**:
   - IVR never diagnoses, prescribes medicines, or provides free-form AI medical chat.
   - Concerning symptom selections immediately route to emergency guidance (National Emergency Ambulance 108 / local casualty).
   - Caller privacy: Phone numbers masked in logs (`+91 98XXX XXXXX`), PINs and raw audio are never recorded.

## Anonymous Missed-Call Feedback System (Phase 13)

1. **Missed-Call & Outbound IVR Callback Flow**:
   - Low-friction feedback channel for citizens with basic 2G feature phones without smartphones or internet.
   - Citizen gives a missed call $\rightarrow$ Telephony webhook (`POST /api/feedback/missed-call`) triggers an automated callback with multilingual audio menus in Hindi, Marathi, and English.
   - Reuses Phase 12 `BaseIVRProvider` / `MockTelephonyProvider` / `ivrSecurity.js` layer.

2. **Genuine Anonymity by Default**:
   - Caller phone numbers, names, addresses, and profiles are **never stored** in anonymous feedback records (`contact_phone: null`, `contact_name: null`, `is_anonymous: true`).
   - "Anonymous feedback is intended for service-quality improvement and must not be used to identify or surveil callers."

3. **Deterministic Quality Analytics & Operational Signals**:
   - Computes average rating, positive %, negative %, category breakdown, channel breakdown (`MISSED_CALL`, `IVR`, `WEB`), and facility comparisons.
   - Non-punitive quality signal engine: Emits "Service-quality signal detected" (e.g. medicine inquiries or queue duration) for administrative resource review without accusing individual staff.

4. **Safe AI Summarization Guardrails**:
   - Summarizes aggregate metrics only; strictly prohibited from identifying callers, accusing staff, or inventing complaint trends.
   - Returns "Insufficient feedback data for a reliable summary" when $< 3$ records exist.

## Medicine Intelligence & PHC Supply Chain (Phase 14)

1. **Deterministic Inventory Depletion Engine**:
   - Computes weighted historical burn rate (7-day recent weight $w=0.65$, 30-day baseline $w=0.35$).
   - Calculates estimated days of stock remaining ($current\_quantity / daily\_consumption$).
   - Safe zero-consumption handling (`NO_RECENT_USAGE`, avoiding `NaN` / `Infinity`).
   - Operational risk tiers: `OUT_OF_STOCK`, `CRITICAL` ($\le 3$ days or $\le$ threshold), `LOW_STOCK` ($\le 7$ days), `WATCH` ($\le 14$ days), `NORMAL` ($> 14$ days), `INSUFFICIENT_DATA` ($< 3$ observation days).

2. **Auditable Stock Transactions Ledger (`medicine_stock_transactions`)**:
   - Tracks all stock events (`RECEIPT`, `DISPENSATION`, `ADJUSTMENT`, `DAMAGE`, `EXPIRY`, `TRANSFER_IN`, `TRANSFER_OUT`).
   - Atomic database transactions with strict non-negative stock constraint: `CHECK (current_quantity >= 0)`.

3. **Replenishment Workflow State Machine (`medicine_replenishment_requests`)**:
   - Operational lifecycle: `DRAFT` $\rightarrow$ `REQUESTED` $\rightarrow$ `APPROVED` / `REJECTED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `RECEIVED`.
   - Physical receipt atomically increments stock and logs a `RECEIPT` transaction.
   - Internal operational workflow between PHC and District Supply (zero external automatic purchasing).

4. **Strict Operational Boundary**:
   - Predicts operational inventory depletion ONLY.
   - Strictly prohibits clinical diagnosis, patient prescription, dosage calculations, or clinical recommendations.

## Referral Intelligence & Closed-Loop Care (Phase 15)

1. **10-Step Closed-Loop Care Lifecycle**:
   - $\text{CREATED} \rightarrow \text{PATIENT\_NOTIFIED} \rightarrow \text{DESTINATION\_ACCEPTED} \rightarrow \text{TRANSPORT\_ARRANGED} \rightarrow \text{PATIENT\_DEPARTED} \rightarrow \text{HOSPITAL\_ARRIVED} \rightarrow \text{HOSPITAL\_REGISTERED} \rightarrow \text{TREATMENT\_STARTED} \rightarrow \text{FOLLOW\_UP\_REQUIRED} \rightarrow \text{CLOSED}$.
   - Controlled state machine transitions enforce role and facility boundaries (PHC staff for departure, Hospital staff for arrival/registration/treatment, NGO for transport, PHC/Hospital for follow-up completion).
   - Backwards or arbitrary jumps (e.g. `CLOSED` $\rightarrow$ `CREATED`) are strictly rejected with `400 Bad Request`.

2. **Immutable Chronological Event Timeline (`referral_events`)**:
   - Single source of truth for referral history and auditability.
   - Appends events atomically on every milestone transition with actor profiles, notes, and metadata.

3. **Deterministic SLA Timing Windows & Delay Detection**:
   - Evaluates milestone progress against priority-based SLA windows (`emergency`, `urgent`, `routine`).
   - Flags operational statuses (`NORMAL`, `PENDING`, `DELAYED`, `FOLLOW_UP_OVERDUE`, `NO_CONFIRMATION`).
   - Deterministic closed-loop metrics: hospital arrival rate %, treatment initiation rate %, follow-up completion rate %, and average transit hours.

## Doctor Presence & PHC Service Availability Intelligence (Phase 16)

1. **Doctor Duty Sessions Lifecycle (`doctor_duty_sessions`)**:
   - Explicit lifecycle states: `SCHEDULED` $\rightarrow$ `CHECKED_IN` / `ON_DUTY` $\rightarrow$ `CHECKED_OUT`.
   - Contextual duty states: `LEAVE`, `AUTHORIZED_EXTERNAL_DUTY` (`OUTREACH_CAMP`, `VACCINATION_DRIVE`, `ADMINISTRATIVE`), and `DATA_PENDING` (rural connectivity offline sync).
   - Validated check-in prevents duplicate active sessions (`409 Conflict`) and verifies role/facility scoping.
   - Validated check-out correlates total clinical encounters (cases, vitals, referrals, activity gaps).

2. **Core Operational Principle: "NO PATIENTS != DOCTOR ABSENT"**:
   - Zero patient footfall does not indicate negligence or absence.
   - Integrates authorized duty context (outreach camps, mobile immunization, emergency transfers) and historical baselines to generate neutral, non-accusatory operational signals.

3. **Deterministic Presence & Anomaly Engine (`doctor_presence_signals`)**:
   - Signal types: `SCHEDULED_NOT_CHECKED_IN`, `CHECK_IN_NO_RECORDED_ACTIVITY`, `CHECK_IN_LOW_ACTIVITY`, `ACTIVITY_GAP_DETECTED`, `MISSING_CHECK_OUT`, `DATA_PENDING_CONNECTIVITY`.
   - Historical baseline calculator: Deterministic 30-day median case baseline (requires $\ge 3$ sessions; otherwise honest empty state).
   - Idempotent sweep and deduplicated notification triggers (`dedup_key: presence_sig_{sessionId}_{signalType}`).

4. **Human-in-the-Loop Administrative Review Workflow (`doctor_presence_reviews`)**:
   - Signal review outcomes: `CONFIRMED_DATA_ISSUE`, `CONFIRMED_OPERATIONAL_GAP`, `AUTHORIZED_REASON`, `NO_ISSUE`, `REQUIRES_FOLLOW_UP`.
   - Immutable audit trail recording reviewer, timestamp, and rationale.

## Rural Health Early-Warning & Outbreak Signal Intelligence (Phase 17)

1. **Core Principle: SIGNAL DETECTION $\neq$ OUTBREAK DECLARATION**:
   - JeevanSetu early-warning signals are operational indicators and are not medical diagnoses or confirmed outbreak declarations.
   - The system detects statistical deviations (e.g. *"Unusual increase in respiratory-related cases detected"*). Only authorized public-health authorities (District Health Officers, Surveillance Units) can confirm epidemiological events.

2. **Multi-Source Data Ingestion & Provider Layer**:
   - Ingests aggregated streams from:
     - PHC Clinical Case Presentations (`health_cases`) with symptom category filtering.
     - Medicine Dispensation Trends (`medicine_usage` / `medicine_inventory`).
     - Citizen Feedback & Service Friction (`feedback`).
     - Structured Community / ASHA reports abstraction (`community_asha`).
     - Weather & Environmental feeds abstraction (`weather_environmental`).
     - Retail Pharmacy Consumption abstraction (`pharmacy_sales`).

3. **Deterministic Statistical Anomaly Engine (`anomaly.utils.js`)**:
   - 28-day rolling baseline calculation (moving mean, standard deviation, Poisson variance bound).
   - Small-sample protection: Enforces minimum observation threshold to prevent public alarms in small rural habitations.
   - Single-day spike smoothing vs sustained multi-day surge detection.
   - Transparent multi-source correlation score ($0.0 - 100.0$) with non-causal descriptions.
   - Severity (`INFO`, `WATCH`, `WARNING`, `HIGH`) strictly separated from Confidence (`LOW`, `MEDIUM`, `HIGH`, `INSUFFICIENT_DATA`).

4. **Human-in-the-Loop Review & False-Positive Categorization (`early_warning_events`)**:
   - Signal Review Lifecycle: `NEW` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `RESOLVED` / `ESCALATED`.
   - Documented context findings: `NO_ANOMALY`, `DATA_ISSUE`, `SEASONAL_PATTERN`, `KNOWN_EVENT`, `REQUIRES_MONITORING`, `ESCALATED`.
   - Immutable audit trail recording reviewer, timestamp, decision, and rationale.

## Citizen Feedback, Anonymous Rating & Missed-Call/IVR Foundation (Phase 18)

1. **Core Principle: Feedback is a Service-Quality Signal**:
   - Citizen ratings and comments represent operational service-quality insights (e.g. *"Several anonymous responses mention medicine availability delays at this PHC"*).
   - Feedback is **not** clinical diagnosis, proof of negligence, corruption, or employee misconduct.
   - Internal reviews and supervisor notes must be recorded and audited before taking operational actions.

2. **Anonymous vs Authenticated Feedback Lifecycle**:
   - **Authenticated Feedback**: Linked to `patient_id`; authenticated citizens can view their historical submissions.
   - **Anonymous Feedback** (`is_anonymous: true`): Submitter PII (name, phone, ABHA ID) is stripped and never persisted into public/admin records. Displays `"Anonymous Citizen"`.
   - **Structured Ratings & Categories**: 1–5 star rating scale + standardized categories (`SERVICE_QUALITY`, `MEDICINE_AVAILABILITY`, `WAITING_TIME`, `STAFF_BEHAVIOUR`, `FACILITY`, `REFERRAL_EXPERIENCE`, `ACCESSIBILITY`, `OTHER`).
   - **Input Sanitization & Abuse Defense**: Comments capped at 500 characters, sanitized against XSS and prompt injection attempts. Anti-spam 60-second cooldown on identical submissions.

3. **Small-Sample Privacy Protection**:
   - Facilities with $< 3$ responses display `"Insufficient responses for aggregate display (< 3 responses)"` to prevent individual re-identification in small rural habitations.

4. **Supervisor Review Lifecycle & Audit Ledger (`feedback_review_events`)**:
   - Review states: `NEW` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`.
   - Internal notes are strictly restricted to health supervisors and never disclosed to public submitters.

5. **Safe AI Aggregate Synthesis & Prompt Injection Guardrails**:
   - AI summarizes aggregate metrics and top recurring categories.
   - Prohibited from: accusing staff, determining guilt, diagnosing patients, or revealing anonymous identities.
   - Explicit disclaimer: *"This is an AI-generated summary, not an investigation finding."*

6. **Multilingual Missed-Call / IVR Telephony Provider Abstraction**:
   - Supports English (`en`), Hindi (`hi`), Marathi (`mr`).
   - Clean telephony provider interface (`receiveWebhook`, `initiateCallback`, `playPrompt`, `collectInput`) documented as development simulation adapter.






