# JeevanSetu Security Threat Model & Risk Analysis

## 1. Executive Summary & Methodology
This threat model applies the **STRIDE** methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to evaluate risks across the JeevanSetu architecture, defining existing mitigations and residual operational risk.

---

## 2. Threat Catalog (Threats T1 through T12)

| Threat ID | Threat Category | Threat Description | Target Asset | Severity | Existing Platform Mitigation | Residual Risk |
|---|---|---|---|---|---|---|
| **T1** | Information Disclosure | Unauthorized user attempts to view another patient's health cases or vitals. | Health Cases & Vitals | **CRITICAL** | PostgreSQL Row-Level Security (RLS) and server-side profile ownership checks (`getCaseById`). | Low |
| **T2** | Elevation of Privilege | Patient or PHC staff attempts to access administrative surveillance or alter global settings. | Admin Dashboard & Settings | **CRITICAL** | Server-side `requireRole(...)` middleware rejects unauthorized roles with HTTP 403. | Low |
| **T3** | Spoofing | Compromised staff credentials used to initiate malicious referrals. | Referral Lifecycle | **HIGH** | JWT expiration, sliding-window rate limiting, and immutable `audit_logs` tracking actor ID. | Low-Medium (Phishing risk) |
| **T4** | Tampering | Forged inbound webhook pretending to be telephony provider or n8n orchestrator. | Webhook Ingestion Routes | **HIGH** | Cryptographic HMAC SHA-256 signatures, nonce cache, and $\pm 5$-minute replay drift bounds. | Low |
| **T5** | Tampering | Malicious user injects adversarial prompts into AI triage chat to elicit prescriptive outputs. | AI Service & Safety | **HIGH** | Strict system prompt constraints, schema output validation, and non-diagnostic disclaimers. | Low |
| **T6** | Information Disclosure | Upstream LLM provider leaks patient PII or retains chat logs for model training. | Patient Symptoms & PII | **HIGH** | Sanitized prompt payloads stripping phone numbers (`+91 98XXX XX04`) and direct identifiers. | Low |
| **T7** | Tampering / Info Leak | Direct SQL injection or database exploit targeting relational records. | PostgreSQL Database | **CRITICAL** | Parameterized query APIs via Supabase client; zero raw string SQL interpolation. | Low |
| **T8** | Information Disclosure | Service role key or DB password leaked in client-side bundles or git history. | Platform Master Secrets | **CRITICAL** | Strict secret isolation: client environments only expose public anonymous keys (`NEXT_PUBLIC_`). | Low |
| **T9** | Information Disclosure | SMS notification broadcasts unmasked patient health data over cellular network. | SMS Transmissions | **MEDIUM** | Notifications contain generic milestone updates with masked phone numbers (`+91 98XXX XX04`). | Low |
| **T10** | Denial of Service | Malicious caller floods IVR telephony webhook to exhaust server resources. | IVR Inbound Gateway | **HIGH** | Sliding-window IP rate limiters and fast $< 50$ms DTMF state machine transitions. | Low |
| **T11** | Tampering | Duplicate automation events cause repeated stock deductions or message storms. | Medicine Stock & Outbox | **HIGH** | Outbox pattern enforces unique `idempotency_key` and atomic stock checks (`qty >= 0`). | Low |
| **T12** | Tampering / Repudiation | Insider staff member alters medicine inventory logs without authorization. | Medicine Inventory Ledger | **HIGH** | Single-row conditional updates, facility scoping checks, and immutable audit trails. | Low |

---

## 3. Residual Risk Management Policy
- Quarterly RLS and RBAC audits must be conducted by the **Security Owner** and **Database Owner**.
- Automated vulnerability scanning (`npm audit`) must be executed prior to each minor and major release.
