const { sendError } = require("../utils/response");
const metricsService = require("../services/observability/metrics.service");

/**
 * Lightweight in-memory rate limiter with sliding window
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (e.g. 60000 = 1 min)
 * @param {number} options.max - Max allowed requests per IP in windowMs
 * @param {string} [options.message] - Custom rejection message
 * @param {string} [options.endpointType] - Classification tag for metrics
 */
function createRateLimiter({
  windowMs = 60 * 1000,
  max = 100,
  message = "Too many requests. Please try again later.",
  endpointType = "GENERAL_API",
} = {}) {
  const ipHits = new Map(); // ip -> [timestamps]

  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
    const now = Date.now();

    let timestamps = ipHits.get(ip) || [];
    // Filter out timestamps outside window
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= max) {
      metricsService.recordSecurityEvent({
        type: "RATE_LIMIT_EXCEEDED",
        sourceIp: ip,
        details: `Exceeded ${max} reqs per ${Math.round(windowMs / 1000)}s on ${req.method} ${req.originalUrl} (${endpointType})`,
      });

      res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
      return sendError(res, {
        statusCode: 429,
        errorCode: "RATE_LIMITED",
        message,
      });
    }

    timestamps.push(now);
    ipHits.set(ip, timestamps);

    // Occasional cleanup of stale IPs
    if (ipHits.size > 2000 && Math.random() < 0.05) {
      for (const [k, v] of ipHits.entries()) {
        const active = v.filter((t) => now - t < windowMs);
        if (active.length === 0) ipHits.delete(k);
        else ipHits.set(k, active);
      }
    }

    next();
  };
}

// Pre-configured limiters for different tiers
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // 30 login/auth attempts per 15 min
  message: "Too many authentication attempts. Please try again after 15 minutes.",
  endpointType: "AUTH_API",
});

const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 20, // 20 AI prompts per min
  message: "AI analysis request quota exceeded. Please wait a moment.",
  endpointType: "AI_API",
});

const feedbackLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 15, // 15 feedback submissions per min
  message: "Too many feedback submissions. Please wait before submitting more feedback.",
  endpointType: "FEEDBACK_API",
});

const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 120, // 120 webhook triggers per min
  message: "Webhook rate limit exceeded.",
  endpointType: "WEBHOOK_API",
});

const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300, // 300 requests per min for standard API traffic
  message: "Request rate limit exceeded.",
  endpointType: "GENERAL_API",
});

module.exports = {
  createRateLimiter,
  authLimiter,
  aiLimiter,
  feedbackLimiter,
  webhookLimiter,
  generalApiLimiter,
};
