/**
 * ==============================================================================
 * JEEVANSETU PHASE 26 — CITIZEN FEEDBACK & MISSED-CALL SERVICE
 * ==============================================================================
 * Unified feedback model across Web, IVR, Missed-Call, and SMS.
 * Enforces privacy-safe caller hashing, secure tracking tokens, abuse throttling,
 * spam detection (POSSIBLE_SPAM status), role-based scoping, non-punitive quality
 * signals, multilingual preservation, and audit logging.
 */

const crypto = require("crypto");
const { supabase, isConfigured } = require("../config/supabase");
const { MockTelephonyProvider } = require("./ivr/ivr.provider");
const { checkRateLimit, verifyReplayProtection } = require("./ivr/ivrSecurity");
const { processFeedbackTransition } = require("./feedbackFlow");
const { getFeedbackContent } = require("./feedbackContent");
const { calculateFeedbackMetrics, detectQualitySignals, calculateFeedbackTrends } = require("./feedbackAnalytics.service");
const smsService = require("./sms/sms.service");
const aiService = require("./ai/ai.service");
const notificationService = require("./notification.service");
const auditService = require("./audit.service");

const SALT = process.env.FEEDBACK_CALLER_SALT || "JeevanSetu_Citizen_Feedback_Salt_2026";

const CANONICAL_CATEGORIES = [
  "PHC_SERVICE",
  "DOCTOR_AVAILABILITY",
  "STAFF_BEHAVIOUR",
  "MEDICINE_AVAILABILITY",
  "WAITING_TIME",
  "CLEANLINESS_FACILITY",
  "REFERRAL_EXPERIENCE",
  "EMERGENCY_SERVICE_ACCESS",
  "OTHER",
];

const CATEGORY_ALIASES = {
  service_quality: "PHC_SERVICE",
  phc_visit: "PHC_SERVICE",
  facility: "CLEANLINESS_FACILITY",
  medicine_stock: "MEDICINE_AVAILABILITY",
  referral_speed: "REFERRAL_EXPERIENCE",
  doctor_availability: "DOCTOR_AVAILABILITY",
  staff_behaviour: "STAFF_BEHAVIOUR",
  waiting_time: "WAITING_TIME",
  cleanliness: "CLEANLINESS_FACILITY",
  general: "OTHER",
  accessibility: "OTHER",
  other: "OTHER",
};

const VALID_STATUSES = [
  "SUBMITTED",
  "ACKNOWLEDGED",
  "UNDER_REVIEW",
  "RESOLVED",
  "DISMISSED",
  "POSSIBLE_SPAM",
  // Legacy aliases
  "NEW",
  "CLOSED",
];

