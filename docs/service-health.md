# JeevanSetu Service Health & Dependency Degradation Taxonomy

## 1. Service Dependency Catalog

| Dependency / Subsystem | Criticality Tier | Failure Impact on Platform | Graceful Degradation Behavior |
|---|---|---|---|
| **Node.js Express Runtime** | **Critical** | Total API downtime | Container orchestrator auto-restarts failed instance. |
| **PostgreSQL / Supabase DB** | **Critical** | Database write/read failure | Readiness probe returns HTTP 503; requests paused. |
| **Supabase Auth / JWT** | **Critical** | User login failure | In-flight active sessions continue until token expiry. |
| **Cloud LLM AI Provider** | **Degraded** | AI triage unavailable | Deterministic safe localized guidance cards returned. |
| **PSTN Telephony Carrier** | **Degraded** | Inbound phone calls dropped | Users guided to Web/PWA or direct 108 emergency dial. |
| **SMS Gateway Provider** | **Degraded** | SMS notifications delayed | In-app feed delivers normally; SMS queued in outbox. |
| **n8n Automation Engine** | **Optional** | Asynchronous automations delayed | Core database writes succeed; outbox replays on reconnect. |

---

## 2. Low-Bandwidth & Network Fault Discrimination

- **Client-Side vs. Backend Downtime**: The PWA client distinguishes local cellular dropouts from backend API outages. Local network timeouts display an offline banner without generating false backend SRE incidents.
