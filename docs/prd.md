# JeevanSetu Product Requirements Document (PRD)

## Phase 21: Doctor Presence & PHC Attendance Integrity

### 1. Objective
Provide authorized PHC and district health administrators with operational visibility into doctor duty scheduling, check-in/out timestamps, and clinical case activity.

### 2. Core Principles & Philosophy
- **Neutral Operational Integrity**: Low recorded clinical activity is an operational signal requiring review (`LOW_RECORDED_ACTIVITY` / `REQUIRES_REVIEW`), never proof of doctor absence, fraud, or misconduct.
- **Attendance Truth**: Attendance truth is grounded in explicit attendance records; patient activity is a separate supporting signal.
- **Server Timestamp Truth**: All check-in and checkout timestamps originate from server-side database clocks.
- **No Continuous Surveillance**: No continuous GPS tracking, facial recognition, camera, or microphone monitoring.
- **Human-Only Confirmation**: The `CONFIRMED` operational gap state requires explicit action by an authorized human District Administrator. AI is strictly read-only.
- **Role Scoping & Strict RLS**: Patients are completely forbidden from viewing or modifying doctor attendance data.

## Phase 22: Referral Follow-Up & Treatment Completion Tracking

### 1. Objective
Solve the core rural healthcare problem: *"Patient ko PHC se higher hospital refer karne ke baad kya woh actually hospital pahucha, treatment mila, aur follow-up complete hua?"*

### 2. Core Principles
- **Semantic Safety Principle ("Absence of Digital Event $\ne$ Absence of Care")**: A missing digital event is strictly labeled as `"Hospital arrival not yet confirmed"` or `"Follow-up has not been digitally recorded by the due date"`, never as `"Patient failed to reach hospital"` or `"Patient abandoned treatment"`.
- **Dual Patient & Hospital Acknowledgement**: Patient self-reported arrival without hospital confirmation is safely stored as `PATIENT_REPORTED_ARRIVAL / HOSPITAL_CONFIRMATION_PENDING`.
- **Append-Only Event Ledger**: All state changes, destination transfers, and cancellations append immutable timeline records to `referral_events`.
- **Deterministic Completion Invariant**: Referrals become `COMPLETED` only when hospital treatment is recorded and follow-up is either not required or verified completed.
- **Non-AI Clinical Due Dates**: Follow-up due dates and treatment status originate strictly from authorized clinical staff, never invented by AI.
- **SMS Privacy**: Outgoing SMS messages contain neutral updates without sensitive diagnoses or medical history.

## Phase 23: Medicine Inventory & AI Demand Forecasting

### 1. Objective
Solve the core rural medicine availability problem: *"PHC mein medicine khatam hone ka pata stock-out ke baad nahi, pehle chalna chahiye."*

### 2. Core Principles
- **Inventory Truth Invariant**: Stock balance truth resides strictly in transactional database records (`current_quantity >= 0`). AI is advisory and has zero mutation permissions on stock quantities.
- **Honest Data Sufficiency ("No Fabricated Forecasts")**: When observation history is $< 3$ days or 90-day window data is missing, the system explicitly outputs `INSUFFICIENT_DATA` and returns `estimated_stockout_date: null`, never hallucinating demand.
- **Zero Usage Handling**: When daily consumption is 0, days of stock remaining returns `null` / `UNKNOWN` instead of misleading `Infinity` coverage.
- **Current Alert vs. Forecast Alert Separation**:
  - *Current Alert*: `current_quantity <= minimum_threshold` (immediate shortage).
  - *Forecast Alert*: `estimated_threshold_date` or `estimated_stockout_date` is approaching within configured lead time buffer.
- **Concurrency Safety**: Stock receipts, dispensations, and adjustments execute via atomic balance validations preventing simultaneous overselling or negative stock balances.
- **Clinical & Operational Safety Guardrails**: AI must never prescribe medicines, recommend drug substitution or dosage, or make clinical treatment decisions.

## Phase 24: JeevanSetu IVR / Feature-Phone Health Access

