/**
 * Telephony / IVR Provider Abstraction Layer
 * Supports mock simulation provider and production gateway adapters (e.g. Exotel / Twilio / Plivo).
 */

class BaseIVRProvider {
  constructor(name = "BaseIVRProvider") {
    this.name = name;
  }

  isLiveTelephonyConfigured() {
    return false;
  }

  /**
   * Build standardized XML/JSON voice response for telephony webhook
   */
  buildVoiceResponse({ promptText, gather = null, hangup = false }) {
    throw new Error("buildVoiceResponse must be implemented by concrete provider");
  }

  /**
   * Verify provider webhook signature
   */
  verifyWebhookSignature(req) {
    return true;
  }
}

/**
 * Mock / Simulation Telephony Provider (Active default)
 */
class MockTelephonyProvider extends BaseIVRProvider {
  constructor() {
    super("MockTelephonyProvider");
  }

  isLiveTelephonyConfigured() {
    // Honest declaration: Simulation provider does not make live PSTN phone calls
    return false;
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
    // Validates mock or development signature header if present
    const sig = req?.headers?.["x-ivr-signature"] || req?.headers?.["x-twilio-signature"];
    if (process.env.NODE_ENV === "production" && process.env.IVR_WEBHOOK_SECRET) {
      return sig === process.env.IVR_WEBHOOK_SECRET;
    }
    return true;
  }
}

/**
 * Twilio / Exotel Production Ready Adapter
 */
class ProductionTelephonyAdapter extends BaseIVRProvider {
  constructor(config = {}) {
    super("ProductionTelephonyAdapter");
    this.accountSid = config.accountSid || process.env.IVR_PROVIDER_ACCOUNT_SID;
    this.authToken = config.authToken || process.env.IVR_PROVIDER_AUTH_TOKEN;
  }

  isLiveTelephonyConfigured() {
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
  BaseIVRProvider,
  MockTelephonyProvider,
  ProductionTelephonyAdapter,
};
