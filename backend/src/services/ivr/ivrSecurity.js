/**
 * IVR Security, Replay Protection, Rate Limiting & PII Masking Utilities
 */

const MAX_CALLS_PER_WINDOW = 30; // Max requests per minute per phone/IP
const RATE_WINDOW_MS = 60 * 1000;
const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000; // 5 minutes max timestamp drift (Replay protection)

const rateLimitStore = new Map();
const processedRequestTokens = new Set(); // Replay attack token cache

/**
 * Mask phone number for logging and public display (+91 98XXX XXXXX)
 */
const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== "string") return "+91 XXXXX XXXXX";
  const clean = phone.trim();
  if (clean.length < 6) return "[PROTECTED]";
  return `${clean.substring(0, 5)} ${"X".repeat(Math.max(0, clean.length - 8))} ${clean.slice(-2)}`.trim();
};

/**
 * Rate Limiting check per caller / IP
 */
const checkRateLimit = (key) => {
  const now = Date.now();
  const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + RATE_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + RATE_WINDOW_MS;
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: MAX_CALLS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_CALLS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetInSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
  return { allowed: true, remaining: MAX_CALLS_PER_WINDOW - entry.count };
};

/**
 * Replay protection check against webhook timestamp and request nonce
 */
const verifyReplayProtection = ({ timestamp, nonce }) => {
  if (!timestamp) return { valid: true }; // Permissive in dev if timestamp omitted
  
  const reqTime = new Date(timestamp).getTime();
  const now = Date.now();

  if (isNaN(reqTime) || Math.abs(now - reqTime) > MAX_TIMESTAMP_DRIFT_MS) {
    return { valid: false, reason: "Webhook timestamp expired or outside permitted drift window." };
  }

  if (nonce) {
    if (processedRequestTokens.has(nonce)) {
      return { valid: false, reason: "Replay attack detected: Nonce token already processed." };
    }
    processedRequestTokens.add(nonce);
    // Cleanup nonce after 10 minutes
    const timer = setTimeout(() => processedRequestTokens.delete(nonce), 10 * 60 * 1000);
    if (timer.unref) timer.unref();
  }

  return { valid: true };
};

module.exports = {
  maskPhoneNumber,
  checkRateLimit,
  verifyReplayProtection,
};
