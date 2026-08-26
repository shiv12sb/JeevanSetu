/**
 * ==============================================================================
 * JEEVANSETU PHASE 26 — CITIZEN FEEDBACK VALIDATORS
 * ==============================================================================
 */

const { sendError } = require("../utils/response");
const { UUID_REGEX } = require("./common.validator");

const VALID_FEEDBACK_CATEGORIES = [
  "PHC_SERVICE",
  "DOCTOR_AVAILABILITY",
  "STAFF_BEHAVIOUR",
  "MEDICINE_AVAILABILITY",
  "WAITING_TIME",
  "CLEANLINESS_FACILITY",
  "REFERRAL_EXPERIENCE",
  "EMERGENCY_SERVICE_ACCESS",
  "OTHER",
  // Legacy aliases for backwards compatibility
  "SERVICE_QUALITY",
  "FACILITY",
  "ACCESSIBILITY",
  "phc_visit",
  "hospital_care",
  "medicine_stock",
  "referral_speed",
  "cleanliness",
  "staff_behaviour",
  "doctor_availability",
  "waiting_time",
  "facility",
  "general",
];

const VALID_REVIEW_ACTIONS = [
  "ACKNOWLEDGE",
  "ASSIGN",
  "ADD_NOTE",
  "RESOLVE",
  "DISMISS",
  "MARK_SPAM",
  // Status aliases
  "SUBMITTED",
  "ACKNOWLEDGED",
  "UNDER_REVIEW",
  "RESOLVED",
  "DISMISSED",
  "POSSIBLE_SPAM",
  "NEW",
  "CLOSED",
];

/**
 * Validate Citizen Feedback Submission (Web / API / Anonymous)
 */
const validateFeedbackCreate = (req, res, next) => {
  const { rating, category, message, comment, phc_id, hospital_id, pincode } = req.body;

  // Rating is optional, but if provided, must be integer between 1 and 5
  if (rating !== undefined && rating !== null && rating !== "") {
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return sendError(res, {
        statusCode: 400,
        message: "Validation error: 'rating' must be an integer between 1 and 5 stars if provided.",
      });
    }
  }

  // Category validation
  if (category) {
    const normCategory = String(category).toUpperCase();
    const isMatched =
      VALID_FEEDBACK_CATEGORIES.includes(category) ||
      VALID_FEEDBACK_CATEGORIES.includes(normCategory) ||
      VALID_FEEDBACK_CATEGORIES.includes(category.toLowerCase());

    if (!isMatched) {
      return sendError(res, {
        statusCode: 400,
        message: `Validation error: Invalid feedback category '${category}'. Must be one of: [${VALID_FEEDBACK_CATEGORIES.slice(0, 9).join(", ")}].`,
      });
    }
  }

  // Text length limit validation (max 500 characters)
  const commentText = message || comment;
  if (commentText && typeof commentText === "string" && commentText.length > 500) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: Comment exceeds maximum allowed length of 500 characters.",
    });
  }

  // Pincode validation if provided
  if (pincode && !/^\d{6}$/.test(pincode)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'pincode' must be a valid 6-digit Indian PIN code.",
    });
  }

  if (phc_id && !UUID_REGEX.test(phc_id) && !phc_id.startsWith("phc-")) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'phc_id' must be a valid ID.",
    });
  }

  if (hospital_id && !UUID_REGEX.test(hospital_id) && !hospital_id.startsWith("hosp-")) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'hospital_id' must be a valid ID.",
    });
  }

  next();
};

/**
 * Validate Feedback Review Action / Status Update
 */
const validateFeedbackReview = (req, res, next) => {
  const { action, status, internal_notes, note } = req.body;
  const targetAction = action || status;

  if (targetAction) {
    const norm = String(targetAction).toUpperCase();
    if (!VALID_REVIEW_ACTIONS.includes(norm) && !VALID_REVIEW_ACTIONS.includes(targetAction)) {
      return sendError(res, {
        statusCode: 400,
        message: `Validation error: Invalid review action '${targetAction}'. Must be one of [${VALID_REVIEW_ACTIONS.slice(0, 6).join(", ")}].`,
      });
    }
  }

  const reviewNote = internal_notes || note;
  if (reviewNote && typeof reviewNote !== "string") {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: Review notes must be a string if provided.",
    });
  }

  next();
};

/**
 * Validate Missed Call Webhook
 */
const validateMissedCall = (req, res, next) => {
  const caller = req.body.callerPhone || req.body.From || req.body.caller;

  if (!caller && process.env.NODE_ENV === "production") {
    return sendError(res, {
      statusCode: 400,
      message: "Caller phone number is required from telephony gateway.",
    });
  }

  next();
};

/**
 * Validate IVR Interaction
 */
const validateIvrInteraction = (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'sessionId' is required for IVR interaction.",
    });
  }

  next();
};

/**
 * Validate Tracking Token Lookup
 */
const validateTrackingToken = (req, res, next) => {
  const { trackingToken } = req.params;

  if (!trackingToken || typeof trackingToken !== "string" || trackingToken.trim().length < 6) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: Valid tracking token required for status lookup.",
    });
  }

  next();
};

module.exports = {
  validateFeedbackCreate,
  validateFeedbackReview,
  validateMissedCall,
  validateIvrInteraction,
  validateTrackingToken,
  VALID_FEEDBACK_CATEGORIES,
  VALID_REVIEW_ACTIONS,
};
