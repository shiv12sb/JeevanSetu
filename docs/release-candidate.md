# JeevanSetu Release Candidate Manifest

## 1. Release Identification
- **Release Identifier**: `JEEVANSETU-RC-33`
- **Application Version**: `1.0.0`
- **Target Deployment Tier**: Controlled Pilot Deployment (Limited PHC Pilot)
- **Target Release Date**: August 26, 2026
- **Runtime Stack**: Node.js 20 LTS, Next.js 16.3.2 Turbopack, Express 4.21, PostgreSQL 15+ / Supabase RLS

---

## 2. Major Included Subsystems & Capabilities

| Subsystem | Included Capabilities | Status |
|---|---|---|
| **Multi-Role Portals** | Dedicated dashboards for Patient, PHC Staff, Doctor, Hospital Staff, NGO Staff, and District Admin. | **Verified** |
| **Authentication & RBAC** | JWT authentication, server-side role validation, sliding-window rate limiting, and session invalidation. | **Verified** |
| **Row-Level Security** | 100% RLS policy coverage across all sensitive PostgreSQL tables. | **Verified** |
| **Closed-Loop Referrals** | 6-stage care continuity lifecycle with facility scoping, transport linkage, and hospital arrival confirmation. | **Verified** |
| **Medicine Supply Chain** | Atomic usage recording (`current_quantity >= 0`), restock ledgers, and depletion forecasting. | **Verified** |
| **AI Assistive Guidance** | Non-diagnostic triage assistance with prompt injection containment and deterministic offline fallback. | **Verified** |
| **IVR Telephony** | 6-option DTMF state machine, language switching (Hindi, Marathi, English), and immediate 108 emergency bypass. | **Verified** |
| **Early Warning Surveillance** | Multi-signal statistical anomaly scoring with small-sample privacy suppression ($< 3$ cases). | **Verified** |
| **Citizen Feedback** | Authenticated and anonymous feedback submissions with isolated tracking tokens (`JS-FB-XXXX-XXXX`). | **Verified** |
| **Automation Outbox** | Transactional outbox pattern with HMAC SHA-256 signatures and decoupled backend resilience. | **Verified** |

---

## 3. Environment Configuration & Secrets Hygiene

### Backend Environment Variables (`backend/.env`):
- `PORT` (Default: `5000`)
- `NODE_ENV` (`production` / `development`)
- `SUPABASE_URL` (Required: Supabase project endpoint)
- `SUPABASE_SERVICE_ROLE_KEY` (Secret: Backend only, NEVER exposed to client)
- `JWT_SECRET` (Secret: JWT token signature key)
- `N8N_WEBHOOK_SECRET` (Secret: HMAC webhook signature key)

### Frontend Environment Variables (`frontend/.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL` (Public endpoint)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Public anonymous key)
- `NEXT_PUBLIC_API_URL` (Backend API root URL)

> [!CAUTION]
> **Zero Client Secrets Invariant**: `SUPABASE_SERVICE_ROLE_KEY` and database passwords must NEVER be embedded in client-side environment files or browser bundles.

---

## 4. Known Boundaries & Limitations
1. **PSTN Telephony Gateway**: IVR operates via standard webhook simulator in local/staging tiers. Live cellular PSTN calling requires active telecom carrier gateway credentials.
2. **Carrier SMS Gateway**: Outbox queues SMS events with exponential retry; live delivery requires paid carrier SMS credits.
3. **External Pharmacy / Weather Feeds**: Ingestion schemas implemented; report honest `NOT_AVAILABLE` status when vendor keys are unset.

---

## 5. Rollback Procedures
- **Frontend Rollback**: Instant atomic revert to previous immutable Vercel/CDN deployment ($< 1$m RTO).
- **Backend Rollback**: Revert PaaS container image tag to previous immutable container digest ($< 3$m RTO).
- **Database Schema**: Additive forward-fix migration policy (strictly zero destructive rollbacks on live databases).
