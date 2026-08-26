# JeevanSetu Capacity Planning & Cost Governance

## 1. Scope & Objective
This guide outlines compute, storage, network bandwidth, and external dependency resource projections across different deployment scales: Initial Pilot (5 PHCs), Block Scale (20 PHCs), and Full District Scale (100+ PHCs).

---

## 2. Resource Sizing & Capacity Projections

| Resource / Subsystem | Pilot Tier (5 PHCs, 1 Hospital) | Block Tier (20 PHCs, 3 Hospitals) | District Tier (100 PHCs, 10 Hospitals) | Sizing Bottleneck / Action |
|---|---|---|---|---|
| **API Server Compute** | 1 Container (0.5 vCPU, 512MB RAM) | 2 Containers (1 vCPU, 1GB RAM) | 4 Containers (2 vCPU, 2GB RAM) + Auto-scale | CPU bound during OPD morning rush (09:00-11:00). |
| **Frontend CDN Bandwidth** | $< 5$ GB / Month (Static cache) | $< 25$ GB / Month | $< 150$ GB / Month | Next.js static prerendering keeps egress minimal. |
| **Database Storage** | $\approx 200$ MB / Month | $\approx 1$ GB / Month | $\approx 5$ GB / Month | Vacuum & WAL archiving; PITR retention for 7 days. |
| **Database Connections** | 10–20 Concurrent Connections | 30–50 Concurrent Connections | 100–150 Concurrent Connections | Supabase / PgBouncer connection pooling required. |
| **Outbox Events Volume** | $\approx 500$ events / Day | $\approx 3,000$ events / Day | $\approx 20,000$ events / Day | Purge completed outbox records $> 90$ days. |
| **IVR Voice Telephony** | 50–100 Calls / Day | 300–500 Calls / Day | 2,000–5,000 Calls / Day | Carrier SIP trunk concurrent line capacity. |
| **AI Advisory Queries** | 100–200 Queries / Day | 500–1,000 Queries / Day | 3,000–8,000 Queries / Day | LLM API token rate limits & deterministic caching. |

---

## 3. Cost Drivers & Uncontrolled Spend Controls

1. **AI API Usage Guards**:
   - Rate limit per IP/user: Maximum 10 queries per 15 minutes.
   - Enforce 500-token prompt and response limits to prevent uncontrolled LLM token consumption.
2. **SMS Gateway Spend Guards**:
   - In-app notification preferred; SMS reserved for high-priority referral transfers and low-stock alerts.
   - Cap daily SMS volume at 50 SMS / PHC / day during pilot phase.
3. **Database Storage Controls**:
   - Compress and archive historical cases and vitals records older than 3 years to secondary cold storage.
