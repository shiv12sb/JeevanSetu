# JeevanSetu Pilot Release Checklist

## 1. Scope & Objective
This checklist evaluates the release readiness of **`JEEVANSETU-RC-33` (Version `1.0.0`)** for controlled pilot deployment across rural health facilities.

---

## 2. Release Gates & Verification Matrix

| Checklist Category | Item Description | Target Standard | Evaluation | Evidence Reference |
|---|---|---|---|---|
| **1. Code & Build** | Frontend Static Build | Next.js 16.3.2 Turbopack compiles 32 static routes cleanly with 0 errors. | **PASS** | `npm run build` in `frontend/` (487ms). |
| | Backend Runtime | Node 20 LTS clean container startup with zero unhandled rejections. | **PASS** | `backend/server.js` graceful lifecycle. |
| **2. Automated Tests** | Unified Test Suites | 13 test suites execute and pass 100% in CI mode without timeouts. | **PASS** | 533 / 533 tests passing (`npm test`). |
| **3. Database** | Migration Ordering | 22 sequential migrations intact with strict additive forward-fix rule. | **PASS** | `supabase/migrations/` sequential audit. |
| | Row-Level Security | 100% RLS policy coverage across all sensitive public tables. | **PASS** | SQL migration RLS audit. |
| **4. Auth & Security** | Server-Side RBAC | Role validation enforced on all protected API routes; zero client bypass. | **PASS** | `auth.middleware.js` & security test suite. |
| | Secret Isolation | Zero service-role keys or database credentials in client bundles. | **PASS** | `frontend/.env.production.example` audit. |
| | Rate Limiting | Sliding-window rate limiting active on auth and webhook routes. | **PASS** | `rateLimit.middleware.js` verification. |
| **5. Clinical Safety** | Non-Diagnostic AI | AI outputs assistive triage guidance with disclaimers; no prescriptions. | **PASS** | `docs/ai-governance.md` & AI test suite. |
| | AI Outage Fallback | Deterministic localized fallback cards active during upstream provider outage. | **PASS** | `ai.service.js` fallback handler. |
| | 108 Emergency Bypass | Deterministic preemption immediately routes acute symptoms to 108. | **PASS** | `ivrFlow.js` emergency trigger test. |
| **6. IVR & Telephony** | 6-Option DTMF Menu | Feature-phone navigation handles input transitions and language switching. | **PASS** | `tests/phase38_field_readiness_uat.test.js`. |
| | Telephony Security | Inbound webhooks enforce HMAC signatures and $\pm 5$-min replay bounds. | **PASS** | `webhookAuth.middleware.js` verification. |
| **7. Automation** | Transactional Outbox | Outbox pattern decouples database writes from external n8n availability. | **PASS** | `event.service.js` resilience tests. |
| **8. Observability** | Health Probes | `/api/health/live` and `/api/health/ready` operational with feature degradation flags. | **PASS** | `health.controller.js` probe tests. |
| | Honest Metrics | Unconfigured cloud drains marked `NOT VERIFIED`; zero fabricated metrics. | **PASS** | `docs/monitoring.md` honesty policy. |
| **9. Backup & DR** | WAL PITR & Snapshots | Documented backup retention strategy with Target RPO $\le 1$h, Target RTO $\le 4$h. | **PASS** | `docs/backup-restore.md`. |
| **10. Operations & Support**| Support Desk Runbooks | SEV-1 to SEV-4 incident escalation matrix and troubleshooting runbooks ready. | **PASS** | `docs/pilot-support.md`. |
| | User Training Guides | Role-specific quick guides created for all 6 primary user roles. | **PASS** | `docs/pilot-support.md` Section 4. |
| **11. Rollback Readiness** | Dual-Layer Rollbacks | Instant Vercel frontend revert ($< 1$m) and container tag rollback ($< 3$m) verified. | **PASS** | `docs/release-candidate.md`. |
| **12. Documentation** | Governance & Handover | All 25+ platform runbooks and handover guides synchronized with code. | **PASS** | `docs/` suite audit. |

---

## 3. Pilot Go / No-Go Decision

- **Hard Blocker Audit**: 0 Security Breaches, 0 Clinical Safety Violations, 0 RLS/RBAC Bypasses, 0 Database Inconsistencies.
- **Final Decision**: **`GO` (Approved for Controlled Pilot Deployment)**.
