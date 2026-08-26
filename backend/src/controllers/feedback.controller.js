/**
 * ==============================================================================
 * JEEVANSETU PHASE 26 — CITIZEN FEEDBACK & MISSED-CALL CONTROLLER
 * ==============================================================================
 */

const feedbackService = require("../services/feedback.service");
const aiService = require("../services/ai/ai.service");
const { checkRateLimit, verifyReplayProtection } = require("../services/ivr/ivrSecurity");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Public / Patient Web Feedback Submission (Authenticated or Anonymous)
 */
const submitFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.submitFeedback(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Your feedback has been recorded. Thank you for helping improve rural healthcare delivery.",
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Anonymous Web Feedback Submission
 */
const submitAnonymousFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.submitFeedback(null, {
      ...req.body,
      is_anonymous: true,
    });
    return sendSuccess(res, {
      statusCode: 201,
      message: "Your anonymous feedback has been recorded. Thank you.",
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public Status Tracking via Secure Tracking Token
 */
const trackFeedback = async (req, res, next) => {
  try {
    const result = await feedbackService.getFeedbackByTrackingToken(req.params.trackingToken);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Feedback tracking status retrieved.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Incoming Missed-Call Telephony Webhook
 */
const handleMissedCall = async (req, res, next) => {
  try {
    const rateCheck = checkRateLimit(req.ip || "missed-call-webhook");
    if (!rateCheck.allowed) {
      return res.status(429).send("Too Many Requests. Rate limit exceeded.");
    }

    const replayCheck = verifyReplayProtection({
      timestamp: req.headers["x-ivr-timestamp"] || req.body.timestamp,
      nonce: req.headers["x-ivr-nonce"] || req.body.nonce,
    });
    if (!replayCheck.valid) {
      return res.status(400).send(`Security Error: ${replayCheck.reason}`);
    }

    const callerPhone = req.body.callerPhone || req.body.From || req.body.caller || "+91 98234 11204";
    const idempotencyKey = req.headers["x-idempotency-key"] || req.body.idempotencyKey;

    const result = await feedbackService.handleMissedCallWebhook({
      callerPhone,
      idempotencyKey,
    });

    if (req.headers.accept && req.headers.accept.includes("xml")) {
      res.setHeader("Content-Type", "application/xml");
      return res.send(result.voiceResponse.xmlResponse);
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Missed call registered. Outbound IVR feedback callback initiated.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Process DTMF Keypress in IVR Feedback Session
 */
const processIvrFeedback = async (req, res, next) => {
  try {
    const { sessionId, dtmfDigit, timeout } = req.body;
    const result = await feedbackService.processIvrFeedback({
      sessionId,
      dtmfDigit,
      timeout,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve Feedback List (Role-Scoped)
 */
const getFeedback = async (req, res, next) => {
  try {
    const pagination = req.pagination || { limit: 50, offset: 0 };
    const { facility_id, category, rating, is_anonymous, status, channel } = req.query;

    const result = await feedbackService.getFeedback(req.user, {
      facility_id,
      category,
      rating,
      channel,
      is_anonymous,
      status,
      limit: pagination.limit,
      offset: pagination.offset,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      pagination: {
        total: result.total,
        page: req.pagination?.page || 1,
        limit: pagination.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve Single Feedback by ID (Role-Scoped)
 */
const getFeedbackById = async (req, res, next) => {
  try {
    const item = await feedbackService.getFeedbackById(req.user, req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Review Feedback (Supervisor Action & Internal Notes)
 */
const reviewFeedback = async (req, res, next) => {
  try {
    const updated = await feedbackService.reviewFeedback(
      req.user,
      req.params.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `Feedback review recorded. Status updated to '${updated.status}'.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve Aggregated Feedback Analytics & AI Summary
 */
const getFeedbackAnalytics = async (req, res, next) => {
  try {
    const analytics = await feedbackService.getFeedbackAnalytics(req.user);
    const aiSummary = await aiService.summarizeFeedbackAnalytics({
      feedbackMetrics: analytics,
      user: req.user,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: {
        ...analytics,
        ai_summary: aiSummary,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve 7-Day Feedback Trends
 */
const getFeedbackTrends = async (req, res, next) => {
  try {
    const trends = await feedbackService.getFeedbackTrends(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      data: trends,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve Operational Quality Signals Feed
 */
const getQualitySignals = async (req, res, next) => {
  try {
    const signals = await feedbackService.getQualitySignals(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      data: signals,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Operational Quality Signal (Acknowledge / Resolve)
 */
const updateQualitySignal = async (req, res, next) => {
  try {
    const updated = await feedbackService.updateQualitySignal(
      req.user,
      req.params.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Quality signal status updated.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * AI Categorization & Translation Assistant
 */
const aiAssistFeedback = async (req, res, next) => {
  try {
    const { text, language } = req.body;
    const result = await aiService.categorizeAndSummarizeFeedback({
      text,
      language: language || "en",
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitFeedback,
  submitAnonymousFeedback,
  trackFeedback,
  handleMissedCall,
  processIvrFeedback,
  getFeedback,
  getFeedbackById,
  reviewFeedback,
  getFeedbackAnalytics,
  getFeedbackTrends,
  getQualitySignals,
  updateQualitySignal,
  aiAssistFeedback,
};
