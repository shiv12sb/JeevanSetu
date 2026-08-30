const { supabase, isConfigured } = require("../config/supabase");

// Transient in-memory audit store for development/preview when Supabase is offline
const mockAuditLogsStore = [];

/**
 * Sensitive keys to redact from metadata
 */
const SENSITIVE_KEYS = [
  "password",
  "token",
  "jwt",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "apiKey",
  "api_key",
  "secret",
  "serviceRoleKey",
  "service_role_key",
];

/**
 * Recursively sanitize metadata object to prevent credential leakage in audit trails
 */
const sanitizeMetadata = (meta) => {
  if (!meta || typeof meta !== "object") return meta;
  if (Array.isArray(meta)) return meta.map(sanitizeMetadata);

  const sanitized = {};
  for (const [key, value] of Object.entries(meta)) {
    const isSensitive = SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()));
    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Log an auditable event
 * @param {Object} params
 * @param {string} params.actor_id - Profile ID of actor performing the action
 * @param {string} params.action - Auditable action code (e.g. 'CASE_CREATED', 'REFERRAL_STAGE_CHANGED', 'INVENTORY_ADJUSTED')
 * @param {string} params.entity_type - Type of entity ('health_case', 'referral', 'medicine_inventory', 'doctor_duty')
 * @param {string} params.entity_id - UUID of the target entity
 * @param {Object} params.metadata - Extra context for the audit trail
 * @param {string} params.ip_address - Client IP address
 */
const logAuditEvent = async ({
  actor_id = null,
  action,
  entity_type,
  entity_id = null,
  metadata = {},
  ip_address = null,
}) => {
  if (!action || !entity_type) {
    console.warn("Audit log skipped: missing action or entity_type");
    return null;
  }

  const sanitizedMeta = sanitizeMetadata(metadata);

  const payload = {
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata: sanitizedMeta,
    ip_address: ip_address || null,
    created_at: new Date().toISOString(),
  };

  if (!isConfigured) {
    const fakeLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
    };
    mockAuditLogsStore.unshift(fakeLog);
    // Limit in-memory store to 500 entries
    if (mockAuditLogsStore.length > 500) mockAuditLogsStore.pop();
    return fakeLog;
  }

  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Failed to persist audit log to Supabase:", error.message);
      const fallbackRecord = {
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...payload,
      };
      mockAuditLogsStore.unshift(fallbackRecord);
      return fallbackRecord;
    }
    return data;
  } catch (err) {
    console.warn("Audit logging error:", err.message);
    const fallbackRecord = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
    };
    mockAuditLogsStore.unshift(fallbackRecord);
    return fallbackRecord;
  }
};

/**
 * Retrieve audit logs (Restricted to District Admin)
 */
const getAuditLogs = async ({ entity_type, entity_id, actor_id, action, limit = 50, offset = 0 } = {}) => {
  if (!isConfigured) {
    let list = [...mockAuditLogsStore];
    if (entity_type) list = list.filter((l) => l.entity_type === entity_type);
    if (entity_id) list = list.filter((l) => l.entity_id === entity_id);
    if (actor_id) list = list.filter((l) => l.actor_id === actor_id);
    if (action) list = list.filter((l) => l.action === action);

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  let query = supabase
    .from("audit_logs")
    .select("*, profiles!actor_id(id, full_name, role)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (entity_type) query = query.eq("entity_type", entity_type);
  if (entity_id) query = query.eq("entity_id", entity_id);
  if (actor_id) query = query.eq("actor_id", actor_id);
  if (action) query = query.eq("action", action);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
  };
};

module.exports = {
  logAuditEvent,
  getAuditLogs,
};
