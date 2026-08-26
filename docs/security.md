# JeevanSetu Production Security Architecture & Threat Model

## 1. Core Security Principle
> **"Security must be enforced server-side. Never trust localStorage, client-provided roles, client-provided user IDs, hidden UI elements, query parameters, or raw webhook payloads. The backend API, Supabase Auth, and PostgreSQL Row Level Security (RLS) remain authoritative."**

---

## 2. Threat Model Matrix (14 Threat Scenarios)

| # | Threat Scenario | Attack Vector | Potential Impact | System Mitigation | Remaining Risk |
|---|---|---|---|---|---|
| 1 | **Compromised Patient Account** | Stolen credentials or session hijack | Unauthorized access to patient's own history | Short-lived JWTs, MFA option, account activity auditing, rate limiting | User endpoint device compromise |
| 2 | **Compromised Staff Account** | Phished PHC/Hospital credentials | Exposure of facility patient cases | Role-based facility scoping, strict RLS, immutable audit logging of case reads | Social engineering of staff |
| 3 | **Privilege Escalation** | Patient submits `{ "role": "district_admin" }` | Unauthorized administrative takeover | Server-side role immutability, database triggers (`trg_prevent_role_escalation`), strict mass assignment whitelists | None (Server strictly rejects client-supplied roles) |
| 4 | **Insecure Direct Object Reference (IDOR)** | Patient A requests Patient B's Case / Referral ID | Cross-patient health data breach | Backend verifies `patient_id == req.user.profileId` and RLS `auth.uid() = user_id` enforces row isolation | None |
| 5 | **Malicious / Spoofed Webhook** | Attacker invokes automation endpoint with fabricated payload | Unauthorized state mutations | HMAC SHA-256 signature verification (`x-webhook-signature`) with secret | Secret leak if server compromised |
| 6 | **Stolen API Key / Secret** | Hardcoded credentials checked into repository | Cloud provider / database compromise | Secret scanning, `.gitignore` isolation, zero committed production keys, environment variable injection | Operator misconfiguration |
| 7 | **AI Prompt Injection** | Adversary inputs text instructing AI to ignore clinical rules | Fabricated clinical triage / alert falsification | System prompt boundaries, untrusted input containment, strict JSON schema validation, non-diagnostic boundaries | Zero (AI cannot execute mutations directly) |
| 8 | **Notification / SMS Spam** | Automated script triggers high volume of SMS alerts | Financial cost, patient harassment, carrier blocking | Strict sliding-window rate limiting, cooldown windows, user opt-out preferences | Distributed IP bot attacks |
| 9 | **IVR / Telephony Flooding** | Attacker repeatedly dials missed-call numbers | Telecom denial of service, queue exhaustion | Per-caller rate limiting, phone number masking, attempt caps, deduplication | Telecom network-level spoofing |
| 10 | **Direct Database Exposure** | Public internet access to PostgreSQL | Mass healthcare data exfiltration | Supabase RLS enabled on 100% of tables, service role restricted server-only, TLS 1.3 encryption | Supabase infrastructure zero-day |
| 11 | **Frontend Secret Leakage** | Service-role key bundled in Next.js client code | Complete platform takeover | Next.js `NEXT_PUBLIC_` strict namespace auditing, zero server secret imports in `/app` client components | Developer build errors (audited in CI) |
| 12 | **Malicious Administrator Action** | Rogue District Admin attempts silent case modification | Unauthorized clinical/audit tampering | PostgreSQL append-only immutable `audit_logs` table, trigger protection | Physical database root access |
| 13 | **Automated Bot Abuse** | Credential stuffing / scraping public endpoints | Resource exhaustion, account discovery | Express rate limiters (`authLimiter`, `feedbackLimiter`), generic auth error messages | Slow stealth botnets |
| 14 | **External Provider Compromise** | Upstream SMS/Weather provider breached | Inaccurate external signals | Provider abstraction boundaries, honest unconfigured reporting, deterministic fallback | Upstream service unavailability |

---

## 3. Authentication & Session Management
- **Authority**: Supabase Auth handles password hashing (bcrypt/argon2), JWT issuance, and refresh token rotation.
- **No Custom Passwords**: JeevanSetu never implements custom password storage, salt generation, or plaintext caching.
- **Token Handling**:
  - Short-lived JWTs (typically 1 hour).
  - Bearer token authentication verified server-side on every protected Express endpoint.
  - Sessions invalidated immediately upon logout.
- **Account Enumeration Defense**: Authentication failures return generic error messages (*"Invalid or expired authentication token"* / *"Invalid email or password"*).

---

## 4. Role-Based Access Control (RBAC) & Boundary Enforcement

JeevanSetu strictly partitions authorization across six distinct roles:

1. **`patient`**:
   - Access restricted strictly to own profile, own health cases, own referrals, and own notifications.
   - Prohibited from accessing other patients' data or administrative dashboards.