### 1. Objective
Enable universal voice accessibility for rural citizens who do not own smartphones or have reliable internet connectivity ("Gaon mein har person ke paas smartphone ya reliable internet nahi hota. JeevanSetu ko basic health-access workflow feature phone se bhi available karna chahiye.").

### 2. Core Principles
- **Strict Non-Diagnostic Boundary**: The IVR system provides informational health guidance, facility lookups, referral status checking, medicine availability, and ASHA callback queues. It NEVER diagnoses disease, prescribes medicines, or recommends dosages.
- **Deterministic 108 Emergency Alert**: Red-flag emergency symptoms immediately route to deterministic 108 Emergency Ambulance guidance and hang up without AI deliberation.
- **Telephony Provider Abstraction**: Vendor-neutral `BaseIVRProvider` interface with `MockTelephonyProvider` and live `ProductionTelephonyAdapter`.
- **Privacy & Security**: Automated phone number masking (`+91 98XXX XX04`), 4-digit PIN authentication for personal referral tracking, rate limiting (30 req/min), and webhook replay protection.
- **Safe AI Response Contract**: JSON structured validation (`formatSafeIVRPrompt`) with deterministic local dictionary fallback on any anomaly or prompt injection attempt.

## Phase 25: Doctor Presence & PHC Operational Accountability Intelligence

### 1. Objective
Identify operational data inconsistencies between scheduled doctor duty, check-in records, and patient encounters across rural PHCs to generate review flags for human administrative review.

### 2. Core Principles
- **Strict Non-Disciplinary Principle**: "JeevanSetu identifies operational data inconsistencies for human review. It does not determine doctor misconduct or automatically impose disciplinary action."
- **Authoritative Server Timestamps**: Check-in and check-out rely strictly on database server timestamps to prevent client-side backdating or clock manipulation.
- **False-Positive Recognition**: Zero recorded encounters during duty is recognized as potential legitimate non-clinical duty (outreach camps, school checkups, administrative reporting, training, temporary facility closure, emergency deployments, or offline sync delays).
- **Human-in-the-Loop Review**: Authorized supervisors (PHC staff / District Admins) review flags with options to `ACKNOWLEDGE`, `DISMISS` (with legitimate explanation categories), `RESOLVE`, or `ADD_NOTE`. All actions are immutably audited in `doctor_operational_reviews`.
- **Doctor Privacy & Role Scoping**: Patients and unauthorized public users are strictly blocked from doctor presence and accountability intelligence.
- **Safe Advisory AI Explainer**: Structured JSON contract (`{ summary, evidence, possible_explanations, recommended_review_action, confidence }`) with strict prohibition against declaring absence, negligence, or punishment.

## Phase 26: Citizen Feedback & Missed-Call System

### 1. Objective
Enable rural citizens to submit low-barrier, inclusive, and privacy-preserving feedback regarding public health facility services (PHC care, doctor consultation availability, medicine stock, waiting times, staff behaviour, cleanliness, and referral transit) across Web, 2G Feature-Phone IVR, Missed-Call callbacks, and SMS.

