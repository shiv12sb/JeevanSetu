const { sendError } = require("../utils/response");
const logger = require("../utils/logger");

/**
 * Classify standard error categories
 */
function classifyErrorCode(err, statusCode) {
  if (err.code && typeof err.code === "string" && err.code.length < 40) {
    return err.code;
  }
  if (statusCode === 400) return "VALIDATION_ERROR";
  if (statusCode === 401) return "AUTHENTICATION_ERROR";
  if (statusCode === 403) return "AUTHORIZATION_ERROR";
  if (statusCode === 404) return "NOT_FOUND";
  if (statusCode === 429) return "RATE_LIMITED";
  if (statusCode === 504 || err.message?.toLowerCase().includes("timeout")) return "TIMEOUT";
  if (err.message?.toLowerCase().includes("database") || err.message?.toLowerCase().includes("postgres")) return "DATABASE_ERROR";
  if (err.message?.toLowerCase().includes("provider") || err.message?.toLowerCase().includes("gateway")) return "EXTERNAL_PROVIDER_ERROR";
  if (err.message?.toLowerCase().includes("ai") || err.message?.toLowerCase().includes("groq") || err.message?.toLowerCase().includes("openai")) return "AI_PROVIDER_ERROR";
  return "INTERNAL_ERROR";
}

/**
 * Centralized Production-Safe Error-Handling Middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const requestId = req?.id || req?.requestId || "unknown-req";
  const errorCode = classifyErrorCode(err, statusCode);
  const message = err.message || "Internal server error occurred.";

  // Log structured error internally
  logger.error(`API_ERROR [${errorCode}]: ${req.method} ${req.originalUrl} - ${message}`, {
    request_id: requestId,
    status_code: statusCode,
    error_code: errorCode,
    route: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  // Record error in metrics service
  try {
    const metricsService = require("../services/observability/metrics.service");
    metricsService.recordError({
      request_id: requestId,
      error_code: errorCode,
      status_code: statusCode,
      route: req.originalUrl,
      method: req.method,
      message,
    });
  } catch (e) {}

  return sendError(res, {
    statusCode,
    message: statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred. Please contact system support."
      : message,
    errorCode,
    requestId,
    error: err,
  });
}

module.exports = errorHandler;
