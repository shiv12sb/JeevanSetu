const { supabase, isConfigured } = require("../../config/supabase");
const { smsProvider, emailProvider, telephonyProvider, n8nAdapter } = require("../providers");
const auditService = require("../audit.service");

// In-Memory mock store for dev and testing
const mockOutboxStore = new Map();
const mockOutboxLogsStore = [];
const mockUserPreferencesStore = new Map([
  [
    "mock-profile-id",
    {
      user_id: "mock-profile-id",
      enable_sms: true,
      enable_email: true,
      enable_in_app: true,
      enable_ivr_reminders: true,
      enable_referral_updates: true,
      enable_medicine_alerts: true,
      enable_duty_alerts: true,
    },
  ],
  [
    "opt-out-user-001",
    {
      user_id: "opt-out-user-001",
      enable_sms: false,
      enable_email: false,
      enable_in_app: true,
      enable_ivr_reminders: false,
      enable_referral_updates: false,
      enable_medicine_alerts: false,
      enable_duty_alerts: false,
    },
  ],
]);

// Redaction helper for secrets and tokens
const sanitizeEventPayload = (payload) => {
  if (!payload || typeof payload !== "object") return {};
  const sanitized = JSON.parse(JSON.stringify(payload));

  const redactKeys = ["password", "token", "secret", "api_key", "apikey", "authorization", "abha_id", "aadhaar", "private_key"];
  
  const maskPhone = (ph) => {
    if (typeof ph !== "string") return "+91 98XXX XX04";
    const cleaned = ph.replace(/\s+/g, "");
    if (cleaned.length < 8) return "+91 98XXX XX04";
    const prefix = cleaned.startsWith("+91") ? "+91 " : "";
    const digits = cleaned.replace(/^\+91/, "");
    if (digits.length >= 4) {
      return `${prefix}${digits.slice(0, 2)}XXX XX${digits.slice(-2)}`;
    }
    return "+91 98XXX XX04";
  };

  const traverse = (obj) => {
    for (const key of Object.keys(obj)) {
      const lower = key.toLowerCase();
      if (redactKeys.some((k) => lower.includes(k.toLowerCase()))) {
        obj[key] = "[REDACTED]";
      } else if (lower.includes("phone") && typeof obj[key] === "string") {
        obj[key] = maskPhone(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        traverse(obj[key]);
      }
    }
  };

  traverse(sanitized);
  return sanitized;
};

class EventOutboxService {
  /**
   * Ingest structured event into Outbox with Idempotency guarantee
   */
  async createEvent({
    event_type,
    aggregate_type,
    aggregate_id,
    payload = {},
    idempotency_key = null,
    max_retries = 3,
    metadata = {},
  }) {
    const key = idempotency_key || `event_${aggregate_type}_${aggregate_id}_${event_type}_${Date.now()}`;

    // Idempotency check in memory/db
    if (!isConfigured) {
      for (const existing of mockOutboxStore.values()) {
        if (existing.idempotency_key === key) {
          return { isDuplicate: true, event: existing };
        }
      }
    } else {
      const { data: existing } = await supabase
        .from("outbox_events")
        .select("*")
        .eq("idempotency_key", key)
        .maybeSingle();

      if (existing) {
        return { isDuplicate: true, event: existing };
      }
    }

    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const sanitizedPayload = sanitizeEventPayload(payload);

    const eventRecord = {
      id,
      event_type,
      aggregate_type,
      aggregate_id: String(aggregate_id),
      payload: sanitizedPayload,
      status: "PENDING",
      retry_count: 0,
      max_retries: max_retries || 3,
      backoff_multiplier: 2,
      last_attempted_at: null,
      next_retry_at: now,
      error_category: null,
      error_message: null,
      idempotency_key: key,
      n8n_dispatched: false,
      n8n_response_status: null,
      metadata: metadata || {},
      created_at: now,
      updated_at: now,
    };

    mockOutboxStore.set(id, eventRecord);

    if (isConfigured) {
      await Promise.resolve(supabase.from("outbox_events").insert(eventRecord)).catch((err) => {
        console.warn("Supabase outbox insert notice:", err.message);
      });
    }

    return { isDuplicate: false, event: eventRecord };
  }

  /**
   * Process Pending / Retrying Outbox Events with Exponential Backoff
   */
  async processPendingEvents({ batchSize = 10 } = {}) {
    const now = new Date();
    const nowIso = now.toISOString();

    let candidateEvents = [];
    if (!isConfigured) {
      candidateEvents = Array.from(mockOutboxStore.values())
        .filter((e) => (e.status === "PENDING" || e.status === "RETRYING") && new Date(e.next_retry_at) <= now)
        .slice(0, batchSize);
    } else {
      const { data, error } = await supabase
        .from("outbox_events")
        .select("*")
        .in("status", ["PENDING", "RETRYING"])
        .lte("next_retry_at", nowIso)
        .limit(batchSize);

      if (!error && data) {
        candidateEvents = data;
      }
    }

    const results = {
      processed: candidateEvents.length,
      succeeded: 0,
      retried: 0,
      abandoned: 0,
      events: [],
    };

    for (const event of candidateEvents) {
      event.status = "PROCESSING";
      event.last_attempted_at = nowIso;
      const startTime = Date.now();

      try {
        // 1. Dispatch to n8n if configured
        let n8nResult = { success: true };
        if (n8nAdapter.isConfigured()) {
          n8nResult = await n8nAdapter.dispatchEvent({
            eventType: event.event_type,
            eventId: event.id,
            payload: event.payload,
          });
          event.n8n_dispatched = n8nResult.success;
          event.n8n_response_status = n8nResult.status;
        }

        // 2. Dispatch to target direct notification channels if applicable
        const channelResult = await this.dispatchDirectChannels(event);

        if (n8nResult.success && channelResult.success) {
          event.status = "SENT";
          event.updated_at = new Date().toISOString();
          results.succeeded++;

          this.logDispatchAttempt({
            event_id: event.id,
            attempt_number: event.retry_count + 1,
            dispatcher: n8nAdapter.isConfigured() ? "N8N_ORCHESTRATOR" : "DIRECT_PROVIDER",
            target_channel: channelResult.channel || "INTERNAL",
            status: "SUCCESS",
            duration_ms: Date.now() - startTime,
            response_code: "200",
          });
        } else {
          throw new Error(channelResult.error || n8nResult.error || "Channel dispatch failed");
        }
      } catch (err) {
        event.retry_count += 1;
        event.error_category = "DISPATCH_FAILURE";
        event.error_message = err.message ? err.message.slice(0, 200) : "Unknown error";

        if (event.retry_count >= event.max_retries) {
          event.status = "ABANDONED"; // Dead letter state
          results.abandoned++;
        } else {
          event.status = "RETRYING";
          // Exponential backoff: 2^retry_count * 1000 ms
          const backoffSec = Math.pow(event.backoff_multiplier || 2, event.retry_count);
          event.next_retry_at = new Date(Date.now() + backoffSec * 1000).toISOString();
          results.retried++;
        }
        event.updated_at = new Date().toISOString();

        this.logDispatchAttempt({
          event_id: event.id,
          attempt_number: event.retry_count,
          dispatcher: "DIRECT_PROVIDER",
          target_channel: "SMS_EMAIL",
          status: event.status === "ABANDONED" ? "FAILED" : "RETRYING",
          duration_ms: Date.now() - startTime,
          error_details: err.message,
        });
      }

      mockOutboxStore.set(event.id, event);
      if (isConfigured) {
        await supabase
          .from("outbox_events")
          .update({
            status: event.status,
            retry_count: event.retry_count,
            last_attempted_at: event.last_attempted_at,
            next_retry_at: event.next_retry_at,
            error_category: event.error_category,
            error_message: event.error_message,
            n8n_dispatched: event.n8n_dispatched,
            n8n_response_status: event.n8n_response_status,
            updated_at: event.updated_at,
          })
          .eq("id", event.id)
          .catch(() => {});
      }

      results.events.push({ id: event.id, status: event.status, retries: event.retry_count });
    }

    return results;
  }

  /**
   * Dispatch event across direct channels respecting user notification preferences
   */
  async dispatchDirectChannels(event) {
    const payload = event.payload || {};
    const recipientId = payload.recipient_id || payload.user_id;

    // Check user preferences if recipient known
    if (recipientId) {
      const prefs = await this.getUserPreferences(recipientId);
      if (prefs) {
        // If user disabled optional alerts and this is not a critical system alert:
        if (event.event_type.startsWith("REFERRAL_") && !prefs.enable_referral_updates) {
          return { success: true, channel: "OPTED_OUT", note: "User opted out of referral notifications." };
        }
        if (event.event_type.startsWith("MEDICINE_") && !prefs.enable_medicine_alerts) {
          return { success: true, channel: "OPTED_OUT", note: "User opted out of medicine notifications." };
        }
        if (event.event_type.startsWith("DUTY_") && !prefs.enable_duty_alerts) {
          return { success: true, channel: "OPTED_OUT", note: "User opted out of duty notifications." };
        }
      }
    }

    // Default channel dispatch based on event type
    if (payload.phone || payload.caller_phone) {
      await smsProvider.sendSMS({
        to: payload.phone || payload.caller_phone,
        message: payload.message || `JeevanSetu Alert: Update regarding ${event.event_type}`,
      });
    }

    if (payload.email) {
      await emailProvider.sendEmail({
        to: payload.email,
        subject: payload.subject || `JeevanSetu Update: ${event.event_type}`,
        textBody: payload.message || "Automated health update from JeevanSetu.",
      });
    }

    return { success: true, channel: "SMS_EMAIL_MOCK" };
  }

  /**
   * Retrieve user notification preferences
   */
  async getUserPreferences(userId) {
    if (!userId) return null;
    if (mockUserPreferencesStore.has(userId)) {
      return mockUserPreferencesStore.get(userId);
    }
    if (isConfigured) {
      const { data } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) return data;
    }
    return {
      user_id: userId,
      enable_sms: true,
      enable_email: true,
      enable_in_app: true,
      enable_ivr_reminders: true,
      enable_referral_updates: true,
      enable_medicine_alerts: true,
      enable_duty_alerts: true,
    };
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(userId, updates = {}) {
    const existing = (await this.getUserPreferences(userId)) || { user_id: userId };
    const updated = {
      ...existing,
      ...updates,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    mockUserPreferencesStore.set(userId, updated);
    if (isConfigured) {
      await Promise.resolve(supabase.from("user_notification_preferences").upsert(updated)).catch(() => {});
    }
    return updated;
  }

  /**
   * Log individual dispatch attempt to immutable audit ledger
   */
  logDispatchAttempt({
    event_id,
    attempt_number,
    dispatcher,
    target_channel,
    status,
    duration_ms = 0,
    response_code = "200",
    error_details = null,
  }) {
    const logRecord = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event_id,
      attempt_number,
      dispatcher,
      target_channel,
      status,
      duration_ms,
      response_code,
      error_details,
      created_at: new Date().toISOString(),
    };

    mockOutboxLogsStore.unshift(logRecord);
    if (mockOutboxLogsStore.length > 500) mockOutboxLogsStore.pop();

    if (isConfigured) {
      Promise.resolve(supabase.from("outbox_event_logs").insert(logRecord)).catch(() => {});
    }
  }

  /**
   * Manual Retry Trigger by Authorized Administrator (Preserves original event ID & idempotency)
   */
  async retryEvent(eventId, user) {
    if (!user || user.role !== "district_admin") {
      const err = new Error("Unauthorized: Only District Administrators can manually retry outbox events.");
      err.statusCode = 403;
      throw err;
    }

    const event = mockOutboxStore.get(eventId);
    if (!event) {
      const err = new Error(`Outbox event not found with ID: ${eventId}`);
      err.statusCode = 404;
      throw err;
    }

    event.status = "PENDING";
    event.next_retry_at = new Date().toISOString();
    event.error_category = null;
    event.error_message = null;
    event.updated_at = new Date().toISOString();
    mockOutboxStore.set(eventId, event);

    this.logDispatchAttempt({
      event_id: eventId,
      attempt_number: event.retry_count,
      dispatcher: "MANUAL_RETRY",
      target_channel: "ADMIN_TRIGGER",
      status: "PENDING",
      error_details: `Manually requeued by administrator ${user.profileId || user.id}`,
    });

    await auditService.logAuditEvent({
      actor_id: user.profileId || user.id,
      action: "OUTBOX_EVENT_MANUAL_RETRY",
      entity_type: "outbox_events",
      entity_id: eventId,
      metadata: { event_type: event.event_type, idempotency_key: event.idempotency_key },
    });

    return event;
  }

  /**
   * Query Outbox events with status and type filters
   */
  async getEvents(user, { status, event_type, page = 1, limit = 50 } = {}) {
    if (!user || user.role !== "district_admin") {
      const err = new Error("Access forbidden: Outbox monitoring is restricted to District Administrators.");
      err.statusCode = 403;
      throw err;
    }

    let results = Array.from(mockOutboxStore.values());
    if (status) {
      results = results.filter((e) => e.status.toUpperCase() === status.toUpperCase());
    }
    if (event_type) {
      results = results.filter((e) => e.event_type.toLowerCase().includes(event_type.toLowerCase()));
    }

    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const offset = (page - 1) * limit;
    const paginated = results.slice(offset, offset + limit);

    return {
      total: results.length,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      items: paginated,
    };
  }

  /**
   * Get Outbox metrics and status counts
   */
  async getOutboxMetrics(user) {
    if (!user || user.role !== "district_admin") {
      const err = new Error("Access forbidden: Outbox metrics are restricted to District Administrators.");
      err.statusCode = 403;
      throw err;
    }

    const all = Array.from(mockOutboxStore.values());
    return {
      total_events: all.length,
      pending_count: all.filter((e) => e.status === "PENDING").length,
      processing_count: all.filter((e) => e.status === "PROCESSING").length,
      sent_count: all.filter((e) => e.status === "SENT").length,
      retrying_count: all.filter((e) => e.status === "RETRYING").length,
      abandoned_count: all.filter((e) => e.status === "ABANDONED").length,
      failed_count: all.filter((e) => e.status === "FAILED" || e.status === "ABANDONED").length,
      n8n_dispatched_count: all.filter((e) => e.n8n_dispatched).length,
      generated_at: new Date().toISOString(),
    };
  }
}

const eventServiceInstance = new EventOutboxService();
eventServiceInstance.sanitizeEventPayload = sanitizeEventPayload;

module.exports = eventServiceInstance;
module.exports.sanitizeEventPayload = sanitizeEventPayload;
module.exports.EventOutboxService = EventOutboxService;