### 2. Core Principles
- **Operational Service Signal Invariant**: *"Citizen feedback is an operational signal and is not automatically treated as verified fact."*
- **Non-Authentication Invariant**: *"Anonymous feedback must not be used as an authentication mechanism for private health information."*
- **Privacy-Preserving Anonymity**: For anonymous feedback, raw phone numbers and PII are stripped from staff-facing records. Technical caller identifiers for rate limiting are stored as salted SHA-256 hashes (`caller_hash`) with masked phone display (`+91 98XXX XX04`).
- **Secure Tracking Tokens**: Anonymous lookup by phone number is strictly barred to prevent enumeration; status tracking is securely gated by random tokens (`JS-FB-XXXX-XXXX`).
- **Standardized Categories & Ratings**: Normalized support for 9 canonical categories (`PHC_SERVICE`, `DOCTOR_AVAILABILITY`, `STAFF_BEHAVIOUR`, `MEDICINE_AVAILABILITY`, `WAITING_TIME`, `CLEANLINESS_FACILITY`, `REFERRAL_EXPERIENCE`, `EMERGENCY_SERVICE_ACCESS`, `OTHER`) and optional 1-5 star ratings.
- **Provider Abstraction Honesty**: When live telephony or SMS gateways are unconfigured in development, the system explicitly records `PROVIDER_NOT_CONFIGURED` without claiming simulated messages were sent over live PSTN/carrier networks.
- **Anti-Spam & Abuse Throttling**: Abusive or bot-generated submissions are tagged with `POSSIBLE_SPAM` status rather than silently deleted.
- **Audited Supervisory Workflow**: Authorized PHC staff and District Administrators review feedback through formal lifecycle actions (`ACKNOWLEDGE`, `ASSIGN`, `ADD_NOTE`, `RESOLVE`, `DISMISS`, `MARK_SPAM`) backed by immutable audit event logs.
- **Safe Assistive AI**: AI categorization, summarization, and translation treat citizen text as untrusted data with prompt injection defense, preserving original text and providing grounded non-punitive insights.

## Phase 27: Public Health Early Warning & Outbreak Intelligence

### 1. Objective
Implement JeevanSetu's multi-signal public health early warning system, combining operational health signals (PHC clinical case trends, medicine consumption spikes, citizen feedback clusters, and ASHA community field observations) to detect statistical anomalies for human public-health review.

### 2. Core Principles
- **Core Invariant**: *"JeevanSetu provides early-warning signals for human public-health investigation. It does not autonomously diagnose disease or declare outbreaks."*
- **Absence Principle**: *"Absence of a signal does not prove absence of disease."*
- **Operational Non-Diagnostic Signal**: An early warning answers: *"Is there an unusual change in available health/service data that deserves human investigation?"* It NEVER answers: *"Is there definitely an outbreak?"*
- **Privacy & Map Protection**: Public health surveillance operates exclusively on aggregate, de-identified data. Patient names, phone numbers, ABHA IDs, household coordinates, and individual case details are strictly excluded from early-warning dashboards.
- **Provider Abstraction Honesty**: When external weather feeds are unconfigured, mark `WEATHER_DATA_UNAVAILABLE` without fabricating meteorological values. When external pharmacy integration is unconfigured, mark `PHARMACY_SIGNAL = NOT_AVAILABLE` without fabricating OTC sales data.
- **Pure Deterministic Statistical Engine**: Z-scores, percentage deviation, moving averages (7d, 14d, 28d), single-day spike smoothing, small-sample protections ($< 3$ cases), baseline insufficiency handling ($< 14$ days $\rightarrow$ `INSUFFICIENT_DATA`), and staleness detection ($> 48$ hours without sync $\rightarrow$ `DATA_STALE`).
- **Human-in-the-Loop Supervisory Review**: Formal review workflow (`DETECTED`, `UNDER_REVIEW`, `VERIFIED`, `DISMISSED`, `RESOLVED`) supporting actions (`ACKNOWLEDGE`, `REQUEST_INVESTIGATION`, `VERIFY`, `DISMISS`, `RESOLVE`, `ADD_NOTE`) with legitimate dismissal/resolution categories (`SEASONAL_VARIATION`, `DATA_ENTRY_CHANGE`, `REPORTING_INCREASE`, `MEDICINE_REDISTRIBUTION`, `OUTREACH_CAMP`, `TEMPORARY_EVENT`, `NO_ANOMALY`, `OTHER`).
- **Strictly Non-Alarmist AI Contract**: Validated JSON structure (`{ summary, signals, evidence, possible_explanations, data_limitations, recommended_review_questions }`), prompt injection sanitization against adversarial outbreak overrides, and standard advisory disclaimers.

## Phase 28: Automation, n8n & External Integration Orchestration

### 1. Objective
Introduce the production automation, transactional Outbox pattern, and external integration orchestration layer for JeevanSetu without moving core business rules, authorization, database truth, or clinical safety into external workflow engines.

