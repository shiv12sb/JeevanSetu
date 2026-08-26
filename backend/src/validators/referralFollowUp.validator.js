const { sendError } = require("../utils/response");

const VALID_STATUSES = [
  "NOT_REQUIRED",
  "MONITORING",
  "FOLLOW_UP_DUE",
  "OVERDUE",
  "ESCALATED",
  "RESOLVED",
];

/**
 * Validate manual override payload
 */
const validateManualOverride = (req, res, next) => {
  const { status, reason, notes } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'status' must be one of [${VALID_STATUSES.join(", ")}].`,
    });
  }

  if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'reason' is required (minimum 5 characters) to record justification for manual resolution.",
    });
  }

  if (notes && typeof notes !== "string") {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'notes' must be a string if provided.",
    });
  }

  next();
};

module.exports = {
  validateManualOverride,
};
