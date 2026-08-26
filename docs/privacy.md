# JeevanSetu Healthcare Privacy & Data Protection Architecture

## 1. Core Privacy Invariant
> **"Observability and operational monitoring must never become a source of sensitive healthcare data leakage. Personal Health Information (PHI) and Personally Identifiable Information (PII) are strictly minimized and segregated."**

---

## 2. Data Minimization & Redaction Framework

JeevanSetu enforces data minimization across all peripheral, external, and diagnostic subsystems:

### A. External Notifications (SMS & Email)
- **Recipient Isolation**: Dispatches contain only essential operational instructions (e.g. *"Your referral to Civil Hospital is registered. Case: JVS-MH-7A82K1"*).
- **No Diagnostic Exposure**: SMS payloads never include sensitive clinical findings, lab values, or complete patient medical history.
- **Phone Number Masking**: Logs and outbox tables display masked phone numbers (`+91 98XXX XX04`).

### B. n8n & External Orchestration Payloads
- **Stripped Identifiers**: Payloads dispatched to n8n include event IDs, aggregate IDs, and timestamps, but strip full patient profiles, ABHA IDs, and password tokens.
- **Redaction Engine**: The `sanitizeEventPayload` filter scans keys and values, replacing credentials with `[REDACTED]`.

### C. AI Context Minimization
- **Scoped Clinical Context**: The AI clinical assistant receives only the specific consultation query or symptom summary needed for health awareness, stripping patient names and government IDs.
- **Zero Prompt Storage**: Raw patient prompts are not retained permanently in public monitoring logs.

### D. Operational Telemetry & Error Traces
- **Zero PHI Logging**: Structured logs in `logger.js` and error traces in `error.middleware.js` automatically redact tokens, passwords, and sensitive keys.
- **Identifier Masking**: Operational tracing uses synthetic `request_id` and `event_id` rather than raw patient identifiers.

---

## 3. Anonymous Citizen Feedback Identity Protection

The citizen feedback system is designed to provide safe, low-barrier feedback without risking retribution:
- **No Profile Association**: Anonymous feedback records store `patient_id = NULL` and omit name and phone number.
- **Cryptographic Tracking Tokens**: Citizens can check resolution status using an isolated UUID tracking token (`x-tracking-token`) without creating an account or revealing their identity.
- **Row Level Isolation**: Database RLS prevents unauthorized users from enumerating anonymous feedback records.

---

## 4. Public Health Surveillance De-Identification

Public health early-warning intelligence operates exclusively on de-identified, aggregate population trends:
- **Spatial Aggregation**: Anomaly maps and cluster views aggregate counts at the `VILLAGE`, `TALUKA`, `PHC`, or `DISTRICT` level.
- **No Household Coordinates**: Private patient residential coordinates and contact details are never exposed on supervisory surveillance screens.
- **Small-Sample Protection**: Areas with fewer than 3 observed cases are protected to prevent statistical re-identification of rural patients.

---

## 5. Patient Autonomy & Notification Preferences

- **Consent & Opt-Outs**: Patients have granular control over non-essential communications via `user_notification_preferences`.
- **Channel Selection**: Users can independently enable or disable optional SMS alerts, email summaries, and IVR voice reminders.
- **Clinical Priority Safeguard**: Emergency and life-critical referral notifications remain active while respecting non-punitive communication rules.

---

## 6. Compliance Readiness Alignment (India DPDP & NDHM Guidelines)

| Compliance Principle | JeevanSetu Implementation | Verification |
|---|---|---|
| **Purpose Limitation** | Clinical data is collected solely for direct patient care, referral continuity, and de-identified public health monitoring. | Verified via strict RBAC & RLS |
| **Data Minimization** | Unnecessary fields are excluded from external workflows, AI prompts, and monitoring telemetry. | Verified via `redactSensitiveData` |
| **Storage Limitation** | Ephemeral cache nonces and logs expire automatically. | Verified via TTL & log retention |
| **Integrity & Confidentiality** | Encrypted in transit (TLS 1.3) and at rest (PostgreSQL AES-256). | Verified via Supabase configuration |
| **Right to Privacy** | Anonymous feedback path and masked phone numbers protect citizen confidentiality. | Verified via `phase26` & `phase30` test suites |

---

## 7. Environment Data Isolation & Leak Prevention (Phase 31)
- **Zero Cross-Contamination**: Development and testing environments strictly utilize synthetic mock data fixtures. Live production patient records are never cloned or exported to local developer machines or pull request runners.
- **Dedicated Database Clusters**: Staging and Production utilize separate, isolated Supabase database projects with distinct service credentials and encryption keys.

