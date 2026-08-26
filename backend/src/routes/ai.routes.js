const express = require("express");
const { handleChat } = require("../controllers/ai.controller");
const { optionalAuth } = require("../middleware/auth.middleware");
const { validateChatRequest } = require("../validators/ai.validator");
const { sendError } = require("../utils/response");

const router = express.Router();

/**
 * In-Memory Rate Limiter for AI Chat (20 requests per minute per user/IP)
 */
const rateLimitMap = new Map();

const aiRateLimiter = (req, res, next) => {
  const identifier = req.user?.profileId || req.ip || "global";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20;

  const clientData = rateLimitMap.get(identifier) || { count: 0, startTime: now };

  if (now - clientData.startTime > windowMs) {
    clientData.count = 1;
    clientData.startTime = now;
  } else {
    clientData.count++;
  }

  rateLimitMap.set(identifier, clientData);

  // Periodically clean up stale rate limit entries
  if (rateLimitMap.size > 1000) {
    for (const [key, data] of rateLimitMap.entries()) {
      if (now - data.startTime > windowMs) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (clientData.count > maxRequests) {
    return sendError(res, {
      statusCode: 429,
      message: "Too many AI assistant requests. Please wait a moment before sending another message.",
    });
  }

  next();
};

// POST /api/ai/chat - Safe Grounded Conversational AI Assistant
router.post(
  "/chat",
  optionalAuth,
  aiRateLimiter,
  validateChatRequest,
  handleChat
);

module.exports = router;
