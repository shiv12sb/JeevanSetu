# JeevanSetu Codebase Guide & Ownership Map

## 1. Executive Summary & Purpose
This guide provides an engineering orientation and architectural ownership map for the **JeevanSetu Rural Healthcare Telemedicine & Closed-Loop Care Continuity Platform**. It outlines the repository structure, subsystem boundaries, data flow patterns, and safe vs. high-risk modification zones for future engineering teams.

---

## 2. Logical Role-Based Ownership Matrix

| System Domain | Primary Owner Role | Secondary Owner Role | Primary Responsibilities |
|---|---|---|---|
| **Platform Architecture** | System Owner | Backend Owner | Global design invariants, safety boundaries, release authorization. |
| **Frontend Web App** | Frontend Owner | UI/UX Owner | Next.js app router, responsive design, multilingual i18n, accessibility. |
| **Backend REST API** | Backend Owner | Security Owner | Express API routes, controllers, middleware, input validation, request tracing. |
| **Database & Migrations** | Database Owner | Backend Owner | PostgreSQL schemas, Supabase RLS policies, indexing, migration ordering. |
| **Security & Privacy** | Security Owner | System Owner | RBAC, JWT validation, rate limiting, PII sanitization, secret hygiene. |
| **AI Advisory Services** | AI/ML Safety Owner | Backend Owner | Non-diagnostic prompts, structured JSON contracts, deterministic failover. |
| **Telephony & IVR** | Telephony Owner | Backend Owner | DTMF state machine, 108 emergency preemption, callback queuing. |
| **Automation & Outbox** | Backend Owner | Operations Owner | Transactional outbox pattern, webhook HMAC auth, n8n orchestration. |
| **Operations & DR** | Operations Owner | Database Owner | Health probes, backup & restore procedures, monitoring alerts, runbooks. |
| **QA & Verification** | QA Owner | Backend Owner | Automated test suites, regression test matrix, UAT verification. |
| **Documentation** | Documentation Owner | System Owner | Architecture guides, runbooks, changelog, API documentation. |

---

## 3. High-Level Repository Structure

```
JeevanSetu/
├── backend/                  # Node.js / Express REST API Backend
│   ├── src/
│   │   ├── config/           # Environment and Supabase client configuration
│   │   ├── controllers/      # Route request/response handlers
│   │   ├── jobs/             # Scheduled background jobs (monitoring, sweeps)
│   │   ├── middleware/       # Auth, RBAC, logging, rate limiting, request ID, webhook auth
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Core business logic (AI, IVR, Referrals, Inventory, etc.)
│   │   ├── utils/            # Structured logger, sanitized response helpers
│   │   └── validators/       # Input parameter schema validators
│   ├── tests/                # Unified automated test suites (Phases 26-37)
│   ├── Dockerfile            # Multi-stage production container definition
│   ├── package.json          # Backend runtime & test dependencies
│   └── server.js             # Application entrypoint & graceful shutdown handlers
├── frontend/                 # Next.js 16.3.2 Turbopack React Web Application
│   ├── app/                  # Next.js App Router pages and route groups
│   ├── components/           # Modular UI & domain components
│   ├── context/              # Client state providers (Auth, Language, Theme)
│   ├── lib/                  # Frontend utilities, Supabase client, translations
│   ├── package.json          # Frontend dependencies
│   └── next.config.mjs       # Next.js compiler and security headers configuration
├── supabase/
│   ├── migrations/           # 22 Sequential, additive SQL migrations
│   └── seed.sql              # Development test data (strictly isolated from prod)
├── docs/                     # 25+ Comprehensive system and operational runbooks
├── n8n/                      # n8n workflow export templates
├── docker-compose.yml        # Local multi-service orchestration definition
└── CHANGELOG.md              # Historical record of platform versions & phases
```

---

## 4. Subsystem Directory Breakdown & Risk Classification

### A. Backend (`backend/src/`)

