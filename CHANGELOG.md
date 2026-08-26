# JeevanSetu Platform Changelog

All notable changes and phase milestones for the **JeevanSetu Rural Healthcare Telemedicine & Closed-Loop Care Continuity Platform** are documented in this file.

The project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-26 (Production Release Candidate & Governance Handover)

### Phase 37: Long-Term Maintenance, Governance & Engineering Handover
- Established comprehensive codebase ownership guide ([`docs/codebase-guide.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/codebase-guide.md)) and logical ownership matrices.
- Codified change management workflows and forward-fix database policies in [`docs/change-management.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/change-management.md).
- Documented AI clinical safety guidelines and prompt injection defense in [`docs/ai-governance.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/ai-governance.md).
- Formulated regular security hygiene and secret rotation protocols in [`docs/security-maintenance.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/security-maintenance.md).
- Established subsystem testing strategy and regression requirements in [`docs/testing-strategy.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/testing-strategy.md).
- Created developer onboarding guide ([`docs/developer-onboarding.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/developer-onboarding.md)) and contribution guidelines ([`CONTRIBUTING.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/CONTRIBUTING.md)).
- Documented technical debt register ([`docs/technical-debt.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/technical-debt.md)) and known limitations ([`docs/known-limitations.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/known-limitations.md)).

### Phase 36: Production Observation, Hardening & Stability
- Evaluated real and synthetic production telemetry across health probes (`/api/health/live`, `/api/health/ready`).
- Documented honest observability policy marking unconfigured cloud drains as `NOT VERIFIED`.
- Conducted 50-point Read-Only Stability Audit (100% Pass / Non-blocking).
- Cumulative test harness reached 499 / 499 tests across 11 test suites.

### Phase 35: Final Production Launch Rehearsal & Go/No-Go
- Rehearsed all 6 primary user journeys (Flows A through F) with non-identifiable synthetic accounts.
- Validated clinical safety non-diagnostic AI boundaries and deterministic IVR 108 emergency preemption.
- Rehearsed 10-step deployment order and dual-layer rollback runbooks.
- Authorized official `GO` launch decision.

### Phase 34: Production Operations, Backup, Monitoring & Go/No-Go Readiness
- Documented operational runbook suite (Deployment, Backup/Restore, Monitoring, Incident Response, Support, PHC, Admin).
- Established continuous WAL PITR and daily snapshot strategy with Target RPO $\le 1$h, Target RTO $\le 4$h.
- Defined 12 disaster scenario runbooks (Scenarios A through L).

### Phase 33: Release Candidate Hardening & Final Regression
- Formally locked `JEEVANSETU-RC-33` (Version 1.0.0).
- Declared strict codebase change freeze; zero unresolved P0/P1 blockers.

### Phase 32: End-to-End QA, Integration & User Acceptance Testing
- Executed 5 master UAT workflows covering complete patient journey, medicine stockout alert, IVR callback, early warning, and AI fallback.
- Created Master QA Matrix ([`docs/test-matrix.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/test-matrix.md)) covering 32 QA domains.

### Phase 31: Release Engineering, Containerization & CI/CD
- Created multi-stage Dockerfile and docker-compose orchestration.
- Configured GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`).
- Audited 22 sequential database migrations with strict additive forward-fix rules.

### Phase 30: Security Hardening & Zero-Trust Verification
- Enforced 100% PostgreSQL Row-Level Security (RLS) and server-side RBAC across all 6 roles.
- Configured Helmet security headers, 10kb body parsers, sliding-window rate limiters, and HMAC webhook authentication.
- Implemented automated phone number masking (`+91 98XXX XX04`) and anonymous UUID tracking tokens (`JS-FB-XXXX-XXXX`).

### Phase 29: Observability, Metrics & Health Probes
- Implemented structured JSON request tracing (`x-request-id`), standardized error taxonomy, and `/api/health` probes.
- Added background job monitor with stuck job detection ($> 300$s) and alert deduplication.

### Phase 28: Automation & n8n Decoupled Orchestration
- Implemented Transactional Outbox Pattern (`outbox_events`) with HMAC signatures and exponential retry backoff.
- Decoupled core backend database writes from external automation availability.

### Phases 1-27: Core Platform Development
- Built multi-role dashboards (Patient, PHC Staff, Doctor, Hospital Staff, NGO Staff, District Admin).
- Implemented 6-stage closed-loop referral lifecycle and doctor presence tracking.
- Developed atomic medicine inventory with depletion forecasting.
- Implemented feature-phone IVR telephony state machine with 108 emergency preemption.
- Built multi-signal public health early warning surveillance with small-sample privacy masking ($< 3$ cases).
- Implemented bilingual Hindi/Marathi localization and high-contrast responsive UI design system.
