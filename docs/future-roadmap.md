# JeevanSetu Future Engineering Roadmap

## 1. Vision & Architecture Alignment
This roadmap outlines prioritized post-launch enhancements for future engineering iterations. All proposed items align with JeevanSetu's core architectural tenets: zero secret exposure, non-diagnostic AI safety, server-side RBAC, and rural low-bandwidth accessibility.

---

## 2. Prioritized Roadmap Items

### Priority 0 (P0) — Production Infrastructure & Scale
- **P0-1: Live SMS & Telephony Production Integration**: Bind verified carrier API credentials (Fast2SMS, Exotel) with automated webhook signature validation in live production environments.
- **P0-2: PostgreSQL Analytical Compound Indexes**: Deploy migration `20260822000023_analytics_composite_indexes.sql` to optimize multi-month epidemiological queries over 100,000+ records.
- **P0-3: Multi-Region Read Replicas**: Configure read replicas for heavy administrative surveillance dashboard traffic during district-wide health review meetings.

### Priority 1 (P1) — Clinical Workflow & Surveillance Enhancements
- **P1-1: Additional Regional Dialects**: Expand translation catalogue to include Gondi and Kolami dialects for tribal blocks in Gadchiroli.
- **P1-2: Offline PWA Sync**: Implement Service Worker background sync for PHC staff tablet devices during prolonged rural broadband blackouts.
- **P1-3: Advanced Stockout Neural Forecasting**: Integrate multi-season ARIMA / linear trend models for seasonal monsoon disease medicine demand surges.

### Priority 2 (P2) — Interoperability & Governance
- **P2-1: ABDM / ABHA M2/M3 Sandbox Milestone**: Connect FHIR R4 clinical artifact export to national Ayushman Bharat Digital Mission (ABDM) health repository.
- **P2-2: Push Notifications / WebPush**: Integrate WebPush standard for desktop/mobile browser alerts alongside SMS and in-app feeds.
- **P2-3: Automated Staging Restore Drill Pipeline**: Scheduled quarterly GitHub Actions job executing synthetic schema rehydration against ephemeral Postgres containers.

### Nice-to-Have (P3)
- **P3-1: Interactive Heatmap Visualization**: Vector-based geospatial map layers for district epidemiological clustering.
- **P3-2: Voice-to-Text Clinical Note Dictation**: On-device Web Speech API for doctor clinical consultation notes.

---

## 3. Roadmap Execution Constraints
- Roadmap items MUST NOT be implemented during stability phases or without formal design review.
- Any future integration must maintain the decoupled Transactional Outbox pattern and fail gracefully if external services are unavailable.
