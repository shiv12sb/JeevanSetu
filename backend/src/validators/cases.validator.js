const { sendError } = require("../utils/response");
const { UUID_REGEX } = require("./common.validator");

const VALID_URGENCIES = ["routine", "urgent", "emergency"];
const VALID_STATUSES = ["open", "referred", "in_treatment", "resolved", "closed"];
const VALID_CAREGIVER_MODES = ["myself", "family", "dependent"];

/**
 * Validate Health Case Creation Request
 */
const validateCaseCreate = (req, res, next) => {
  const { primary_concern, category, urgency, caregiver_mode, initial_phc_id, patient_id } = req.body;

  if (!primary_concern || typeof primary_concern !== "string" || primary_concern.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'primary_concern' is required.",
    });
  }

  if (!category || typeof category !== "string" || category.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'category' is required.",
    });
  }

  if (urgency && !VALID_URGENCIES.includes(urgency)) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'urgency' must be one of [${VALID_URGENCIES.join(", ")}].`,
    });
  }

  if (caregiver_mode && !VALID_CAREGIVER_MODES.includes(caregiver_mode)) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'caregiver_mode' must be one of [${VALID_CAREGIVER_MODES.join(", ")}].`,
    });
  }

  if (initial_phc_id && !UUID_REGEX.test(initial_phc_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'initial_phc_id' must be a valid UUID.",
    });
  }

  if (patient_id && !UUID_REGEX.test(patient_id)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'patient_id' must be a valid UUID.",
    });
  }

  next();
};

/**
 * Validate Health Case Update Request
 */
const validateCaseUpdate = (req, res, next) => {
  const { status, urgency } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'status' must be one of [${VALID_STATUSES.join(", ")}].`,
    });
  }

  if (urgency && !VALID_URGENCIES.includes(urgency)) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'urgency' must be one of [${VALID_URGENCIES.join(", ")}].`,
    });
  }

  next();
};

/**
 * Validate Vitals Recording Request
 */
const validateVitalsCreate = (req, res, next) => {
  const { systolic_bp, diastolic_bp, blood_sugar, hemoglobin, temperature, pulse_rate } = req.body;

  if (systolic_bp !== undefined && (isNaN(systolic_bp) || systolic_bp < 40 || systolic_bp > 300)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'systolic_bp' must be a number between 40 and 300.",
    });
  }

  if (diastolic_bp !== undefined && (isNaN(diastolic_bp) || diastolic_bp < 20 || diastolic_bp > 200)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'diastolic_bp' must be a number between 20 and 200.",
    });
  }

  if (pulse_rate !== undefined && (isNaN(pulse_rate) || pulse_rate < 30 || pulse_rate > 250)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'pulse_rate' must be a number between 30 and 250.",
    });
  }

  if (temperature !== undefined && (isNaN(temperature) || temperature < 85 || temperature > 115)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'temperature' must be a number between 85 and 115 (°F).",
    });
  }

  next();
};

module.exports = {
  validateCaseCreate,
  validateCaseUpdate,
  validateVitalsCreate,
};