| Directory | Purpose | Key Files | Safe Modification Area | High-Risk Modification Area |
|---|---|---|---|---|
| `config/` | Environment & database initialization | [`env.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/config/env.js), [`supabase.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/config/supabase.js) | Adding optional non-breaking environment variables | Changing database connection credentials or fail-safe rules |
| `middleware/` | Request filtering, security & tracing | [`auth.middleware.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/middleware/auth.middleware.js), [`webhookAuth.middleware.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/middleware/webhookAuth.middleware.js), [`rateLimit.middleware.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/middleware/rateLimit.middleware.js) | Adjusting non-critical log metadata formatting | Modifying JWT verification, RBAC rules, or rate limit bypasses |
| `services/ai/` | Clinical advisory intelligence | [`ai.service.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/ai/ai.service.js) | Updating localized non-diagnostic prompt templates | Relaxing structured JSON schema validation or disabling deterministic fallback |
| `services/ivr/` | Feature phone DTMF voice services | [`ivrFlow.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/ivr/ivrFlow.js), [`ivrContent.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/ivr/ivrContent.js) | Adding localized informational audio prompts | Altering 108 emergency preemption or removing retry attempt caps |
| `services/referrals/` | Closed-loop care continuity | [`referrals.service.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/referrals.service.js) | Adding non-blocking notification alerts | Changing 6-stage lifecycle transitions or facility scoping |
| `services/inventory/` | Medicine stock & forecasting | [`inventory.service.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/inventory.service.js) | Adjusting warning threshold algorithms | Removing atomic balance checks (`current_quantity >= 0`) |
| `services/automation/` | Transactional outbox & webhooks | [`event.service.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/automation/event.service.js) | Adding new event type schemas | Mutating HMAC signature algorithms or disabling idempotency |
| `jobs/` | Background workers & sweeps | [`index.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/jobs/index.js), [`jobMonitor.service.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/observability/jobMonitor.service.js) | Tuning sweep intervals for low-traffic windows | Disabling job stuck detection ($> 300$s) or alert deduplication |

---

### B. Frontend (`frontend/`)

| Directory | Purpose | Key Files | Safe Modification Area | High-Risk Modification Area |
|---|---|---|---|---|
| `app/` | Page routing & layout structure | `page.js`, `layout.js` across 32 routes | Updating layout spacing, visual styling, or static copy | Adding server secrets to client components or bypassing auth |
| `components/` | Reusable UI & domain widgets | `ui/Card.js`, `shared/StatusTimeline.js` | Visual theme enhancements, badge styles | Removing role checks or mutating form submissions without validation |
| `context/` | Client-side state | `AuthContext.js`, `LanguageContext.js` | Adding theme tokens or new language strings | Using client context as authoritative security/role check |
| `lib/` | Shared utilities & API client | `api.js`, `supabase.js`, `translations.js` | Adding localized strings for Hindi/Marathi | Embedding `SUPABASE_SERVICE_ROLE_KEY` in frontend bundles |

---

### C. Database (`supabase/migrations/`)

| File Range | Domain | Key Concepts | Safety Rule |
|---|---|---|---|
| `000001` - `000003` | Core Schema, Indexes & RLS | Profiles, PHCs, Hospitals, Cases, Initial RLS | **IMMUTABLE**: Never modify existing migration files. |
| `000004` - `000010` | Early Warning, IVR, Supply Chain | Feedback, stock transactions, IVR logs | **FORWARD-FIX ONLY**: All schema updates must deploy new migrations. |
| `000011` - `000022` | Advanced Intelligence & Outbox | Doctor presence, outbox events, cluster masking | **NON-DESTRUCTIVE**: Avoid `DROP TABLE` or `DROP COLUMN` in production. |

---

## 5. Architectural Boundaries & Non-Negotiable Rules

1. **The Backend Is the Security Authority**:
   - The frontend and n8n are untrusted clients. All authorization, role verification, and input sanitation must be enforced server-side.
2. **AI Is Strictly Non-Diagnostic**:
   - AI outputs are assistive guidance. AI must never prescribe medications, provide definitive diagnoses, or override emergency triage.
3. **Emergency Preemption Is Deterministic**:
   - IVR and chat workflows must immediately route acute red-flag symptoms to 108 emergency services without waiting for asynchronous AI inference.
4. **Zero Client Secrets**:
   - `SUPABASE_SERVICE_ROLE_KEY`, database passwords, and webhook secrets must never be exposed to the frontend bundle or client environment.
5. **Decoupled Asynchronous Resilience**:
   - Core backend database transactions must succeed independently when optional external services (n8n, SMS gateway, external weather API) are offline.
6. **Data Minimization & Small-Sample Suppression**:
   - Logs must mask phone numbers (`+91 98XXX XX04`) and strip secrets (`[REDACTED]`). Public health surveillance queries must suppress geographic clusters with fewer than 3 observed cases.
