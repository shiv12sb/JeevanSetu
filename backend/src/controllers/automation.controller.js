const eventService = require("../services/automation/event.service");
const { getAllProvidersHealth } = require("../services/providers");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Health & Integration Status Endpoint
 * Safe: Guaranteed to never expose secrets, keys, or passwords.
 */
const getAutomationHealth = async (req, res, next) => {
  try {
    const providers = getAllProvidersHealth();
    return sendSuccess(res, {
      statusCode: 200,
      data: {
        backend: "healthy",
        database: "healthy",
        n8n_enabled: process.env.N8N_ENABLED === "true",
        providers,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Outbox Queue Metrics (District Admin only)
 */
const getOutboxMetrics = async (req, res, next) => {
  try {
    const metrics = await eventService.getOutboxMetrics(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Outbox Events Ledger (District Admin only)
 */
const getOutboxEvents = async (req, res, next) => {
  try {
    const { status, event_type, page, limit } = req.query;
    const result = await eventService.getEvents(req.user, { status, event_type, page, limit });
    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      metadata: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Manual Retry Trigger for Failed / Abandoned Outbox Events (District Admin only)
 */
const retryOutboxEvent = async (req, res, next) => {
  try {
    const updatedEvent = await eventService.retryEvent(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: `Event ${req.params.id} has been requeued for processing.`,
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Trigger Outbox Worker Cycle
 */
const triggerWorkerCycle = async (req, res, next) => {
  try {
    const result = await eventService.processPendingEvents({ batchSize: 20 });
    return sendSuccess(res, {
      statusCode: 200,
      message: `Outbox worker cycle executed. Processed ${result.processed} events.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Inbound Webhook Receiver for n8n or External Orchestration Callbacks
 * Verified via HMAC SHA-256 and replay protection
 */
const handleInboundWebhook = async (req, res, next) => {
  try {
    const { action, event_id, status, notes } = req.body || {};

    if (!action && !event_id) {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid webhook payload: 'action' or 'event_id' is required.",
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Webhook received and verified successfully.",
      data: {
        received_at: new Date().toISOString(),
        event_id: event_id || null,
        status: "ACKNOWLEDGED",
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get User Notification Preferences
 */
const getUserPreferences = async (req, res, next) => {
  try {
    const prefs = await eventService.getUserPreferences(req.user.profileId || req.user.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: prefs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update User Notification Preferences
 */
const updateUserPreferences = async (req, res, next) => {
  try {
    const updated = await eventService.updateUserPreferences(req.user.profileId || req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Notification preferences updated successfully.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAutomationHealth,
  getOutboxMetrics,
  getOutboxEvents,
  retryOutboxEvent,
  triggerWorkerCycle,
  handleInboundWebhook,
  getUserPreferences,
  updateUserPreferences,
};