### 2. Core Principles & System Boundaries
- **Source-of-Truth Invariant**: *"JeevanSetu backend remains the single source of truth. n8n is an optional orchestration layer, not the application's security, database, or business-logic authority."*
- **No Required Paid Services**: Local development operates completely with mock providers (`N8N_ENABLED=false`, `MOCK_PROVIDERS=true`).
- **Provider Abstraction Honesty**: When provider credentials are absent, adapters gracefully report `isConfigured() = false` and `PROVIDER_NOT_CONFIGURED` without claiming live delivery.
- **Outbox Pattern & Idempotency**: All transactional events (`REFERRAL_CREATED`, `MEDICINE_LOW_STOCK`, `FEEDBACK_SUBMITTED`, `EARLY_WARNING_CREATED`, etc.) are persisted to `outbox_events` with unique `idempotency_key` constraints before dispatch.
- **Controlled Retry & Dead-Letter Handling**: Exponential backoff retry engine (`PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `SENT` / `RETRYING` $\rightarrow$ `ABANDONED`) with max retries and manual retry trigger for District Administrators.
- **Inbound Webhook Security**: HMAC SHA-256 signatures (`x-webhook-signature`), timestamp drift validation ($\le 5$ min), and nonce replay protection.
- **Data Minimization & Redaction**: Automatic stripping of secrets and masking of phone numbers (`+91 98XXX XX04`) and ABHA IDs before sending payloads to external orchestration workflows.
- **User Notification Preferences**: Respects user opt-outs (`user_notification_preferences`) for optional SMS/email/duty alerts.

## Phase 29: Production Observability, Monitoring, Reliability & Disaster Recovery

### 1. Objective
Establish production reliability, observability, error tracking, health probes, background job monitoring, and disaster recovery readiness without leaking sensitive healthcare information or compromising patient privacy.

### 2. Core Principles & Safeguards
- **Observability Data Protection Invariant**: *"Observability must never become a source of sensitive healthcare data leakage."* Passwords, tokens, API keys, full phone numbers, and ABHA IDs are automatically redacted from all telemetry.
- **Structured Tracing**: Unique `request_id` correlation across requests, backend logs, error records, and outgoing response headers.
- **Safe Error Classification**: Standard taxonomy (`VALIDATION_ERROR`, `AUTHENTICATION_ERROR`, `AUTHORIZATION_ERROR`, `NOT_FOUND`, `DATABASE_ERROR`, `EXTERNAL_PROVIDER_ERROR`, `AI_PROVIDER_ERROR`, `RATE_LIMITED`, `TIMEOUT`, `INTERNAL_ERROR`) with sanitized messages in production.
- **Standard Health Probes**: `/api/health` (overview), `/api/health/live` (liveness), `/api/health/ready` (readiness with dependency status and degraded feature listing).
- **Background Job Monitoring & Stuck Detection**: Runtime tracking with configurable stuck threshold (default 5 minutes).
- **Lightweight Operational Metrics**: Traffic counters, error rate %, latency distributions (average, p95), AI fallbacks, and IVR errors.
- **Alert Deduplication**: Cooldown windows and fingerprinting prevent alert storms.
- **Disaster Recovery Runbooks**: Documented in `docs/operations.md` and `docs/disaster-recovery.md`.

## Phase 30: Production Security Hardening, Privacy & Compliance Readiness

### 1. Objective
Harden application security, audit authorization and Row Level Security across all sensitive database tables, implement API abuse prevention and rate limiting, ensure strict privacy and data minimization, and document healthcare compliance readiness for India DPDP and NDHM standards.

### 2. Core Principles & Security Safeguards
- **Server-Side Authority Principle**: *"Security must be enforced server-side. Never trust localStorage, frontend role selectors, frontend route guards, client-provided user IDs, client-provided roles, hidden UI elements, query parameters, or webhook payloads. The backend + Supabase Auth + PostgreSQL RLS remain authoritative."*
- **Role-Based Access Control (RBAC)**: All 6 roles (`patient`, `phc_staff`, `doctor`, `hospital_staff`, `ngo_staff`, `district_admin`) verified server-side via trusted database profile records. Client-provided role mutations are strictly blocked.
- **Insecure Direct Object Reference (IDOR) Protection**: Multi-tier boundary checks ensure patients can only access their own records (`patient_id === req.user.profileId`), PHC staff are restricted to their assigned facility (`assigned_phc_id`), hospital staff to their facility (`assigned_hospital_id`), and NGO staff to their fleet (`assigned_ngo_id`).
- **Database Row Level Security (RLS)**: Enforced on 100% of sensitive tables (`profiles`, `doctors`, `health_cases`, `health_case_vitals`, `referrals`, `referral_events`, `medicine_inventory`, `feedback`, `feedback_interactions`, `public_health_early_warnings`, `outbox_events`, `user_notification_preferences`, `audit_logs`).
- **Secret Isolation & Repository Hygiene**: Zero committed production secrets or private keys. Service role credentials restricted to server-side backend. Root `.gitignore` configured to isolate credentials and certificates.
- **API Rate Limiting & Abuse Prevention**: Sliding window limiters on general API (300/min), auth (30/15min), AI (20/min), feedback (15/min), and webhooks (120/min). Helmet headers configured (CSP, `frameguard: { action: 'deny' }`, `hidePoweredBy`, `nosniff`). Request body limited to 10kb to mitigate memory exhaustion.
- **Data Minimization & Redaction**: Automatic stripping of secrets and tokens (`[REDACTED]`), phone masking (`+91 98XXX XX04`), anonymous feedback tracking isolation (`tracking_token`), and small-sample suppression ($< 3$ cases) for rural health surveillance.
- **Documentation**: Comprehensive `docs/security.md` (14-threat model matrix, RBAC, RLS, API security, webhook security, secret hygiene, incident response) and `docs/privacy.md` (data minimization framework, de-identification, DPDP India & NDHM compliance alignment).

## Phase 31: Production Deployment, CI/CD & Release Engineering

### 1. Objective
Establish reproducible production deployment architecture, clear environment separation (`DEVELOPMENT`, `STAGING`, `PRODUCTION`), continuous integration pipelines, containerization, migration safety standards, and operational release runbooks.

### 2. Core Principles & Deployment Safeguards
- **Zero Cross-Environment Contamination**: Each environment maintains strictly isolated configuration, databases, and secrets. No development or staging instance connects to production databases.
- **Fail-Safe Startup**: Missing required production variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`) block application startup with a clear error without printing secret values.
- **Graceful Degradation**: Missing optional provider credentials (SMS, Weather, n8n) gracefully downgrade to mock or degraded modes without crashing core healthcare APIs.
- **Zero Committed Secrets**: Secrets are injected via host platform environment variables (Vercel, Render, Fly.io, Railway) and never committed to git.
- **Non-Destructive Migrations & Forward-Fix**: Live database updates are additive. Fixes are deployed via new migrations rather than destructive rollbacks.
- **Reproducible Containerization**: Multi-stage `Dockerfile` and `docker-compose.yml` enable local, air-gapped, or staging deployment with exact dependency alignment.
- **Release Quality Gates**: 100% test pass rate, clean production build, and migration validity required for release sign-off.

