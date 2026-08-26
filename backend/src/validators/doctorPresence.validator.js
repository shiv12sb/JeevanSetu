const { sendError } = require("../utils/response");

const validateCheckInPayload = (req, res, next) => {
  const { doctor_id, duty_type } = req.body;

  if (duty_type) {
    const validDutyTypes = [
      "OPD_GENERAL",
      "EMERGENCY_ON_CALL",
      "OUTREACH_CAMP",
      "VACCINATION_DRIVE",
      "ADMINISTRATIVE",
    ];
    if (!validDutyTypes.includes(duty_type)) {
      return sendError(res, {
        statusCode: 400,
        message: `Invalid duty_type: ${duty_type}. Must be one of ${validDutyTypes.join(", ")}`,
      });
    }
  }

  next();
};

const validateSignalReviewPayload = (req, res, next) => {
  const { decision, reason } = req.body;

  const validDecisions = [
    "CONFIRMED_DATA_ISSUE",
    "CONFIRMED_OPERATIONAL_GAP",
    "AUTHORIZED_REASON",
    "NO_ISSUE",
    "REQUIRES_FOLLOW_UP",
  ];

  if (!decision || !validDecisions.includes(decision)) {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid or missing review decision. Must be one of: ${validDecisions.join(", ")}`,
    });
  }

  if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Review reason/notes are required for administrative audit trail.",
    });
  }

  next();
};

module.exports = {
  validateCheckInPayload,
  validateSignalReviewPayload,
};
