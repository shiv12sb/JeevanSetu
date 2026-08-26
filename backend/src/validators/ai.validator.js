const { sendError } = require("../utils/response");

const VALID_LANGUAGES = ["en", "hi", "mr"];

/**
 * Validate AI Chat Request Payload & Limits
 */
const validateChatRequest = (req, res, next) => {
  const { message, language, conversationHistory } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'message' is required and must be a non-empty string.",
    });
  }

  // Cost & Abuse Limit: Max 1,000 characters per message
  if (message.length > 1000) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: Message exceeds maximum allowed length of 1,000 characters.",
    });
  }

  if (language && !VALID_LANGUAGES.includes(language)) {
    return sendError(res, {
      statusCode: 400,
      message: `Validation error: 'language' must be one of [${VALID_LANGUAGES.join(", ")}].`,
    });
  }

  if (conversationHistory && !Array.isArray(conversationHistory)) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation error: 'conversationHistory' must be an array of message turns.",
    });
  }

  next();
};

module.exports = {
  validateChatRequest,
};