## Phase 32: Final End-to-End QA, Integration & User Acceptance Testing

### 1. Objective
Execute end-to-end integration and user acceptance testing across all primary user journeys (Patient, PHC Staff, Doctor, Hospital Staff, NGO Staff, District Admin) and subsystems (IVR, Inventory, Forecasting, Early Warning, AI, Notifications, Outbox Automation), validating compliance with healthcare quality standards, clinical safety boundaries, and privacy protections.

### 2. Core Principles & Quality Safeguards
- **Synthetic Test Isolation**: Testing exclusively utilizes non-identifiable synthetic accounts and mock clinical records. Live patient data is never simulated or accessed.
- **End-to-End Lifecycle Verification**: All critical operational paths (6-stage closed-loop referrals, inventory stockout forecasting, DTMF emergency 108 bypass, small-sample epidemiological suppression) are verified across frontend, API, outbox, and database layers.
- **Strict Role Boundaries & IDOR Prevention**: Server-side authorization and database RLS ensure no user or staff member can access or mutate cross-facility or cross-patient records.
- **Graceful Fault Recovery**: The application must withstand upstream provider downtimes (AI, SMS, n8n, DB transient drops) and recover seamlessly with zero data corruption.
- **100% Quality Sign-Off**: Release sign-off requires 100% automated test pass rate (380/380 tests) and 0 unhandled build warnings.

