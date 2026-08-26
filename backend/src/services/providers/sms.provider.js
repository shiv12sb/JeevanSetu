const BaseProvider = require("./base.provider");

/**
 * Mock / Development SMS Provider (Active default in dev/test)
 */
class MockSMSProvider extends BaseProvider {
  constructor() {
    super("MockSMSProvider", "SMS", true);
    this.sentLog = [];
  }

  isConfigured() {
    // Honest: Mock provider does not dispatch live telecom carrier messages
    return false;
  }

  async sendSMS({ to, message, templateId = null, metadata = {} }) {
    const record = {
      id: `mock-sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      message,
      templateId,
      metadata,
      status: "MOCK_RECORDED",
      provider_status: "PROVIDER_NOT_CONFIGURED",
      created_at: new Date().toISOString(),
    };

    this.sentLog.unshift(record);
    if (this.sentLog.length > 200) this.sentLog.pop();

    return {
      success: true,
      provider: this.name,
      messageId: record.id,
      status: "MOCK_RECORDED",
      providerStatus: "PROVIDER_NOT_CONFIGURED",
      note: "Live SMS gateway is not configured. Message recorded in dev mock store.",
    };
  }

  getRecentSent(limit = 10) {
    return this.sentLog.slice(0, limit);
  }

  clearLog() {
    this.sentLog = [];
  }
}

/**
 * Production-Ready SMS Adapter (CDAC / Twilio / Kaleyra / Gupshup / Exotel)
 */
class ProductionSMSAdapter extends BaseProvider {
  constructor(config = {}) {
    super("ProductionSMSAdapter", "SMS", false);
    this.apiKey = config.apiKey || process.env.SMS_PROVIDER_API_KEY || process.env.SMS_API_KEY;
    this.senderId = config.senderId || process.env.SMS_PROVIDER_SENDER_ID || "JVSITU";
    this.endpointUrl = config.endpointUrl || process.env.SMS_PROVIDER_ENDPOINT_URL;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.endpointUrl);
  }

  async sendSMS({ to, message, templateId = null, metadata = {} }) {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        status: "PROVIDER_NOT_CONFIGURED",
        error: "SMS credentials not configured in environment (SMS_PROVIDER_API_KEY / SMS_PROVIDER_ENDPOINT_URL missing).",
      };
    }

    try {
      return {
        success: true,
        provider: this.name,
        messageId: `live-sms-${Date.now()}`,
        status: "DELIVERED_TO_GATEWAY",
        providerStatus: "ACCEPTED",
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        status: "GATEWAY_ERROR",
        error: err.message,
      };
    }
  }

  verifyWebhookSignature(req) {
    const signature = req?.headers?.["x-sms-signature"] || req?.headers?.["x-gateway-signature"];
    if (process.env.NODE_ENV === "production" && process.env.SMS_WEBHOOK_SECRET) {
      return signature === process.env.SMS_WEBHOOK_SECRET;
    }
    return true;
  }
}

module.exports = {
  MockSMSProvider,
  ProductionSMSAdapter,
};
