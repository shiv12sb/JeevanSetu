const BaseProvider = require("./base.provider");

/**
 * Mock / Simulation Telephony Provider (Active default)
 */
class MockTelephonyProvider extends BaseProvider {
  constructor() {
    super("MockTelephonyProvider", "TELEPHONY", true);
  }

  isConfigured() {
    return false; // Honest: Mock provider does not initiate live PSTN phone calls
  }

  buildVoiceResponse({ promptText, gather = null, hangup = false }) {
    return {
      provider: this.name,
      promptText,
      gather: gather
        ? {
            numDigits: gather.numDigits || 1,
            timeoutSeconds: gather.timeout || 5,
            actionUrl: gather.actionUrl || "/api/ivr/interact",
          }
        : null,
      hangup,
      xmlResponse: this.generateVoiceXml(promptText, gather, hangup),
    };
  }

  generateVoiceXml(promptText, gather, hangup) {
    if (gather) {
      return `<?xml version="1.0" encoding="UTF-8"?><Response><Gather numDigits="${gather.numDigits || 1}" timeout="${gather.timeout || 5}" action="${gather.actionUrl || "/api/ivr/interact"}"><Say>${promptText}</Say></Gather><Say>We did not receive your input.</Say></Response>`;
    }
    if (hangup) {
      return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${promptText}</Say><Hangup/></Response>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${promptText}</Say></Response>`;
  }

  verifyWebhookSignature(req) {
    const sig = req?.headers?.["x-ivr-signature"] || req?.headers?.["x-twilio-signature"];
    if (process.env.NODE_ENV === "production" && process.env.IVR_WEBHOOK_SECRET) {
      return sig === process.env.IVR_WEBHOOK_SECRET;
    }
    return true;
  }
}

/**
 * Production Telephony Adapter (Exotel / Twilio / Plivo / Airtel IQ)
 */
class ProductionTelephonyAdapter extends BaseProvider {
  constructor(config = {}) {
    super("ProductionTelephonyAdapter", "TELEPHONY", false);
    this.accountSid = config.accountSid || process.env.IVR_PROVIDER_ACCOUNT_SID || process.env.TELEPHONY_ACCOUNT_SID;
    this.authToken = config.authToken || process.env.IVR_PROVIDER_AUTH_TOKEN || process.env.TELEPHONY_AUTH_TOKEN;
  }

  isConfigured() {
    return Boolean(this.accountSid && this.authToken);
  }

  buildVoiceResponse({ promptText, gather = null, hangup = false, language = "hi-IN" }) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?><Response>`;
    if (gather) {
      xml += `<Gather numDigits="${gather.numDigits || 1}" timeout="${gather.timeout || 5}" action="${gather.actionUrl || "/api/ivr/interact"}" method="POST">`;
      xml += `<Say language="${language}">${promptText}</Say>`;
      xml += `</Gather>`;
    } else {
      xml += `<Say language="${language}">${promptText}</Say>`;
    }
    if (hangup) {
      xml += `<Hangup/>`;
    }
    xml += `</Response>`;

    return {
      provider: this.name,
      promptText,
      xmlResponse: xml,
      hangup,
    };
  }

  verifyWebhookSignature(req) {
    if (!this.authToken) return true;
    const signature = req?.headers?.["x-ivr-signature"] || req?.headers?.["x-twilio-signature"];
    return Boolean(signature);
  }
}

module.exports = {
  MockTelephonyProvider,
  ProductionTelephonyAdapter,
};
