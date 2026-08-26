# JeevanSetu Platform Reliability & Resilience Architecture

## 1. Resilience Design Principles
The platform guarantees continuous clinical safety and operational availability through defensive architectural boundaries, asynchronous decoupling, idempotent processing, and deterministic failover engines.

---

## 2. Background Job Reliability & Stuck Job Detection

All background workers and maintenance sweeps are wrapped by [`jobMonitor.service.js`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/backend/src/services/observability/jobMonitor.service.js):
- **Execution History**: Circular buffer maintains recent job run timestamps, durations, and exit statuses.
- **Stuck Job Detector**: Sweeps identify any background job running $> 300,000$ms ($> 5$ minutes) and emit actionable warnings without crashing the process.
- **Deduplication Guard**: Alert deduplicator suppresses duplicate alarms within a 60-minute window to avoid on-call alarm fatigue.

---

## 3. Idempotent Transactional Outbox Pattern

To eliminate duplicate dispatches and handle network flakiness:
1. Core business transactions insert events into `outbox_events` table within the same atomic database commit.
2. Events carry an immutable `idempotency_key` (UUID v4 or deterministic hash).
3. Background dispatcher polls `PENDING` events, computes HMAC SHA-256 signatures, and transmits to external receivers.
4. On external receiver timeout, the dispatcher increments `retry_count` using exponential backoff ($2^n \times 1000$ms) capped at 5 attempts before marking `FAILED_MAX_RETRIES`.

---

## 4. Deterministic AI Provider Outage Engine

When upstream cloud LLM providers experience outages, rate limits, or network timeouts ($> 5000$ms):
- The `ai.service.js` fallback engine intercepts the error before it bubbles to the user.
- Localized, safe, deterministic guidance cards are returned immediately.
- Emergency red flags (chest pain, severe breathlessness) are evaluated client-side and server-side to immediately return 108 ambulance advice without waiting for AI recovery.

---

## 5. Graceful Process Lifecycle & SIGTERM Handling

The Express server (`server.js`) traps `SIGTERM` and `SIGINT` signals:
1. Stops accepting new inbound HTTP connections.
2. Allows in-flight HTTP requests and database transactions to finish cleanly ($< 10$s grace period).
3. Closes database connection pools and terminates background workers cleanly.