## Phase 33: Release Candidate Hardening & Final Regression

### 1. Objective
Harden the verified codebase into an official Release Candidate (`JEEVANSETU-RC-33`), establish a formal change freeze, eliminate all release blockers, and execute full-spectrum regression testing across data integrity, RBAC/RLS boundaries, clinical safety, emergency handling, and external resilience.

### 2. Release Candidate Invariants & Verification Standards
- **Release Candidate ID**: Formally identified as `JEEVANSETU-RC-33` (Release Version 1.0.0).
- **Strict Change Freeze**: Zero feature additions. Codebase locked against non-critical modifications.
- **Zero Unresolved P0 / P1 Issues**: 0 Critical and 0 High defects permitted in Release Candidate state.
- **Full-Spectrum Regression**: 100% test pass rate across all 8 automated suites (425/425 tests) and Next.js static production build.
- **Clinical Safety Assurance**: Non-diagnostic AI guardrails and deterministic 108 emergency telephony preemption guaranteed without single points of failure.

## Phase 34: Production Operations, Backup, Monitoring & Go/No-Go Readiness

### 1. Objective
Establish complete operational governance, real-world monitoring, structured alerting, automated and manual backup strategies, synthetic restore verifications, 12 disaster scenario runbooks, role-based operational guides, and formal Go/No-Go release authorization for the JeevanSetu healthcare platform.

### 2. Operational Invariants & Safeguards
- **Zero Real Production Deployments**: Do not deploy automatically to live cloud infrastructure or incur service charges.
- **Fail-Safe Observability**: Structured JSON logs sanitize all secrets and PII; `/api/health`, `/api/health/live`, and `/api/health/ready` probes provide non-leaking operational telemetry.
- **Target RPO / RTO Bounds**: Target RPO $\le 1$ hour (Point-In-Time Recovery), Target RTO $\le 4$ hours (Disaster Reconstruction).
- **Incident Response Readiness**: 5-stage incident response lifecycle with SEV-1 to SEV-4 severity classifications and role-based ownership.
- **Official Go / No-Go Decision**: Release authorization requires 10 of 10 quality gates passing, zero P0/P1 blockers, and 100% automated test pass rate.

## Phase 35: Final Production Launch Rehearsal & Go/No-Go

### 1. Objective
Execute a comprehensive production launch rehearsal of the JeevanSetu platform, simulating all 6 primary user journeys (Patient, PHC Staff, Doctor, Hospital Staff, NGO Staff, District Admin), validating full disaster recovery and rollback procedures, verifying zero clinical and privacy regressions, and delivering the final Go/No-Go release determination.

### 2. Pre-Launch Rehearsal Standards
- **Zero Real Production Deployments**: Do not deploy automatically to live cloud infrastructure or incur service charges.
- **Full User Journey Execution**: Rehearse complete workflows across patient intake, clinical review, 6-stage closed-loop referrals, inventory stockout forecasting, IVR DTMF navigation, and early warning surveillance.
- **Defensive & Privacy Standards**: 100% RLS coverage, server-side RBAC, UUID feedback isolation, and $< 3$ case cluster suppression.
- **Deterministic Emergency Routing**: Emergency 108 helpline routing immediately preempts AI inference for acute symptoms.
- **Final Go/No-Go Result**: Formal `GO` authorization confirmed with 10 of 10 gates passing and 0 unresolved blockers.












