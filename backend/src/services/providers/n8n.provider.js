const crypto = require("crypto");
const BaseProvider = require("./base.provider");

/**
 * n8n Automation & Integration Orchestrator Adapter
 * Invariant: JeevanSetu backend is the single source of truth.
 * n8n is an OPTIONAL orchestration layer.
 */
class N8NOrchestrationAdapter extends BaseProvider {
  constructor(config = {}) {
    super("N8NOrchestrationAdapter", "N8N", false);
    this.webhookUrl = config.webhookUrl || process.env.N8N_WEBHOOK_URL;
    this.webhookSecret = config.webhookSecret || process.env.N8N_WEBHOOK_SECRET || "jeevansetu-n8n-secret-default";
    this.isEnabled = process.env.N8N_ENABLED === "true";
  }

  isConfigured() {
    return Boolean(this.isEnabled && this.webhookUrl);
  }

  /**
   * Dispatch structured, PII-minimized event to n8n workflow
   * @param {Object} params
   * @param {string} params.eventType - e.g. 'REFERRAL_CREATED'
   * @param {string} params.eventId - Unique outbox event UUID
   * @param {Object} params.payload - Sanitized minimal payload
   * @param {string} [params.workflowId] - Target workflow identifier
   * @returns {Promise<Object>}
   */
  async dispatchEvent({ eventType, eventId, payload = {}, workflowId = null }) {
    // If n8n is disabled or unconfigured in development, return mock dispatched status
    if (!this.isConfigured()) {
      return {
        success: true,
        provider: this.name,
        eventId,
        eventType,
        workflowId: workflowId || "01_notification_dispatch",
        status: "MOCK_DISPATCHED",
        providerStatus: "PROVIDER_NOT_CONFIGURED",
        note: "n8n is disabled or unconfigured (N8N_ENABLED != true). Backend handled event internally.",
      };
    }

    const timestamp = Date.now().toString();
    const payloadStr = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(`${timestamp}.${payloadStr}`)
      .digest("hex");

    try {
      // Live HTTP POST dispatch with timeout
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": signature,
          "x-webhook-timestamp": timestamp,
          "x-event-id": eventId,
          "x-event-type": eventType,
        },
        body: payloadStr,
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        return {
          success: false,
          provider: this.name,
          eventId,
          status: "N8N_HTTP_ERROR",
          responseCode: response.status,
          error: `n8n returned HTTP status ${response.status}`,
        };
      }

      return {
        success: true,
        provider: this.name,
        eventId,
        eventType,
        status: "DELIVERED_TO_N8N",
        providerStatus: "ACCEPTED",
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        eventId,
        status: "N8N_CONNECTION_ERROR",
        error: err.message,
      };
    }
  }

  /**
   * Verify inbound webhook signature from n8n callbacks
   */
  verifyInboundSignature(req) {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    if (!signature || !timestamp) {
      return false;
    }

    // Check clock drift (max 5 minutes = 300,000 ms)
    const reqTime = parseInt(timestamp, 10);
    if (isNaN(reqTime) || Math.abs(Date.now() - reqTime) > 300000) {
      return false;
    }

    const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const expectedSig = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(`${timestamp}.${bodyStr}`)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  }
}

module.exports = N8NOrchestrationAdapter;
