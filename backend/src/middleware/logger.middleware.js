const logger = require("../utils/logger");

const SLOW_REQUEST_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || "1000", 10);

/**
 * Structured HTTP Request Logger Middleware
 * Integrates Request ID, latency tracking, and metrics collection
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const requestId = req.id || req.requestId || "unknown-req";
    const userRole = req.user?.role || "anonymous";

    const logMeta = {
      request_id: requestId,
      method,
      route: originalUrl,
      status_code: statusCode,
      duration_ms: durationMs,
      user_role: userRole,
    };

    if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
      logMeta.is_slow_request = true;
      logger.warn(`SLOW_API_REQUEST: ${method} ${originalUrl} took ${durationMs}ms`, logMeta);
    } else if (statusCode >= 500) {
      logger.error(`HTTP_SERVER_ERROR: ${method} ${originalUrl} returned ${statusCode}`, logMeta);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP_CLIENT_ERROR: ${method} ${originalUrl} returned ${statusCode}`, logMeta);
    } else {
      logger.info(`HTTP_REQUEST: ${method} ${originalUrl} ${statusCode} - ${durationMs}ms`, logMeta);
    }

    // Record in memory metrics service asynchronously
    try {
      const metricsService = require("../services/observability/metrics.service");
      metricsService.recordHttpRequest({
        method,
        route: originalUrl,
        statusCode,
        durationMs,
        isSlow: durationMs >= SLOW_REQUEST_THRESHOLD_MS,
      });
    } catch (e) {}
  });

  next();
}

module.exports = requestLogger;
