/**
 * IVR Routes
 */

const express = require("express");
const {
  handleWebhook,
  createSession,
  processInteraction,
  getLocalizedContent,
  getAnalytics,
  getFollowUpRequests,
  updateFollowUpRequest,
} = require("../controllers/ivr.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const {
  validateSessionInit,
  validateInteraction,
  validateCallbackUpdate,
} = require("../validators/ivr.validator");

const router = express.Router();

// Public / Telephony Provider Webhook
router.post("/webhook", handleWebhook);

// Session Simulator / Client interaction endpoints
router.post("/session", validateSessionInit, createSession);
router.post("/interact", validateInteraction, processInteraction);
router.get("/content/:language", getLocalizedContent);

// Protected Staff & Admin Endpoints
router.get(
  "/analytics",
  requireAuth,
  requireRole("district_admin", "doctor", "phc_staff"),
  getAnalytics
);

router.get(
  "/followups",
  requireAuth,
  requireRole("district_admin", "doctor", "phc_staff"),
  getFollowUpRequests
);

router.patch(
  "/followups/:id",
  requireAuth,
  requireRole("district_admin", "doctor", "phc_staff"),
  validateCallbackUpdate,
  updateFollowUpRequest
);

module.exports = router;