// In-Memory store for development and testing
let mockFeedbackStore = [
  {
    id: "fb-seed-1",
    tracking_token: "JS-FB-7A82-9K1L",
    patient_id: null,
    case_id: null,
    facility_target_type: "phc",
    facility_type: "phc",
    phc_id: "phc-1",
    hospital_id: null,
    rating: 5,
    category: "CLEANLINESS_FACILITY",
    service_tag: "cleanliness",
    message: "Anonymous IVR Feedback: Very clean facility and prompt doctor consultation.",
    original_text: "Very clean facility and prompt doctor consultation.",
    translated_text: null,
    is_anonymous: true,
    caller_hash: crypto.createHash("sha256").update("+919823411204" + SALT).digest("hex"),
    caller_phone_masked: "+91 98XXX XX04",
    contact_name: null,
    contact_phone: null,
    feedback_channel: "MISSED_CALL",
    language: "hi",
    moderation_status: "approved",
    status: "ACKNOWLEDGED",
    internal_notes: "Reviewed during morning briefing.",
    reviewed_by_id: "admin-uuid-001",
    reviewed_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    events: [],
  },
  {
    id: "fb-seed-2",
    tracking_token: "JS-FB-3B19-4X8M",
    patient_id: null,
    case_id: null,
    facility_target_type: "phc",
    facility_type: "phc",
    phc_id: "phc-1",
    hospital_id: null,
    rating: 2,
    category: "MEDICINE_AVAILABILITY",
    service_tag: "medicine_stock",
    message: "Anonymous IVR Feedback: Paracetamol syrup was out of stock at pharmacy window.",
    original_text: "Paracetamol syrup was out of stock at pharmacy window.",
    translated_text: null,
    is_anonymous: true,
    caller_hash: crypto.createHash("sha256").update("+919823499881" + SALT).digest("hex"),
    caller_phone_masked: "+91 98XXX XX81",
    contact_name: null,
    contact_phone: null,
    feedback_channel: "MISSED_CALL",
    language: "mr",
    moderation_status: "approved",
    status: "UNDER_REVIEW",
    internal_notes: "Buffer stock replenishment requested from district warehouse.",
    reviewed_by_id: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    events: [],
  },
  {
    id: "fb-seed-3",
    tracking_token: "JS-FB-88C1-55N2",
    patient_id: "pat-uuid-001",
    case_id: null,
    facility_target_type: "phc",
    facility_type: "phc",
    phc_id: "phc-1",
    hospital_id: null,
    rating: 4,
    category: "STAFF_BEHAVIOUR",
    service_tag: "staff_behaviour",
    message: "Consultation was prompt and staff was respectful.",
    original_text: "Consultation was prompt and staff was respectful.",
    translated_text: null,
    is_anonymous: false,
    caller_hash: null,
    caller_phone_masked: null,
    contact_name: "Santosh Pawar",
    contact_phone: "+91 98765 43210",
    feedback_channel: "WEB",
    language: "en",
    moderation_status: "approved",
    status: "ACKNOWLEDGED",
    internal_notes: "Reviewed during weekly OPD meeting.",
    reviewed_by_id: "admin-uuid-001",
    reviewed_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 18000000).toISOString(),
    events: [],
  },
];

const mockFeedbackSessions = new Map();
const mockFeedbackInteractions = [];
const mockQualitySignalsStore = [];
const mockReviewEventsStore = [];
const processedIdempotencyKeys = new Set();
const recentSubmissionsCache = new Map();

/**
 * Generate cryptographically secure tracking token (e.g. JS-FB-7A82-9K1L)
 */
