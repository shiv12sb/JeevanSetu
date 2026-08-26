# JeevanSetu n8n Automation & Integration Workflows

## Core Principle & Orchestration Invariant
> **"JeevanSetu backend remains the source of truth. n8n is an orchestration layer, not the application's security, database, or business-logic authority."**

n8n is an **OPTIONAL** orchestration layer. It does NOT decide:
- User authorization
- Row Level Security (RLS)
- Clinical diagnosis or emergency classification
- Referral ownership
- Medicine stock quantity truth
- Outbreak verification
- Disciplinary action

If n8n is disabled or unavailable (`N8N_ENABLED=false`), the JeevanSetu core application continues functioning completely via the backend internal Outbox processor and direct provider adapters.

---

## Documented Workflow Sitemap

1. **`01_notification_dispatch.json`**:
   - Ingests `NOTIFICATION_REQUESTED` events from outbox.
   - Routes to appropriate channel adapter (SMS / Email / In-App / WhatsApp).
   - Validates user notification preferences before dispatch.

2. **`02_referral_followup.json`**:
   - Automates non-punitive referral timeline checks and follow-up reminders.
   - Dispatches patient reminders and facility notifications for unacknowledged referrals without ever auto-confirming patient arrival.

3. **`03_medicine_alert.json`**:
   - Ingests `MEDICINE_LOW_STOCK` and `MEDICINE_DEPLETION_WARNING` events.
   - Dispatches threshold alerts to authorized PHC and district supply officers.
   - Never directly mutates database inventory balances.

4. **`04_feedback_review.json`**:
   - Ingests `FEEDBACK_SUBMITTED` events.
   - Triggers asynchronous AI categorization and translates citizen text without blocking web/IVR submissions.

5. **`05_early_warning_alert.json`**:
   - Ingests `EARLY_WARNING_CREATED` and `EARLY_WARNING_VERIFIED` events.
   - Dispatches operational alerts strictly to authorized health administrators.
   - Never publishes autonomous outbreak warnings to the public.

6. **`06_callback_reminder.json`**:
   - Ingests `CALLBACK_REQUESTED` from IVR feature-phone sessions.
   - Alerts assigned ASHA / PHC staff of pending citizen callbacks.

7. **`07_provider_retry.json`**:
   - Handles external gateway failure webhooks and triggers exponential backoff retries via the backend outbox API.

8. **`08_daily_operations_summary.json`**:
   - Scheduled daily aggregation report compiling outbox throughput, referral milestones, and medicine replenishment needs for district administrative review.

---

## Webhook Security & Signatures
All inbound and outbound automation webhooks must include:
- `x-webhook-signature`: HMAC SHA-256 signature calculated with `N8N_WEBHOOK_SECRET`.
- `x-webhook-timestamp`: Request timestamp (requests with clock drift $> 5$ minutes are rejected).
- `x-event-id`: Unique UUID for replay protection and idempotency caching.
