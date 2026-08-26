const crypto = require("crypto");

/**
 * Request ID Middleware
 * - Preserves existing safe x-request-id or generates a cryptographically unique one
 * - Sets X-Request-Id header on incoming request and outgoing response
 */
function requestIdMiddleware(req, res, next) {
  const incomingId = req.headers["x-request-id"];
  
  // Validate incoming ID (must be alphanumeric/hyphen string, max 64 chars)
  const isValid = typeof incomingId === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(incomingId);
  const requestId = isValid ? incomingId : `req-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  req.id = requestId;
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
}

module.exports = requestIdMiddleware;
