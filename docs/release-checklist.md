# JeevanSetu Production Release & Deployment Checklist

## 1. Pre-Release Quality Gates (Must be 100% Verified)

| Gate | Verification Check | Status | Assigned Role |
|---|---|---|---|
| **CI Passing** | GitHub Actions CI pipeline passes 100% on target release branch | [ ] | Release Engineer |
| **Test Suites** | All automated tests (Phase 26–31) pass with 0 failures (`npm test`) | [ ] | QA / Backend Lead |
| **Next.js Build** | Frontend production build compiles with 0 errors (`npm run build`) | [ ] | Frontend Lead |
| **Security Audit** | Zero committed production secrets or private keys in repository | [ ] | Security Officer |
| **Migration Review** | Database migrations (`supabase/migrations/`) are additive and backwards-compatible | [ ] | Database Admin |
| **Env Validation** | Environment variables in hosting platform match `.env.production.example` | [ ] | DevOps Engineer |
| **Backup Readiness** | Verified automated daily snapshot / WAL Point-In-Time recovery is active | [ ] | Database Admin |
| **Rollback Plan** | Previous known-good commit SHA and deployment artifacts identified | [ ] | Release Lead |

---

## 2. Release Execution Steps (Follow Strict Sequence)

1. **Step 1 — Maintenance Notice (If Applicable)**:
   - Notify district administrators and operational staff of deployment window.
2. **Step 2 — Pre-Migration Snapshot**:
   - Trigger manual Supabase database backup snapshot.
3. **Step 3 — Apply Database Migrations**:
   - Execute migrations in chronological order:
     ```bash
     supabase db push --linked
     ```
   - Verify all table schemas, RLS policies, and triggers are active.
4. **Step 4 — Deploy Backend API**:
   - Trigger deployment on Render / Fly.io / Railway using release tag.
   - Monitor startup logs for:
     ```text
     Environment validated successfully: Mode = PRODUCTION
     JeevanSetu Backend API Server Started (Port 5000)
     ```
5. **Step 5 — Probe Backend Health**:
   - Query Liveness: `curl -f https://api.jeevansetu.gov.in/api/health/live`
   - Query Readiness: `curl -f https://api.jeevansetu.gov.in/api/health/ready`
   - Ensure `ready_to_serve: true`.
6. **Step 6 — Deploy Frontend**:
   - Deploy Next.js production build to Vercel / Netlify.
   - Verify edge CDN cache invalidation.

---

## 3. Post-Release Verification & Smoke Tests

| Subsystem | Verification Action | Expected Outcome | Status |
|---|---|---|---|
| **Frontend Load** | Navigate to `https://jeevansetu.gov.in` | Home page renders with correct branding, no JS console errors | [ ] |
| **Authentication** | Login as Patient, PHC Staff, and District Admin | Valid session tokens issued, correct role dashboard displayed | [ ] |
| **Health Cases** | Retrieve active patient case | Case details, urgency, category load with correct facility scope | [ ] |
| **Referrals** | Review active referral timeline | 6-stage lifecycle timeline renders; event timestamps accurate | [ ] |
| **Inventory** | View PHC medicine stock | Stock quantities display; risk badges (`HEALTHY`, `LOW`) render | [ ] |
| **Citizen Feedback**| Submit synthetic test feedback at `/feedback` | Generated Tracking Token displayed (`JS-FB-XXXX-XXXX`) | [ ] |
| **Outbox & n8n** | Check `/admin/automation` | Outbox throughput normal; provider status cards green/honest | [ ] |
| **Early Warning** | Check `/admin/early-warning` | Surveillance KPI tiles render; non-diagnostic banners active | [ ] |
| **Operations Desk**| Check `/admin/operations` | Liveness/readiness probes green; background jobs executing | [ ] |
| **Logs & Tracing** | Inspect structured log stream | `request_id` propagated; phone numbers masked (`+91 98XXX XX04`) | [ ] |

---

## 4. Release Sign-Off

- **Release Version**: `v1.0.0`
- **Deployment Timestamp**: `YYYY-MM-DD HH:mm:ss UTC`
- **Release Engineer**: `__________________________`
- **District Health Lead**: `__________________________`
