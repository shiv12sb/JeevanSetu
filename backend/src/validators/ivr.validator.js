/**
 * IVR Request Input Validators
 */

const { sendError } = require("../utils/response");

const validateSessionInit = (req, res, next) => {
  const { callerPhone, language } = req.body;

  if (language && !["hi", "mr", "en"].includes(language.toLowerCase())) {
    return sendError(res, {
      statusCode: 400,
      message: "Invalid language. Allowed languages: 'hi', 'mr', 'en'.",
    });
  }

  next();
};

const validateInteraction = (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return sendError(res, {
      statusCode: 400,
      message: "sessionId is required to process IVR interaction.",
    });
  }

  next();
};

const validateCallbackUpdate = (req, res, next) => {
  const { status } = req.body;
  const ALLOWED = ["pending", "contacted", "resolved"];

  if (status && !ALLOWED.includes(status)) {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid callback status '${status}'. Must be one of [${ALLOWED.join(", ")}].`,
    });
  }

  next();
};

module.exports = {
  validateSessionInit,
  validateInteraction,
  validateCallbackUpdate,
};
