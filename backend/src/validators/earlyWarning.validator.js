const { sendError } = require("../utils/response");

const VALID_STATUSES = [
  "DETECTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "DISMISSED",
  "RESOLVED",
  "new",
  "acknowledged",
  "under_review",
  "resolved",
  "escalated",
];

const VALID_ACTIONS = [
  "ACKNOWLEDGE",
  "REQUEST_INVESTIGATION",
  "VERIFY",
  "DISMISS",
  "RESOLVE",
  "ADD_NOTE",
];

const VALID_RESOLUTIONS = [
  "SEASONAL_VARIATION",
  "SEASONAL_PATTERN",
  "DATA_ENTRY_CHANGE",
  "DATA_ISSUE",
  "REPORTING_INCREASE",
  "MEDICINE_REDISTRIBUTION",
  "OUTREACH_CAMP",
  "KNOWN_EVENT",
  "TEMPORARY_EVENT",
  "NO_ANOMALY",
  "REQUIRES_MONITORING",
  "ESCALATED",
  "OTHER",
];

/**
 * Validate signal review status / action update payload
 */
const validateSignalStatusUpdate = (req, res, next) => {
  const { action, status, resolution_category, notes } = req.body;
  const targetAction = action || status;

  if (!targetAction || typeof targetAction !== "string") {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'action' or 'status' is required and must be one of [${VALID_ACTIONS.concat(VALID_STATUSES).join(", ")}].`,
    });
  }

  const upperAction = targetAction.toUpperCase();
  if (!VALID_ACTIONS.includes(upperAction) && !VALID_STATUSES.includes(targetAction) && !VALID_STATUSES.includes(upperAction)) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: Invalid review action '${targetAction}'. Must be one of [${VALID_ACTIONS.join(", ")}].`,
    });
  }

  if (resolution_category) {
    const upperRes = String(resolution_category).toUpperCase();
    if (!VALID_RESOLUTIONS.includes(upperRes)) {
      return sendError(res, {
        statusCode: 400,
        message: `Validation error: 'resolution_category' must be one of [${VALID_RESOLUTIONS.join(", ")}].`,
      });
    }
  }

  if (notes && typeof notes !== "string") {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'notes' must be a string if provided.",
    });
  }

  next();
};

/**
 * Validate ASHA / Community observation submission payload
 */
const validateCommunityReport = (req, res, next) => {
  const { area_name, observation_type, reported_count } = req.body;

  if (!area_name || typeof area_name !== "string" || area_name.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'area_name' is required.",
    });
  }

  if (!observation_type || typeof observation_type !== "string") {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'observation_type' is required.",
    });
  }

  if (reported_count !== undefined && (isNaN(parseInt(reported_count, 10)) || parseInt(reported_count, 10) < 1)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'reported_count' must be an integer >= 1.",
    });
  }

  next();
};

module.exports = {
  validateSignalStatusUpdate,
  validateCommunityReport,
  VALID_STATUSES,
  VALID_ACTIONS,
  VALID_RESOLUTIONS,
};