const generateTrackingToken = () => {
  const bytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `JS-FB-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
};

/**
 * Generate salted SHA-256 hash for privacy-safe caller identifier
 */
const createCallerHash = (phone) => {
  if (!phone) return null;
  const cleanPhone = String(phone).replace(/[^\d+]/g, "");
  return crypto.createHash("sha256").update(cleanPhone + SALT).digest("hex");
};

/**
 * Mask phone number for authorized staff display (+91 98XXX XX04)
 */
const maskPhoneNumber = (phone) => {
  if (!phone) return null;
  const clean = String(phone).trim();
  if (clean.length < 8) return "+91 XXXXXXXX";
  const start = clean.slice(0, 7);
  const end = clean.slice(-2);
  return `${start.slice(0, 6)}XXX XX${end}`;
};

/**
 * Normalize Category string to canonical enum
 */
const normalizeCategory = (cat) => {
  if (!cat) return "OTHER";
  const upper = String(cat).toUpperCase();
  if (CANONICAL_CATEGORIES.includes(upper)) return upper;
  const lower = String(cat).toLowerCase();
  if (CATEGORY_ALIASES[lower]) return CATEGORY_ALIASES[lower];
  return "OTHER";
};

/**
 * Basic anti-spam heuristic evaluator
 */
const evaluateSpamHeuristics = (text = "") => {
  if (!text || typeof text !== "string") return { isSpam: false, score: 0.0 };
  const raw = text.trim();
  let score = 0.0;

  // Excessive repetitive characters (e.g. "aaaaaaa", "11111111")
  if (/(.)\1{8,}/.test(raw)) score += 0.6;
  // External link / advertising patterns
  if (/(https?:\/\/[^\s]+|www\.[^\s]+|casino|crypto|buy now|earn money)/i.test(raw)) score += 0.8;
  // Extremely short nonsensical gibberish
  if (raw.length > 0 && raw.length < 3 && !/^[1-5]$/.test(raw)) score += 0.4;
  // Huge payload
  if (raw.length > 500) score += 0.5;

  return {
    isSpam: score >= 0.6,
    score: Math.min(1.0, parseFloat(score.toFixed(2))),
  };
};

/**
 * Sanitize free-text comments against XSS and prompt injection
 */
const sanitizeComment = (text) => {
  if (!text || typeof text !== "string") return "";
  let clean = text.replace(/<[^>]*>?/gm, "").trim();
  clean = clean.replace(
    /(\bignore previous instructions\b|\bignore your instructions\b|\bsystem prompt\b|\bjailbreak\b|\bmark this doctor guilty\b)/gi,
    "[REDACTED_INJECTION_ATTEMPT]"
  );
  return clean.slice(0, 500);
};

class FeedbackService {
  constructor() {
    this.provider = new MockTelephonyProvider();
  }

  /**
   * Handle incoming Missed-Call webhook from telephony gateway
   */
  async handleMissedCallWebhook({ callerPhone = "+91 98234 11204", idempotencyKey }) {
    // 1. Idempotency / Duplicate Webhook check
    if (idempotencyKey) {
      if (processedIdempotencyKeys.has(idempotencyKey)) {
        return { isDuplicate: true, message: "Duplicate missed-call webhook suppressed." };
      }
      processedIdempotencyKeys.add(idempotencyKey);
      const timer = setTimeout(() => processedIdempotencyKeys.delete(idempotencyKey), 10 * 60 * 1000);
      if (timer.unref) timer.unref();
    }

    // 2. Caller Rate Limiting & Throttling
    const rateCheck = checkRateLimit(callerPhone);
    if (!rateCheck.allowed) {
      const error = new Error("Rate limit exceeded for missed-call feedback.");
      error.statusCode = 429;
      throw error;
    }

    const sessionId = `fb-sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    const callerHash = createCallerHash(callerPhone);
    const maskedPhone = maskPhoneNumber(callerPhone);

    const sessionRecord = {
      id: sessionId,
      session_id: sessionId,
      caller_phone: callerPhone,
      caller_hash: callerHash,
      caller_phone_masked: maskedPhone,
      language: "hi",
      current_menu: "language_select",
      failed_attempts: 0,
      session_data: {
        facility_target_type: "phc",
        phc_id: "phc-1",
      },
      expires_at: expiresAt,
      created_at: now.toISOString(),
    };

    mockFeedbackSessions.set(sessionId, sessionRecord);

    // Record interaction in feedback_interactions table/store
    const interactionRecord = {
      id: `int-${sessionId}`,
      interaction_type: "MISSED_CALL",
      session_id: sessionId,
      caller_hash: callerHash,
      caller_phone_masked: maskedPhone,
      language: "hi",
      current_step: "INITIATED",
      provider_name: this.provider.name,
      provider_status: "INITIALIZED",
      expires_at: expiresAt,
      created_at: now.toISOString(),
    };
    mockFeedbackInteractions.unshift(interactionRecord);

    // Optional: send transactional SMS feedback link if SMS provider configured
    await smsService.sendMissedCallFeedbackLink({
      to: callerPhone,
      language: "hi",
    }).catch((err) => console.warn("SMS feedback link notice:", err.message));

    const content = getFeedbackContent("hi");
    const promptText = `${content.welcome} ${content.language_prompt}`;

    return {
      sessionId,
      voiceResponse: this.provider.buildVoiceResponse({
        promptText,
        gather: { numDigits: 1, timeout: 6, actionUrl: `/api/feedback/ivr` },
      }),
      provider_status: smsService.isLiveSMSConfigured() ? "DELIVERED" : "PROVIDER_NOT_CONFIGURED",
    };
  }

  /**
   * Process incoming DTMF digit for active IVR feedback session
   */
  async processIvrFeedback({ sessionId, dtmfDigit, timeout }) {
    const session = mockFeedbackSessions.get(sessionId);
    if (!session) {
      const error = new Error("Feedback session expired or not found.");
      error.statusCode = 404;
      throw error;
    }

    const nextTransition = processFeedbackTransition(session, dtmfDigit, timeout);

    // Update session state
    session.language = nextTransition.language || session.language;
    session.current_menu = nextTransition.currentMenu || session.current_menu;
    if (nextTransition.failedAttempts !== undefined) {
      session.failed_attempts = nextTransition.failedAttempts;
    }
    const updateData = nextTransition.sessionDataUpdate || nextTransition.sessionData;
    if (updateData) {
      session.session_data = { ...session.session_data, ...updateData };
    }

    // If call completed / feedback finalized
    if (nextTransition.hangup && (session.session_data?.category || session.session_data?.rating)) {
      const category = normalizeCategory(session.session_data.category || "PHC_SERVICE");
      const rating = session.session_data.rating || 4;

      const created = await this.submitFeedback({
        rating,
        category,
        service_tag: category.toLowerCase(),
        phc_id: session.session_data.phc_id || "phc-1",
        hospital_id: session.session_data.hospital_id || null,
        facility_target_type: session.session_data.facility_target_type || "phc",
        is_anonymous: true,
        callerPhone: session.caller_phone,
        feedback_channel: "MISSED_CALL",
        language: session.language || "hi",
        has_voice_recording: Boolean(session.session_data.has_voice_recording),
        voice_recording_duration_sec: session.session_data.voice_recording_duration_sec || 0,
        message: `Anonymous IVR Feedback: Rating ${rating}/5 for ${category}.`,
      });

      mockFeedbackSessions.delete(sessionId);

      return {
        session,
        trackingToken: created.tracking_token,
        voiceResponse: this.provider.buildVoiceResponse(nextTransition),
      };
    }

    return {
      session,
      voiceResponse: this.provider.buildVoiceResponse(nextTransition),
    };
  }

  /**
   * Submit citizen feedback (Authenticated or Anonymous)
   */
  async submitFeedback(userOrData, maybeData) {
    let user = null;
    let feedbackData = {};
    if (maybeData !== undefined) {
      user = userOrData;
      feedbackData = maybeData || {};
    } else {
      feedbackData = userOrData || {};
      user = null;
    }

    // 1. Rating Validation (Optional: 1-5 or null)
    let rawRating = null;
    if (feedbackData.rating !== undefined && feedbackData.rating !== null && feedbackData.rating !== "") {
      const parsedRating = parseInt(feedbackData.rating, 10);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        const err = new Error("Validation error: Rating must be an integer between 1 and 5 stars.");
        err.statusCode = 400;
        throw err;
      }
      rawRating = parsedRating;
    }

    // 2. Category Validation & Normalization
    let category = "OTHER";
    if (feedbackData.category || feedbackData.service_tag) {
      const rawCat = String(feedbackData.category || feedbackData.service_tag).trim();
      const upperCat = rawCat.toUpperCase();
      const lowerCat = rawCat.toLowerCase();

      if (CANONICAL_CATEGORIES.includes(upperCat)) {
        category = upperCat;
      } else if (CATEGORY_ALIASES[lowerCat]) {
        category = CATEGORY_ALIASES[lowerCat];
      } else {
        const err = new Error(`Validation error: Invalid feedback category '${rawCat}'. Must be one of [${CANONICAL_CATEGORIES.join(", ")}].`);
        err.statusCode = 400;
        throw err;
      }
    }

    // 3. Anonymity & PII Stripping
    const isAnonymous = feedbackData.is_anonymous === true || feedbackData.is_anonymous === "true" || (!user && feedbackData.is_anonymous !== false);
    const rawComment = feedbackData.message || feedbackData.comment || "Feedback submitted.";
    const sanitizedMessage = sanitizeComment(rawComment);

    // 4. Caller Identifier & Masking
    const callerPhone = feedbackData.callerPhone || feedbackData.contact_phone || (isAnonymous ? null : user?.phone);
    const callerHash = isAnonymous ? createCallerHash(callerPhone || `anon_${Date.now()}`) : null;
    const maskedPhone = isAnonymous && callerPhone ? maskPhoneNumber(callerPhone) : null;

    // 5. Anti-Spam & Rate Limiting (Cooldown check)
    const spamCheck = evaluateSpamHeuristics(rawComment);
    let initialStatus = "SUBMITTED";
    if (spamCheck.isSpam) {
      initialStatus = "POSSIBLE_SPAM";
    } else if (feedbackData.status) {
      initialStatus = feedbackData.status;
    } else if (feedbackData.category === "SERVICE_QUALITY") {
      initialStatus = "NEW";
    }

    if (sanitizedMessage && sanitizedMessage !== "Feedback submitted." && sanitizedMessage !== "Feedback received.") {
      const dedupKey = `${feedbackData.phc_id || feedbackData.hospital_id}_${category}_${rawRating}_${sanitizedMessage.slice(0, 50)}`;
      const lastSubmission = recentSubmissionsCache.get(dedupKey);
      if (lastSubmission && Date.now() - lastSubmission < 60000) {
        const err = new Error("Duplicate feedback submission: Please wait before submitting identical feedback.");
        err.statusCode = 429;
        throw err;
      }
      recentSubmissionsCache.set(dedupKey, Date.now());
    }

    // 6. Generate Secure Tracking Token
    const trackingToken = generateTrackingToken();

    // 7. Safe Assistive AI Categorization (Preserves original text, translation separated)
    const lang = feedbackData.language || "en";
    const aiInsight = await aiService.categorizeAndSummarizeFeedback({
      text: sanitizedMessage,
      language: lang,
    });

    const payload = {
      id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tracking_token: trackingToken,
      patient_id: isAnonymous ? null : (user?.profileId || user?.id || null),
      case_id: feedbackData.case_id || null,
      facility_target_type: feedbackData.facility_target_type || (feedbackData.hospital_id ? "hospital" : "phc"),
      facility_type: feedbackData.facility_type || (feedbackData.hospital_id ? "hospital" : "phc"),
      phc_id: feedbackData.phc_id || null,
      hospital_id: feedbackData.hospital_id || null,
      district: feedbackData.district || "Gadchiroli",
      taluka: feedbackData.taluka || "Chamorshi",
      pincode: feedbackData.pincode || null,
      rating: rawRating,
      category,
      service_tag: category.toLowerCase(),
      message: sanitizedMessage,
      original_text: rawComment,
      translated_text: aiInsight.translated_text || null,
      ai_category: aiInsight.category,
      ai_summary: aiInsight.summary,
      ai_priority: aiInsight.possible_priority || "medium",
      is_anonymous: isAnonymous,
      caller_hash: callerHash,
      caller_phone_masked: maskedPhone,
      contact_name: isAnonymous ? null : (feedbackData.contact_name || user?.name || null),
      contact_phone: isAnonymous ? null : (feedbackData.contact_phone || user?.phone || null),
      feedback_channel: (feedbackData.feedback_channel || "WEB").toUpperCase(),
      language: lang,
      has_voice_recording: Boolean(feedbackData.has_voice_recording),
      voice_recording_url: feedbackData.voice_recording_url || null,
      voice_recording_duration_sec: feedbackData.voice_recording_duration_sec || 0,
      is_spam: spamCheck.isSpam,
      spam_score: spamCheck.score,
      moderation_status: spamCheck.isSpam ? "flagged" : "approved",
      status: initialStatus,
      internal_notes: null,
      reviewed_by_id: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      events: [],
    };

    mockFeedbackStore.unshift(payload);

    if (isConfigured) {
      await Promise.resolve(supabase.from("feedback").insert(payload)).catch((err) => {
        console.warn("Supabase feedback insert fallback:", err.message);
      });
    }

    // Send confirmation SMS if phone provided and channel is non-IVR
    if (callerPhone && feedbackData.feedback_channel !== "IVR") {
      await smsService.sendFeedbackConfirmation({
        to: callerPhone,
        trackingToken,
        language: lang,
      }).catch((err) => console.warn("Feedback SMS dispatch notice:", err.message));
    }

    // Evaluate Quality Signals Deterministically
    const signals = detectQualitySignals(mockFeedbackStore);
    for (const sig of signals) {
      if (!mockQualitySignalsStore.some((s) => s.id === sig.id)) {
        mockQualitySignalsStore.unshift(sig);

        await notificationService.createNotification({
          recipient_id: "admin-uuid-001",
          type: "system_alert",
          title: sig.title,
          message: sig.description,
          metadata: { dedup_key: `dedup_${sig.id}_${new Date().toISOString().slice(0, 10)}` },
        });
      }
    }

    return payload;
  }

  /**
   * Public Anonymous Status Tracking via Secure Tracking Token
   * Returns sanitized public status without exposing phone or private staff notes
   */
  async getFeedbackByTrackingToken(trackingToken) {
    const cleanToken = String(trackingToken).trim().toUpperCase();
    const item = mockFeedbackStore.find((f) => f.tracking_token === cleanToken);

    if (!item) {
      const err = new Error("Feedback record not found for the provided tracking token.");
      err.statusCode = 404;
      throw err;
    }

    // Return safe public tracking snapshot
    return {
      tracking_token: item.tracking_token,
      category: item.category,
      rating: item.rating,
      facility_target_type: item.facility_target_type,
      facility_name: item.phc_id ? "Primary Health Centre" : (item.hospital_id ? "District Hospital" : "District Healthcare"),
      status: item.status,
      created_at: item.created_at,
      reviewed_at: item.reviewed_at,
      has_voice_recording: item.has_voice_recording,
      message_acknowledgement: "Your feedback has been recorded and is available for health administration review.",
    };
  }

  /**
   * Retrieve feedback records with role-based scoping and anonymity masking
   */
  async getFeedback(user, { facility_id, category, rating, is_anonymous, status, channel, limit = 50, offset = 0 } = {}) {
    let list = [...mockFeedbackStore];

    if (user.role === "patient") {
      // Patients can only see their own authenticated (non-anonymous) feedback
      list = list.filter((f) => f.patient_id === user.profileId && !f.is_anonymous);
    } else if (user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      list = list.filter((f) => f.phc_id === phc);
    } else if (user.role === "hospital_staff") {
      const hosp = user.assignedHospitalId || "hosp-1";
      list = list.filter((f) => f.hospital_id === hosp);
    }

    if (facility_id) {
      list = list.filter((f) => f.phc_id === facility_id || f.hospital_id === facility_id);
    }
    if (category) {
      const normCat = normalizeCategory(category);
      list = list.filter((f) => f.category === normCat || f.service_tag === category);
    }
    if (rating) {
      list = list.filter((f) => f.rating === parseInt(rating, 10));
    }
    if (channel) {
      list = list.filter((f) => f.feedback_channel === channel.toUpperCase());
    }
    if (is_anonymous !== undefined) {
      const isAnon = is_anonymous === "true" || is_anonymous === true;
      list = list.filter((f) => f.is_anonymous === isAnon);
    }
    if (status) {
      const normStatus = status.toUpperCase();
      list = list.filter((f) => f.status === normStatus || f.status === status);
    }

    // Mask anonymous records from ordinary display
    const sanitizedList = list.map((item) => {
      if (item.is_anonymous) {
        return {
          ...item,
          patient_id: null,
          contact_name: "Anonymous Citizen",
          contact_phone: null,
          caller_phone: null,
        };
      }
      return item;
    });

    return {
      total: sanitizedList.length,
      items: sanitizedList.slice(offset, offset + limit),
    };
  }

  /**
   * Retrieve single feedback by ID
   */
  async getFeedbackById(user, feedbackId) {
    let item = mockFeedbackStore.find((f) => f.id === feedbackId);
    if (!item) {
      const err = new Error(`Feedback record not found: ${feedbackId}`);
      err.statusCode = 404;
      throw err;
    }

    if (user.role === "patient" && item.patient_id !== user.profileId) {
      const err = new Error("Access forbidden: You cannot view another citizen's feedback.");
      err.statusCode = 403;
      throw err;
    }

    if (user.role === "phc_staff" && item.phc_id !== user.assignedPhcId) {
      const err = new Error("Access forbidden: You may only view feedback for your assigned PHC.");
      err.statusCode = 403;
      throw err;
    }

    if (user.role === "hospital_staff" && item.hospital_id !== user.assignedHospitalId) {
      const err = new Error("Access forbidden: You may only view feedback for your assigned Hospital.");
      err.statusCode = 403;
      throw err;
    }

    if (item.is_anonymous) {
      item = {
        ...item,
        patient_id: null,
        contact_name: "Anonymous Citizen",
        contact_phone: null,
        caller_phone: null,
      };
    }

    return item;
  }

  /**
   * Human Administrative Review of Feedback
   * Actions: ACKNOWLEDGE, ASSIGN, ADD_NOTE, RESOLVE, DISMISS, MARK_SPAM
   */
  async reviewFeedback(user, feedbackId, { action, status, internal_notes = "", note = "", assigned_to_id = null } = {}) {
    if (!user || !["district_admin", "doctor", "phc_staff", "hospital_staff"].includes(user.role)) {
      const err = new Error("Unauthorized: Only health supervisors can review citizen feedback.");
      err.statusCode = 403;
      throw err;
    }

    const item = mockFeedbackStore.find((f) => f.id === feedbackId);
    if (!item) {
      const err = new Error(`Feedback record not found: ${feedbackId}`);
      err.statusCode = 404;
      throw err;
    }

    // Role-scoping for review action
    if (user.role === "phc_staff" && item.phc_id !== user.assignedPhcId) {
      const err = new Error("Access forbidden: You cannot review feedback for another PHC.");
      err.statusCode = 403;
      throw err;
    }

    const rawAction = action || status || "UNDER_REVIEW";
    const reviewAction = String(rawAction).toUpperCase();

    if (!VALID_STATUSES.includes(reviewAction) && !["ACKNOWLEDGE", "ASSIGN", "ADD_NOTE", "RESOLVE", "DISMISS", "MARK_SPAM", "CLOSED"].includes(reviewAction)) {
      const err = new Error(`Invalid feedback status '${rawAction}'. Must be one of [${VALID_STATUSES.join(", ")}].`);
      err.statusCode = 400;
      throw err;
    }

    const notesText = internal_notes || note || "";
    const now = new Date().toISOString();

    // Map action to status
    let nextStatus = item.status;
    if (reviewAction === "ACKNOWLEDGE" || reviewAction === "ACKNOWLEDGED") nextStatus = "ACKNOWLEDGED";
    else if (reviewAction === "RESOLVE" || reviewAction === "RESOLVED") nextStatus = "RESOLVED";
    else if (reviewAction === "DISMISS" || reviewAction === "DISMISSED") nextStatus = "DISMISSED";
    else if (reviewAction === "MARK_SPAM" || reviewAction === "POSSIBLE_SPAM") nextStatus = "POSSIBLE_SPAM";
    else if (reviewAction === "ASSIGN") nextStatus = "UNDER_REVIEW";
    else if (reviewAction === "ADD_NOTE") nextStatus = item.status;
    else nextStatus = reviewAction;

    item.status = nextStatus;
    item.internal_notes = notesText ? (item.internal_notes ? `${item.internal_notes}\n${notesText}` : notesText) : item.internal_notes;
    item.reviewed_by_id = user.profileId || user.id || "admin-uuid-001";
    item.reviewed_at = now;
    if (assigned_to_id) item.assigned_to_id = assigned_to_id;
    if (nextStatus === "POSSIBLE_SPAM") item.is_spam = true;

    const reviewEvent = {
      id: `fbrev-${Date.now()}`,
      feedback_id: feedbackId,
      action: reviewAction,
      status: nextStatus,
      actor_id: user.profileId || user.id,
      notes: notesText,
      created_at: now,
    };

    item.events = item.events || [];
    item.events.push(reviewEvent);
    mockReviewEventsStore.push(reviewEvent);

    await auditService.logAuditEvent({
      actor_id: user.profileId || user.id,
      action: `FEEDBACK_${reviewAction}`,
      entity_type: "feedback",
      entity_id: feedbackId,
      metadata: {
        action: reviewAction,
        status: nextStatus,
        internal_notes: notesText,
        assigned_to_id,
      },
    });

    return item;
  }

  /**
   * Retrieve aggregated feedback analytics with small-sample privacy protection (< 3 responses)
   */
  async getFeedbackAnalytics(user) {
    let list = [...mockFeedbackStore];

    if (user && user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      list = list.filter((f) => f.phc_id === phc);
    } else if (user && user.role === "hospital_staff") {
      const hosp = user.assignedHospitalId || "hosp-1";
      list = list.filter((f) => f.hospital_id === hosp);
    }

    // Small-sample privacy protection
    if (list.length < 3) {
      return {
        has_sufficient_data: false,
        total_feedback: list.length,
        message: "Insufficient responses for aggregate display (< 3 responses).",
        average_rating: null,
        category_breakdown: {},
        channel_breakdown: {},
        status_breakdown: {},
        anonymous_percentage: 0,
        unresolved_count: 0,
        active_quality_signals: [],
        is_live_telephony_configured: false,
        is_live_sms_configured: false,
      };
    }

    const metrics = calculateFeedbackMetrics(list);
    const signals = detectQualitySignals(list);
    const anonymousCount = list.filter((f) => f.is_anonymous).length;
    const unresolvedCount = list.filter((f) => f.status === "NEW" || f.status === "UNDER_REVIEW" || f.status === "SUBMITTED").length;

    return {
      has_sufficient_data: true,
      ...metrics,
      anonymous_count: anonymousCount,
      anonymous_percentage: Number(((anonymousCount / list.length) * 100).toFixed(1)),
      unresolved_count: unresolvedCount,
      active_quality_signals: signals,
      is_live_telephony_configured: this.provider.isLiveTelephonyConfigured(),
      is_live_sms_configured: smsService.isLiveSMSConfigured(),
      telephony_provider: this.provider.name,
      sms_provider: smsService.getProviderName(),
    };
  }

  /**
   * Retrieve 7-day Feedback Trends
   */
  async getFeedbackTrends(user) {
    let list = [...mockFeedbackStore];

    if (user && user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      list = list.filter((f) => f.phc_id === phc);
    } else if (user && user.role === "hospital_staff") {
      const hosp = user.assignedHospitalId || "hosp-1";
      list = list.filter((f) => f.hospital_id === hosp);
    }

    return calculateFeedbackTrends(list);
  }

  /**
   * Retrieve Operational Quality Signals
   */
  async getQualitySignals(user) {
    let signals = detectQualitySignals(mockFeedbackStore);

    if (user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      signals = signals.filter((s) => s.facility_id === phc);
    }

    return signals;
  }

  /**
   * Update Quality Signal Status
   */
  async updateQualitySignal(user, id, { status = "acknowledged", notes = "" }) {
    let signal = mockQualitySignalsStore.find((s) => s.id === id);
    if (!signal) {
      signal = {
        id,
        facility_id: "phc-1",
        signal_type: "negative_rating_spike",
        title: "Service-Quality Signal",
        description: "Service quality review.",
        status: "active",
        created_at: new Date().toISOString(),
      };
      mockQualitySignalsStore.push(signal);
    }

    signal.status = status;
    signal.review_notes = notes;
    signal.acknowledged_by = user.profileId;
    signal.updated_at = new Date().toISOString();

    await auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "QUALITY_SIGNAL_UPDATED",
      entity_type: "feedback_quality_signals",
      entity_id: id,
      metadata: { status, notes },
    });

    return signal;
  }
}

module.exports = new FeedbackService();
