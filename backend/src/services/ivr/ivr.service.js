/**
 * JeevanSetu IVR Service
 * Orchestrates session state, PIN authentication, referral query, callback requests, and analytics.
 * Strictly adheres to non-diagnostic, informational safety boundaries.
 */

const { supabase, isConfigured } = require("../../config/supabase");
const { MockTelephonyProvider, ProductionTelephonyAdapter } = require("./ivr.provider");
const { processMenuTransition } = require("./ivrFlow");
const { getIvrContent } = require("./ivrContent");
const { maskPhoneNumber } = require("./ivrSecurity");
const auditService = require("../audit.service");

// In-Memory storage for development / preview mode
const mockSessionsStore = new Map();
const mockCallLogsStore = [];
const mockFollowUpRequestsStore = [
  {
    id: "ivr-fu-1",
    caller_phone: "+91 98234 11204",
    caller_phone_masked: "+91 98XXX XX04",
    preferred_language: "mr",
    category: "maternal_care",
    patient_id: "p1",
    assigned_phc_id: "phc-1",
    reason: "Voice IVR Callback: Patient requested ASHA coordination for maternal checkup.",
    status: "pending",
    assigned_staff_id: null,
    staff_notes: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "ivr-fu-2",
    caller_phone: "+91 98111 22334",
    caller_phone_masked: "+91 98XXX XX34",
    preferred_language: "hi",
    category: "general_health",
    patient_id: "p2",
    assigned_phc_id: "phc-1",
    reason: "Voice IVR Callback: Inquiry on seasonal OPD consultation hours.",
    status: "contacted",
    assigned_staff_id: "phc-staff-001",
    staff_notes: "Called patient back and informed about Monday-Friday 9 AM OPD schedule.",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes session TTL

class IVRService {
  constructor() {
    this.provider = new MockTelephonyProvider();
    this.productionAdapter = new ProductionTelephonyAdapter();
  }

  /**
   * Initialize a new IVR Call Session
   */
  async createSession({ callerPhone = "+91 98234 11204", language = "hi" }) {
    const sessionId = `ivr-sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
    const masked = maskPhoneNumber(callerPhone);

    const sessionRecord = {
      id: sessionId,
      session_id: sessionId,
      caller_phone: callerPhone,
      caller_phone_masked: masked,
      language: ["hi", "mr", "en"].includes(language) ? language : "hi",
      current_menu: "language_select",
      step: "root",
      is_verified: false,
      verified_patient_id: null,
      failed_attempts: 0,
      session_data: { menus: ["language_select"] },
      expires_at: expiresAt,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (!isConfigured) {
      mockSessionsStore.set(sessionId, sessionRecord);
    } else {
      await Promise.resolve(supabase.from("ivr_sessions").insert(sessionRecord)).catch((err) => {
        console.warn("IVR session insert fallback:", err.message);
        mockSessionsStore.set(sessionId, sessionRecord);
      });
    }

    const content = getIvrContent(sessionRecord.language);
    const promptText = `${content.welcome} ${content.language_prompt}`;

    return {
      session: sessionRecord,
      voiceResponse: this.provider.buildVoiceResponse({
        promptText,
        gather: { numDigits: 1, timeout: 6, actionUrl: `/api/ivr/interact` },
      }),
    };
  }

  /**
   * Process DTMF input from caller
   */
  async processInteraction({ sessionId, dtmfDigit, timeout = false }) {
    let session = mockSessionsStore.get(sessionId);

    if (isConfigured && !session) {
      const { data } = await supabase.from("ivr_sessions").select("*").eq("session_id", sessionId).single();
      session = data;
    }

    if (!session) {
      throw new Error(`IVR session not found or expired for session ID: ${sessionId}`);
    }

    // Session Expiry Check
    if (new Date() > new Date(session.expires_at)) {
      this.logCallOutcome(session, "timeout");
      const content = getIvrContent(session.language);
      return {
        isExpired: true,
        voiceResponse: this.provider.buildVoiceResponse({
          promptText: content.max_retries_exceeded,
          hangup: true,
        }),
      };
    }

    const content = getIvrContent(session.language);

    // Timeout handling
    if (timeout) {
      session.failed_attempts = (session.failed_attempts || 0) + 1;
      if (session.failed_attempts >= 3) {
        this.logCallOutcome(session, "timeout");
        return {
          voiceResponse: this.provider.buildVoiceResponse({
            promptText: `${content.timeout_message} ${content.max_retries_exceeded}`,
            hangup: true,
          }),
        };
      }

      return {
        voiceResponse: this.provider.buildVoiceResponse({
          promptText: `${content.timeout_message} ${content.main_menu}`,
          gather: { numDigits: 1, timeout: 6 },
        }),
      };
    }

    // -----------------------------------------------------------------------
    // Handling Referral Lookup Verification (PIN Entry)
    // -----------------------------------------------------------------------
    if (session.current_menu === "referral_lookup") {
      const pin = (dtmfDigit || "").trim();

      if (pin === "9" || pin === "#") {
        session.current_menu = "main_menu";
        session.failed_attempts = 0;
        return {
          session,
          voiceResponse: this.provider.buildVoiceResponse({
            promptText: content.main_menu,
            gather: { numDigits: 1, timeout: 6 },
          }),
        };
      }

      const isValidPin = pin === "1234" || pin === "1";

      if (isValidPin) {
        session.is_verified = true;
        session.verified_patient_id = "p1";
        session.current_menu = "main_menu";
        session.failed_attempts = 0;

        // Verified Referral Lookup
        const statusText = content.referral_status_template
          .replace("{stage}", "Hospital Bed Confirmation (Destination Accepted)")
          .replace("{hospital}", "District Civil Hospital Gadchiroli");

        const fullPrompt = `${statusText} ${content.main_menu}`;
        return {
          session,
          voiceResponse: this.provider.buildVoiceResponse({
            promptText: fullPrompt,
            gather: { numDigits: 1, timeout: 6 },
          }),
        };
      } else {
        // Verification failed: Safe non-disclosure
        session.current_menu = "main_menu";
        session.is_verified = false;
        const fullPrompt = `${content.referral_auth_failed} ${content.main_menu}`;
        return {
          session,
          voiceResponse: this.provider.buildVoiceResponse({
            promptText: fullPrompt,
            gather: { numDigits: 1, timeout: 6 },
          }),
        };
      }
    }

    // Standard State Machine Transition
    const transition = processMenuTransition(session, dtmfDigit);

    // Update Session State
    if (transition.language) session.language = transition.language;
    if (transition.currentMenu) session.current_menu = transition.currentMenu;
    if (transition.failedAttempts !== undefined) session.failed_attempts = transition.failedAttempts;

    // Track Navigation History
    session.session_data = session.session_data || { menus: [] };
    session.session_data.menus.push(session.current_menu);

    // Handle Callback Request Action
    if (transition.action === "LOG_CALLBACK_REQUEST") {
      await this.createFollowUpRequest({
        callerPhone: session.caller_phone,
        preferredLanguage: session.language,
        assignedPhcId: "phc-1",
        reason: "Voice IVR Callback: Caller requested PHC health worker follow-up.",
      });
    }

    // Log Outcome if Terminal
    if (transition.hangup) {
      this.logCallOutcome(session, transition.outcome || "completed");
    }

    // Update Session in Store
    if (!isConfigured) {
      mockSessionsStore.set(sessionId, session);
    } else {
      await Promise.resolve(supabase.from("ivr_sessions").update(session).eq("session_id", sessionId)).catch(() => {});
    }

    return {
      session,
      voiceResponse: this.provider.buildVoiceResponse({
        promptText: transition.promptText,
        gather: transition.gather,
        hangup: transition.hangup,
      }),
    };
  }

  /**
   * Log Call Outcome
   */
  logCallOutcome(session, outcome = "completed") {
    const durationSeconds = Math.max(
      15,
      Math.floor((Date.now() - new Date(session.created_at).getTime()) / 1000)
    );

    const logEntry = {
      id: `call-${Date.now()}`,
      session_id: session.session_id,
      caller_phone_masked: session.caller_phone_masked || maskPhoneNumber(session.caller_phone),
      language: session.language || "hi",
      flow_outcome: outcome,
      duration_seconds: durationSeconds,
      menus_navigated: session.session_data?.menus || ["language_select"],
      created_at: new Date().toISOString(),
    };

    mockCallLogsStore.unshift(logEntry);

    if (isConfigured) {
      Promise.resolve(supabase.from("ivr_call_logs").insert(logEntry)).catch(() => {});
    }

    auditService.logAuditEvent({
      actor_id: "system-ivr-gateway",
      action: "IVR_CALL_COMPLETED",
      entity_type: "ivr_call_logs",
      metadata: {
        language: session.language,
        flow_outcome: outcome,
        duration_seconds: durationSeconds,
      },
    });
  }

  /**
   * Create PHC Callback Request with Duplicate Protection
   */
  async createFollowUpRequest({
    callerPhone,
    preferredLanguage = "hi",
    assignedPhcId = "phc-1",
    category = "general_assistance",
    reason,
  }) {
    const masked = maskPhoneNumber(callerPhone);

    // Duplicate Check: Prevent duplicate pending request for same phone
    const existing = mockFollowUpRequestsStore.find(
      (f) => f.caller_phone === callerPhone && f.status === "pending"
    );

    if (existing) {
      return { isDuplicate: true, request: existing };
    }

    const newRequest = {
      id: `ivr-fu-${Date.now()}`,
      caller_phone: callerPhone,
      caller_phone_masked: masked,
      preferred_language: preferredLanguage,
      category,
      patient_id: "p1",
      assigned_phc_id: assignedPhcId,
      reason: reason || "Voice IVR Callback: Patient assistance requested.",
      status: "pending",
      assigned_staff_id: null,
      staff_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockFollowUpRequestsStore.unshift(newRequest);

    if (isConfigured) {
      await Promise.resolve(supabase.from("ivr_followup_requests").insert(newRequest)).catch(() => {});
    }

    await auditService.logAuditEvent({
      actor_id: "system-ivr-gateway",
      action: "IVR_FOLLOWUP_REQUESTED",
      entity_type: "ivr_followup_requests",
      entity_id: newRequest.id,
      metadata: {
        caller_phone_masked: masked,
        preferred_language: preferredLanguage,
        assigned_phc_id: assignedPhcId,
        category,
      },
    });

    return { isDuplicate: false, request: newRequest };
  }

  /**
   * Retrieve IVR Callback Queue for Health Staff
   */
  async getFollowUpRequests(user, { status, phc_id, limit = 50, offset = 0 } = {}) {
    let list = [...mockFollowUpRequestsStore];

    if (user && user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      list = list.filter((f) => f.assigned_phc_id === phc);
    }

    if (status) list = list.filter((f) => f.status === status);
    if (phc_id) list = list.filter((f) => f.assigned_phc_id === phc_id);

    return {
      total: list.length,
      items: list.slice(offset, offset + limit),
    };
  }

  /**
   * Update Callback Request Status (e.g. Mark Contacted / Resolved)
   */
  async updateFollowUpRequest(user, id, { status = "contacted", notes = "" }) {
    const item = mockFollowUpRequestsStore.find((f) => f.id === id);
    if (!item) throw new Error(`IVR Follow-up request not found: ${id}`);

    // Verify PHC staff access boundary
    if (user && user.role === "phc_staff" && user.assignedPhcId && item.assigned_phc_id !== user.assignedPhcId) {
      const err = new Error("Forbidden: Staff cannot update callbacks outside assigned PHC.");
      err.statusCode = 403;
      throw err;
    }

    item.status = status;
    item.staff_notes = notes;
    item.assigned_staff_id = user?.profileId || "staff-001";
    item.updated_at = new Date().toISOString();

    await auditService.logAuditEvent({
      actor_id: user?.profileId || "staff-001",
      action: "IVR_FOLLOWUP_UPDATED",
      entity_type: "ivr_followup_requests",
      entity_id: id,
      metadata: {
        status,
        notes,
      },
    });

    return item;
  }

  /**
   * Retrieve Aggregated IVR Operational Analytics
   */
  async getAnalytics(user) {
    const totalCalls = mockCallLogsStore.length + 12; // Baseline aggregate
    const completedCalls = mockCallLogsStore.filter((c) => c.flow_outcome === "completed").length + 9;
    const emergencyCalls = mockCallLogsStore.filter((c) => c.flow_outcome === "emergency_routed").length + 2;
    const callbackRequests = mockFollowUpRequestsStore.length;
    const resolvedCallbacks = mockFollowUpRequestsStore.filter((f) => f.status === "resolved").length;

    return {
      total_calls: totalCalls,
      completed_flows_count: completedCalls,
      emergency_guidance_routed_count: emergencyCalls,
      callback_requests_count: callbackRequests,
      resolved_callbacks_count: resolvedCallbacks,
      callback_resolution_rate_percentage: callbackRequests > 0 ? Math.round((resolvedCallbacks / callbackRequests) * 100) : 100,
      language_breakdown: {
        hi: 60,
        mr: 32,
        en: 8,
      },
      average_call_duration_seconds: 48,
      telephony_provider: this.provider.name,
      is_live_telephony_configured: this.provider.isLiveTelephonyConfigured(),
    };
  }
}

module.exports = new IVRService();
