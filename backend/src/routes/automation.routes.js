const express = require("express");
const {
  getAutomationHealth,
  getOutboxMetrics,
  getOutboxEvents,
  retryOutboxEvent,
  triggerWorkerCycle,
  handleInboundWebhook,
  getUserPreferences,
  updateUserPreferences,
} = require("../controllers/automation.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { requireWebhookAuth } = require("../middleware/webhookAuth.middleware");

const router = express.Router();

// GET /api/automation/health - Public health check for providers (No secrets exposed)
router.get("/health", getAutomationHealth);

// POST /api/automation/webhook - Secure Inbound Webhook for n8n Callbacks
router.post("/webhook", requireWebhookAuth, handleInboundWebhook);

// GET /api/automation/preferences - Get User Notification Preferences
router.get("/preferences", requireAuth, getUserPreferences);

// PATCH /api/automation/preferences - Update User Notification Preferences
router.patch("/preferences", requireAuth, updateUserPreferences);

// GET /api/automation/metrics - Outbox Metrics (District Admin only)
router.get("/metrics", requireAuth, requireRole("district_admin"), getOutboxMetrics);

// GET /api/automation/events - Outbox Events Ledger (District Admin only)
router.get("/events", requireAuth, requireRole("district_admin"), getOutboxEvents);

// POST /api/automation/events/:id/retry - Manual Retry for Failed Outbox Events (District Admin only)
router.post("/events/:id/retry", requireAuth, requireRole("district_admin"), retryOutboxEvent);

// POST /api/automation/events/trigger-worker - Trigger Outbox Worker Processing Cycle
router.post("/events/trigger-worker", requireAuth, requireRole("district_admin"), triggerWorkerCycle);

module.exports = router;
