const env = require("../config/env");

/**
 * Send standard success JSON response
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message]
 * @param {*} [options.data]
 * @param {Object} [options.metadata]
 */
function sendSuccess(res, { statusCode = 200, message, data, metadata } = {}) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (metadata !== undefined) payload.metadata = metadata;
  return res.status(statusCode).json(payload);
}

/**
 * Send standard, production-safe error JSON response
 * @param {import('express').Response} res
 * @param {Object} options
 * @param {number} [options.statusCode=500]
 * @param {string} options.message
 * @param {string} [options.errorCode='INTERNAL_ERROR']
 * @param {string} [options.requestId]
 * @param {*} [options.error]
 */
function sendError(res, {
  statusCode = 500,
  message = "Internal server error",
  errorCode = "INTERNAL_ERROR",
  requestId = null,
  error = null,
} = {}) {
  const reqId = requestId || res.getHeader?.("X-Request-Id") || null;

  const payload = {
    success: false,
    message,
    error: {
      code: errorCode,
      status: statusCode,
      request_id: reqId,
    },
  };

  // In development only, attach diagnostic info without exposing real production database secrets
  if (env.isDevelopment && error) {
    payload.debug = {
      message: error.message,
      stack: error.stack,
    };
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendError,
};