2. **`phc_staff`**:
   - Scoped strictly to assigned Primary Health Centre (`assigned_phc_id`).
   - Can create cases, initiate referrals, dispense medicines, and track inventory for their assigned facility.
3. **`doctor`**:
   - Can review cases, record clinical vitals, update treatment stages, and view facility queue.
4. **`hospital_staff`**:
   - Scoped strictly to assigned Community Health Centre / Sub-District Hospital (`assigned_hospital_id`).
   - Can accept incoming referrals, log patient arrival, register admissions, and record treatment completion.
5. **`ngo_staff`**:
   - Scoped strictly to assigned NGO emergency transport fleet (`assigned_ngo_id`).
   - Can manage transport logistics and log transit arrival.
6. **`district_admin`**:
   - District-wide supervisory oversight across PHCs, hospitals, attendance records, feedback, and early warnings.
   - Exclusive access to Outbox monitoring (`/admin/automation`) and Operations desk (`/admin/operations`).

---

## 5. PostgreSQL Row Level Security (RLS) Matrix

| Database Table | Public Access | Authenticated Patients | Facility Staff (`phc_staff`, `hospital_staff`, `doctor`) | District Administrator |
|---|---|---|---|---|
| `profiles` | `DENIED` | `SELECT`/`UPDATE` own row | `SELECT` patient profiles under clinical care | `SELECT`/`UPDATE` district profiles |
| `health_cases` | `DENIED` | `SELECT`/`INSERT` own cases | `SELECT`/`UPDATE` assigned facility cases | `SELECT`/`UPDATE` district cases |
| `health_case_vitals` | `DENIED` | `SELECT` own case vitals | `SELECT`/`INSERT` clinical vitals | `SELECT` district case vitals |
| `referrals` | `DENIED` | `SELECT` own referrals | `SELECT`/`UPDATE` originating or destination facility referrals | `SELECT`/`UPDATE` district referrals |
| `medicine_inventory`| `SELECT` (stock view) | `SELECT` | `SELECT`/`UPDATE` assigned PHC inventory | `SELECT`/`UPDATE` district inventory |
| `feedback` | `INSERT` (anonymous) | `SELECT`/`INSERT` own feedback | `SELECT`/`UPDATE` assigned facility feedback | `SELECT`/`UPDATE` district feedback |
| `outbox_events` | `DENIED` | `DENIED` | `DENIED` | `SELECT`/`UPDATE` (Manual Retry) |
| `audit_logs` | `DENIED` | `DENIED` | `DENIED` | `SELECT` (Read-only immutable) |

---

## 6. API Hardening & Abuse Prevention

- **Input Validation**: Strict schema validation on query, path, and body parameters (UUIDs, enums, type constraints).
- **Request Size Limiting**: `express.json({ limit: "10kb" })` prevents memory exhaustion and payload injection.
- **Rate Limiting**:
  - Global API limiter: 300 reqs / min.
  - Auth limiter: 30 attempts / 15 min.
  - AI chat limiter: 20 prompts / min.
  - Feedback limiter: 15 submissions / min.
  - Webhook limiter: 120 calls / min.
- **Security Headers (Helmet)**:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY` (anti-clickjacking)
  - `X-Content-Type-Options: nosniff` (anti-MIME sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Powered-By` header suppressed.

---

## 7. Webhook & Orchestration Security
- **Signature Verification**: HMAC SHA-256 signature calculated over payload using `N8N_WEBHOOK_SECRET` and validated in constant-time.
- **Timestamp Drift Protection**: Clock drift exceeding 5 minutes ($\pm 300$s) rejected with HTTP 403.
- **Nonce Replay Cache**: Processed nonces recorded in `webhook_replay_nonces` table / memory; duplicate nonces rejected with HTTP 409 Conflict.

---

## 8. AI & Clinical Safety Boundaries
- **Strictly Advisory**: AI outputs are non-diagnostic and cannot autonomously authorize treatment or declare disease outbreaks.
- **Emergency Routing Immutability**: AI and external automation cannot override deterministic IVR emergency transfer rules.
- **Prompt Injection Containment**: All external text (including field notes) is treated as untrusted data and wrapped in strict JSON contracts.

---

## 9. CI/CD & Deployment Security Gates (Phase 31)
- **Zero Committed Secrets**: GitHub Actions CI validates that no service-role credentials or JWT secrets are present in tracked commits.
- **Pull Request Quality Gates**: Automated CI pipelines block merging if tests fail, builds break, or unauthorized role changes occur.
- **Environment Isolation**: Production secrets are maintained strictly inside the host PaaS secrets vault and are inaccessible from development environments.
- **Dependency Audit**: Regular vulnerability scans and lockfile auditing (`package-lock.json`) prevent supply chain attacks.

