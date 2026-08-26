const crypto = require("crypto");
const { sendError } = require("../utils/response");

// In-memory replay cache with 10-minute TTL for fast lookup
const nonceCache = new Map();

// Periodic cleanup of expired nonces (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of nonceCache.entries()) {
    if (expiry <= now) {
      nonceCache.delete(nonce);
    }
  }
}, 5 * 60 * 1000).unref?.();

/**
 * Webhook Authentication & Replay Protection Middleware
 * - Verifies HMAC SHA-256 signature
 * - Validates timestamp within 5 minutes (prevents stale/delayed replay)
 * - Replay protection: Rejects duplicate nonces or event IDs within cache window
 */
const requireWebhookAuth = (req, res, next) => {
  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];
  const nonce = req.headers["x-event-id"] || req.headers["x-nonce"] || req.headers["x-idempotency-key"];

  // 1. Check presence of signature and timestamp
  if (!signature || !timestamp) {
    return sendError(res, {
      statusCode: 401,
      message: "Unauthorized webhook request: 'x-webhook-signature' and 'x-webhook-timestamp' headers are required.",
    });
  }

  // 2. Validate timestamp drift (Max 5 minutes = 300,000 ms)
  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime) || Math.abs(Date.now() - reqTime) > 300000) {
    return sendError(res, {
      statusCode: 401,
      message: "Webhook rejected: Request timestamp is stale or clock drift exceeds 5 minutes.",
    });
  }

  // 3. Replay Protection: Check if nonce was already received
  if (nonce) {
    if (nonceCache.has(nonce)) {
      return sendError(res, {
        statusCode: 409,
        message: `Webhook replay detected: Event or nonce '${nonce}' has already been processed.`,
      });
    }
    // Record nonce with 10-minute expiry (600,000 ms)
    nonceCache.set(nonce, Date.now() + 600000);
  }

  // 4. Verify HMAC SHA-256 signature
  const secret = process.env.N8N_WEBHOOK_SECRET || "jeevansetu-n8n-secret-default";
  const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});

  try {
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${bodyStr}`)
      .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return sendError(res, {
        statusCode: 403,
        message: "Forbidden: Webhook signature mismatch. Invalid secret or tampered payload.",
      });
    }
  } catch (err) {
    return sendError(res, {
      statusCode: 403,
      message: `Webhook signature verification failed: ${err.message}`,
    });
  }

  next();
};

module.exports = {
  requireWebhookAuth,
};
