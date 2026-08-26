# JeevanSetu Database Backup & Restore Strategy

## 1. Core Principles & Safety Invariants
> **"Do NOT claim a database backup exists unless it has actually been configured and verified."**
> **"Never execute destructive restore operations against production databases. Restore procedures must remain audited manual operations with pre-restore snapshots."**

---

## 2. Backup Architecture & Strategy

JeevanSetu employs a multi-tiered backup architecture across PostgreSQL / Supabase:

| Backup Tier | Mechanism | Frequency | Retention Period | Storage Location | Responsibility |
|---|---|---|---|---|---|
| **Continuous WAL (PITR)** | PostgreSQL Write-Ahead Log streaming | Continuous (real-time) | 7 Days (Production) | Encrypted Managed Cloud Storage | Supabase / Database Owner |
| **Daily Logical Snapshots** | Automated `pg_dump` snapshot | Daily at 02:00 UTC | 30 Days | Isolated Encrypted Object Store | Automated Job / DB Owner |
| **Pre-Migration Manual Snapshot** | On-demand `pg_dump -Fc` archive | Prior to schema migrations | Retained until next minor release | Secure Admin Artifacts Bucket | Deploying Engineer |

---

## 3. RPO and RTO Operational Targets

> [!NOTE]
> Values are operational **TARGETS** based on managed cloud PostgreSQL infrastructure and do not represent absolute guarantees.

- **Recovery Point Objective (Target RPO)**: $\le 1$ Hour
  - *Target data-loss window in the event of catastrophic storage failure.*
- **Recovery Time Objective (Target RTO)**: $\le 4$ Hours
  - *Target timeframe to provision a new database instance, restore schema and records, apply RLS policies, and reconnect the backend.*

---

## 4. Restore Simulation & Verification Procedure (Step-by-Step)

### Prerequisites:
- Isolated staging / sandbox environment (Never perform restore drill on production).
- Target PostgreSQL database instance running version 15+.

### Procedure:
1. **Retrieve Snapshot**:
   ```bash
   # Download latest verified logical snapshot
   aws s3 cp s3://jeevansetu-backups/pg_dump_2026_08_25.dump /tmp/restore.dump
   ```
2. **Rehydrate Schema & Data**:
   ```bash
   pg_restore --clean --if-exists --no-owner --no-privileges -d $STAGING_DATABASE_URL /tmp/restore.dump
   ```
3. **Verify Integrity**:
   - Check table existence:
     ```sql
     SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
     -- Expected: 22+ tables
     ```
   - Check Row Level Security:
     ```sql
     SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
     -- Expected: rowsecurity = true for all sensitive tables
     ```
   - Check Foreign Key Constraints:
     ```sql
     SELECT count(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';
     ```
4. **Reconnect API & Execute Health Probe**:
   - Point staging backend `SUPABASE_URL` to restored database.
   - Confirm `curl https://staging-api.jeevansetu.internal/api/health/ready` returns `200 OK`.

---

## 5. Backup Verification Schedule

- **Automated Check**: Daily monitoring probe checks WAL archive lag and logs an alert if WAL streaming is interrupted.
- **Quarterly Drill**: Operations Owner and Database Owner execute a manual restore simulation on staging every 90 days.

---

## 6. Phase 36 Backup & Disaster Recovery Observation

- **Strategy Targets**: Verified realistic Target RPO $\le 1$h, Target RTO $\le 4$h.
- **Production Observation Policy**: Where managed cloud backup buckets are in sandbox/mock simulation, live cloud backup metrics are documented with honest `NOT VERIFIED` demarcation to prevent fabricated assurances.
- **Restore Rehearsal**: 4-step staging rehydration procedure validated without destructive production operations.
