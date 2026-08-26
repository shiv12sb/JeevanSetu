# JeevanSetu Scalability Architecture & Query Optimization Guide

## 1. Architectural Scalability Overview
JeevanSetu is architected to scale horizontally across rural blocks, Primary Health Centres (PHCs), sub-district hospitals, and entire district healthcare administrative networks without architectural bottlenecks.

---

## 2. Database Scaling & Query Optimization

### Query Patterns & Indexing Strategy:
- **Primary & Foreign Key Indexes**: All relational foreign keys (`patient_id`, `originating_phc_id`, `destination_hospital_id`, `case_id`, `medicine_id`) are indexed with B-tree indexes.
- **Compound Analytical Indexes**:
  - `(originating_phc_id, created_at, status)` on `referrals` optimizes facility-scoped dashboard lists.
  - `(phc_id, medicine_id)` on `medicine_inventory` guarantees fast point lookups during OPD dispensation.
  - `(phc_id, recorded_at)` on `medicine_usage_logs` enables rapid monthly burn rate calculations.
  - `(district, recorded_date)` on `early_warning_signals` accelerates district-wide surveillance queries.
- **Future Analytical Optimization**: Migration `20260822000023_analytics_composite_indexes.sql` scheduled for heavy multi-district historical aggregation.

### Concurrency & Lock Minimization:
- Atomic stock decrements execute via single-row conditional updates (`UPDATE medicine_inventory SET current_quantity = current_quantity - $qty WHERE id = $id AND current_quantity >= $qty`) rather than long-running table locks.

---

## 3. API Scalability & Connection Management

- **Connection Pooling**: PostgreSQL connection pool managed via Supabase PgBouncer / direct pooler with 20 concurrent connections per API instance.
- **Pagination**: All list endpoints (`/api/cases`, `/api/referrals`, `/api/inventory`, `/api/feedback`) enforce mandatory pagination defaults (`limit=50`, `offset=0`) to eliminate large in-memory payload spikes.
- **Payload Bounds**: Express body parsers enforce a strict 10kb limit to eliminate request body memory exhaustion DoS vectors.
- **Sliding-Window Rate Limiting**: In-memory and Redis-compatible sliding window limiters throttle abusive traffic (30 requests/15m for auth, 100 requests/15m for API).

---

## 4. Multi-Facility & Multi-District Isolation

- **Tenant Scoping**: All database queries enforce tenant isolation via Row-Level Security (RLS) and server-side RBAC:
  - PHC Staff can only view/mutate cases and inventory belonging to their `assigned_phc_id`.
  - Hospital Staff can only view/accept referrals directed to their `assigned_hospital_id`.
  - NGO Staff can only manage transport logs assigned to their `assigned_ngo_id`.
  - District Admins maintain scoped read/write access limited to facilities within their assigned district.
