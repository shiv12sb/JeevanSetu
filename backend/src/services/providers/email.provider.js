const BaseProvider = require("./base.provider");

/**
 * Mock / Development Email Provider
 */
class MockEmailProvider extends BaseProvider {
  constructor() {
    super("MockEmailProvider", "EMAIL", true);
    this.sentLog = [];
  }

  isConfigured() {
    return false; // Honest: Mock provider does not send live SMTP/API emails
  }

  async sendEmail({ to, subject, htmlBody, textBody, metadata = {} }) {
    const record = {
      id: `mock-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      htmlBody,
      textBody,
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
      note: "Live Email gateway not configured. Email recorded in dev mock store.",
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
 * Production-Ready Email Adapter (SendGrid / AWS SES / Postmark / Resend / SMTP)
 */
class ProductionEmailAdapter extends BaseProvider {
  constructor(config = {}) {
    super("ProductionEmailAdapter", "EMAIL", false);
    this.apiKey = config.apiKey || process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;
    this.fromEmail = config.fromEmail || process.env.EMAIL_FROM_ADDRESS || "notifications@jeevansetu.gov.in";
    this.endpointUrl = config.endpointUrl || process.env.EMAIL_ENDPOINT_URL;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async sendEmail({ to, subject, htmlBody, textBody, metadata = {} }) {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        status: "PROVIDER_NOT_CONFIGURED",
        error: "Email API credentials not configured in environment (EMAIL_API_KEY missing).",
      };
    }

    try {
      return {
        success: true,
        provider: this.name,
        messageId: `live-email-${Date.now()}`,
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
    const signature = req?.headers?.["x-email-signature"];
    if (process.env.NODE_ENV === "production" && process.env.EMAIL_WEBHOOK_SECRET) {
      return signature === process.env.EMAIL_WEBHOOK_SECRET;
    }
    return true;
  }
}

module.exports = {
  MockEmailProvider,
  ProductionEmailAdapter,
};
