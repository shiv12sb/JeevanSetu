# JeevanSetu Technical Debt Register

## 1. Overview
This register tracks authentic technical debt items identified across the platform codebase. Each entry represents a conscious architectural trade-off or area where future optimization will improve performance, maintainability, or developer ergonomics without altering production stability.

---

## 2. Technical Debt Items

| Debt ID | System Area | Description & Current State | Technical Impact | Severity | Suggested Resolution | Priority |
|---|---|---|---|---|---|---|
| **TD-01** | Backend Stores | In-memory fallback stores exist alongside Supabase queries in several service modules (`mockInventoryStore`, `mockReferralsStore`) to enable zero-dependency offline local development. | Minor memory footprint overhead during test executions. | Low | Consolidate mock stores into dedicated standalone fixture factories under `backend/tests/fixtures/`. | **P2** |
| **TD-02** | Frontend State | Local storage / React Context is used for active tab and client filter state across dashboard views. | Client state resets on hard refresh; no server-side sync for ephemeral preferences. | Low | Introduce URL query parameter synchronization (`useSearchParams`) for shareable deep links. | **P2** |
| **TD-03** | Database Indexes | Indexes cover primary keys, foreign keys, and status fields; compound indexes for multi-column time-series analytics (e.g. `(phc_id, created_at, status)`) are partially defined. | Analytical queries over 100k+ historical records may require sequential scans if unindexed. | Medium | Add composite B-tree indexes in future migration `20260822000023_analytics_composite_indexes.sql`. | **P1** |
| **TD-04** | Telephony Adapter | IVR DTMF state machine is implemented via unified service flow; production carrier adapter (Twilio/Exotel) is isolated via abstraction interface. | Live carrier switching requires configuring vendor API secrets in environment. | Low | Add multi-carrier automatic failover routing in telephony provider factory. | **P2** |
| **TD-05** | Outbox Worker Polling | Background outbox sweep polls database every 30 seconds for `PENDING` events. | Minor database query load during idle hours. | Low | Upgrade to PostgreSQL `LISTEN/NOTIFY` or Supabase Realtime trigger for instant event dispatch. | **P2** |

---

## 3. Debt Management Policy
- Technical debt items must never be refactored during emergency incident resolution or release candidate freezes.
- High-priority (P1) debt items should be scheduled during dedicated maintenance cycles following minor releases.
