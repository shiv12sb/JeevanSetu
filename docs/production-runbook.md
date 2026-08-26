# JeevanSetu Production Deployment & Operations Runbook

## 1. Scope & Execution Principles
> **"Do NOT execute automated deployment or destructive commands against production without human review and approval."**
> **"Zero downtime cannot be claimed unless verified across active multi-region load balancers."**

This runbook specifies the step-by-step procedures for deploying, verifying, maintaining, and rolling back the JeevanSetu healthcare platform across staging and production environments.

---

## 2. Pre-Deployment Quality Gates (Checklist)

Before initiating any deployment:
1. [ ] **Version Tagging**: Confirm target release candidate tag (e.g. `JEEVANSETU-RC-33`, Release Version `1.0.0`).
2. [ ] **Automated Test Pass**: Confirm all 9 test suites pass 100% (`node backend/tests/run_all.js` $\rightarrow$ 445/445 tests).
3. [ ] **Production Build**: Confirm Next.js production build completes cleanly (`npm --prefix frontend run build` $\rightarrow$ 32/32 static routes).
4. [ ] **Secret Scan**: Verify no service-role keys, passwords, or tokens exist in frontend code or git repository.
5. [ ] **Migration Review**: Verify all migrations in `supabase/migrations/` are chronologically ordered (1..22) and strictly additive.
6. [ ] **Backup Verification**: Verify that the latest automated database snapshot is available in Supabase dashboard.
7. [ ] **Go/No-Go Approval**: Confirm signed Go/No-Go authorization from System Owner, Security Owner, and Operations Owner.

---

## 3. Step-by-Step Deployment Procedure

### Stage 1: Database Migration
```bash
# Verify migrations against staging database first
supabase db push --dry-run
# Apply additive migrations
supabase db push
```
*Verification*: Check `supabase_migrations` table to confirm latest migration version applied.

### Stage 2: Backend API Deployment (Render / Fly.io / PaaS)
1. Inject environment variables via host PaaS secrets vault (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, `PORT=5000`).
2. Deploy Docker image:
   ```bash
   docker build -t jeevansetu-backend:1.0.0 -f backend/Dockerfile .
   ```
3. Monitor startup logs for initialization banner and zero secret leaks.
4. Verify liveness and readiness:
   ```bash
   curl -i https://api.jeevansetu.internal/api/health/live
   curl -i https://api.jeevansetu.internal/api/health/ready
   ```

### Stage 3: Frontend Deployment (Vercel / Netlify)
1. Configure build command: `npm run build`.
2. Configure client environment variable: `NEXT_PUBLIC_API_URL=https://api.jeevansetu.internal`.
3. Deploy static bundle and verify edge CDN propagation.

---

## 4. Post-Deployment Verification & Smoke Testing

Execute smoke test sequence within 15 minutes of deployment:
1. **Health Check Verification**: Confirm `/api/health` returns `status: "healthy"` and version `1.0.0`.
2. **Authentication Flow**: Login with synthetic test account (`PATIENT_A`) $\rightarrow$ verify session persistence.
3. **Core Referral Lifecycle**: View referral queue and confirm 6-stage timeline loads cleanly.
4. **Inventory Stock Status**: Load PHC inventory dashboard and verify threshold indicators.
5. **Telephony Webhook Test**: Dispatch mock DTMF probe to `/api/ivr/webhook` $\rightarrow$ verify response code 200.
6. **Observability Verification**: Verify request logs appear in monitoring dashboard with `request_id` and zero unredacted PII.

---

## 5. Rollback Procedures

### Frontend Rollback
- **Mechanism**: Instant atomic rollback via Vercel / Netlify dashboard to previous deployment deployment ID.
- **Estimated RTO**: $< 2$ minutes.

### Backend API Rollback
- **Mechanism**: Re-deploy previous container image tag (e.g. `jeevansetu-backend:0.9.9`).
- **Estimated RTO**: $< 5$ minutes.

### Database Forward-Fix Policy
- **Policy**: In accordance with project invariants (*"Forward-Fix Principle"*), live database schemas must NOT be rolled back with destructive `DROP TABLE` or `DROP COLUMN` commands.
- **Procedure**: Deploy a forward-fix migration script that restores compatibility or adds compensating columns.

---

## 6. Emergency Contacts & Operational Roles

| Role | Operational Responsibility | Primary Escalation Scope |
|---|---|---|
| **System Owner** | Overall platform governance & release sign-off | Release Go/No-Go decisions |
| **Backend Owner** | Express API, background jobs, transactional outbox | API errors, latency, job crashes |
| **Database Owner** | PostgreSQL, Supabase RLS, connection pool | DB latency, migration issues, PITR |
| **Security Owner** | Auth, rate limiting, secret rotation, threat response | Credential leaks, auth spikes, abuse |
| **Operations Owner** | Infrastructure, DNS, CDN, monitoring & alerting | Outages, deployment failures, downtime |

---

## 7. Phase 36 Post-Launch Operational Status

- **Status**: Production observation and stability hardening verified.
- **Rollback Readiness**: Dual-layer rollback pathways (frontend atomic re-point, backend image revert, DB forward-fix) verified and operational.
- **Active Stability Defect Count**: 0 P0 / 0 P1 / 0 P2 / 0 P3 defects.
