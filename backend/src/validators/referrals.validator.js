const { sendError } = require("../utils/response");
const { UUID_REGEX } = require("./common.validator");

const VALID_REFERRAL_STATUSES = [
  "created",
  "patient_notified",
  "destination_accepted",
  "transport_arranged",
  "patient_departed",
  "patient_reached",
  "hospital_arrived",
  "hospital_registered",
  "treatment_started",
  "follow_up_required",
  "follow_up_completed",
  "completed",
  "closed",
  "cancelled",
];

const VALID_PRIORITIES = ["routine", "urgent", "emergency"];

const isValidId = (id) => {
  return UUID_REGEX.test(id) || (typeof id === "string" && (id.startsWith("phc-") || id.startsWith("hosp-") || id.startsWith("ngo-") || id.startsWith("case-") || id.startsWith("pat-") || id.startsWith("ref-")));
};

/**
 * Validate Referral Creation
 */
const validateReferralCreate = (req, res, next) => {
  const {
    case_id,
    originating_phc_id,
    destination_hospital_id,
    required_specialty,
    clinical_summary,
    priority,
  } = req.body;

  if (case_id && !isValidId(case_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'case_id' must be a valid ID.",
    });
  }

  if (originating_phc_id && !isValidId(originating_phc_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'originating_phc_id' must be a valid ID.",
    });
  }

  if (!destination_hospital_id || !isValidId(destination_hospital_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'destination_hospital_id' is required and must be a valid ID.",
    });
  }

  if (!required_specialty || typeof required_specialty !== "string") {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'required_specialty' is required.",
    });
  }

  if (!clinical_summary || typeof clinical_summary !== "string") {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'clinical_summary' is required.",
    });
  }

  if (priority && !VALID_PRIORITIES.includes(priority.toLowerCase())) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'priority' must be one of [${VALID_PRIORITIES.join(", ")}].`,
    });
  }

  next();
};

/**
 * Validate Referral Status Update & Events
 */
const validateReferralUpdate = (req, res, next) => {
  const { status, stage, priority } = req.body;
  const target = stage || status;

  if (target && !VALID_REFERRAL_STATUSES.includes(target.toLowerCase())) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: Status must be one of [${VALID_REFERRAL_STATUSES.join(", ")}].`,
    });
  }

  if (priority && !VALID_PRIORITIES.includes(priority.toLowerCase())) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'priority' must be one of [${VALID_PRIORITIES.join(", ")}].`,
    });
  }

  next();
};

/**
 * Validate Referral Event Append
 */
const validateReferralEventCreate = (req, res, next) => {
  const { stage, event_title } = req.body;

  if (!stage || !VALID_REFERRAL_STATUSES.includes(stage.toLowerCase())) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'stage' is required and must be one of [${VALID_REFERRAL_STATUSES.join(", ")}].`,
    });
  }

  if (!event_title || typeof event_title !== "string" || event_title.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'event_title' is required.",
    });
  }

  next();
};

/**
 * Validate Transport Assignment
 */
const validateTransportAssign = (req, res, next) => {
  const { ngo_id } = req.body;

  if (!ngo_id || !isValidId(ngo_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'ngo_id' is required and must be a valid ID.",
    });
  }

  next();
};

/**
 * Validate Follow-Up Scheduling
 */
const validateFollowUpSchedule = (req, res, next) => {
  const { follow_up_date } = req.body;

  if (follow_up_date && isNaN(new Date(follow_up_date).getTime())) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'follow_up_date' must be a valid date.",
    });
  }

  next();
};

module.exports = {
  validateReferralCreate,
  validateReferralUpdate,
  validateReferralEventCreate,
  validateTransportAssign,
  validateFollowUpSchedule,
};
