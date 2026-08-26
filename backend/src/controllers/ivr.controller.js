/**
 * IVR Controller
 * Endpoints for telephony webhook, simulator interaction, callback queue, and aggregate metrics.
 */

const ivrService = require("../services/ivr/ivr.service");
const { getIvrContent } = require("../services/ivr/ivrContent");
const { checkRateLimit, verifyReplayProtection } = require("../services/ivr/ivrSecurity");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Handle incoming telephony provider webhook (DTMF input / call initiation)
 */
const handleWebhook = async (req, res, next) => {
  try {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(req.ip || "ivr-webhook");
    if (!rateCheck.allowed) {
      return res.status(429).send("Too Many Requests. Rate limit exceeded.");
    }

    // 2. Replay Protection Verification
    const replayCheck = verifyReplayProtection({
      timestamp: req.headers["x-ivr-timestamp"] || req.body.timestamp,
      nonce: req.headers["x-ivr-nonce"] || req.body.nonce,
    });
    if (!replayCheck.valid) {
      return res.status(400).send(`Security Error: ${replayCheck.reason}`);
    }

    const { Digits, From, CallSid, sessionId, digit } = req.body;
    const activeSessionId = sessionId || CallSid || `sess-${From || "anon"}`;
    const dtmfDigit = digit || Digits;

    // If session doesn't exist, initialize
    let result;
    try {
      result = await ivrService.processInteraction({
        sessionId: activeSessionId,
        dtmfDigit,
      });
    } catch (e) {
      // Create new session if not found
      result = await ivrService.createSession({
        callerPhone: From || "+91 98234 11204",
      });
    }

    // Return telephony provider XML or JSON
    if (req.headers.accept && req.headers.accept.includes("xml")) {
      res.setHeader("Content-Type", "application/xml");
      return res.send(result.voiceResponse.xmlResponse);
    }

    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Initialize / simulate a new IVR Call Session (for web testing / simulator)
 */
const createSession = async (req, res, next) => {
  try {
    const { callerPhone, language } = req.body;
    const result = await ivrService.createSession({ callerPhone, language });

    return sendSuccess(res, {
      statusCode: 201,
      message: "IVR call session initialized.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Process DTMF input from simulator or client
 */
const processInteraction = async (req, res, next) => {
  try {
    const { sessionId, dtmfDigit, timeout } = req.body;
    const result = await ivrService.processInteraction({ sessionId, dtmfDigit, timeout });

    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve curated multilingual IVR content
 */
const getLocalizedContent = async (req, res, next) => {
  try {
    const { language } = req.params;
    const content = getIvrContent(language);

    return sendSuccess(res, {
      statusCode: 200,
      data: content,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve IVR Operational Analytics (Staff / Admin)
 */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await ivrService.getAnalytics(req.user);

    return sendSuccess(res, {
      statusCode: 200,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve IVR Callback Queue
 */
const getFollowUpRequests = async (req, res, next) => {
  try {
    const { status, phc_id, limit, offset } = req.query;
    const result = await ivrService.getFollowUpRequests(req.user, {
      status,
      phc_id,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      metadata: { total: result.total },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Callback Request Status
 */
const updateFollowUpRequest = async (req, res, next) => {
  try {
    const updated = await ivrService.updateFollowUpRequest(
      req.user,
      req.params.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "IVR callback request updated.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleWebhook,
  createSession,
  processInteraction,
  getLocalizedContent,
  getAnalytics,
  getFollowUpRequests,
  updateFollowUpRequest,
};
