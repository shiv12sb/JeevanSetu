/**
 * ==============================================================================
 * JEEVANSETU PHASE 26 — TRANSACTIONAL SMS SERVICE
 * ==============================================================================
 * Dispatches non-clinical transactional SMS messages (e.g. feedback confirmations,
 * missed-call callback links, tracking tokens).
 * Strictly guards against leaking sensitive medical information or diagnoses.
 */

const { MockSMSProvider, ProductionSMSAdapter } = require("./sms.provider");

class SMSService {
  constructor() {
    if (process.env.SMS_PROVIDER_API_KEY && process.env.SMS_PROVIDER_ENDPOINT_URL) {
      this.provider = new ProductionSMSAdapter();
    } else {
      this.provider = new MockSMSProvider();
    }
  }

  /**
   * Check if live SMS provider is configured
   */
  isLiveSMSConfigured() {
    return this.provider.isConfigured();
  }

  /**
   * Get active provider name
   */
  getProviderName() {
    return this.provider.name;
  }

  /**
   * Send Feedback Confirmation SMS
   * Note: Does NOT promise "Action will definitely be taken."
   * Uses clean non-clinical text.
   */
  async sendFeedbackConfirmation({ to, trackingToken, language = "hi" }) {
    if (!to) return null;

    let message = "";
    if (language === "mr") {
      message = `जीवनसेतू: आपला अभिप्राय नोंदवला गेला आहे. धन्यवाद. ट्रॅकिंग टोकन: ${trackingToken}. स्टेटस तपासा: jeevansetu.gov.in/feedback`;
    } else if (language === "en") {
      message = `JeevanSetu: Your service feedback has been recorded. Thank you. Tracking Token: ${trackingToken}. Check status at jeevansetu.gov.in/feedback`;
    } else {
      message = `जीवनसेतु: आपकी सेवा प्रतिक्रिया दर्ज कर ली गई है। धन्यवाद। ट्रैकिंग टोकन: ${trackingToken}। स्थिति देखें: jeevansetu.gov.in/feedback`;
    }

    return this.provider.sendSMS({
      to,
      message,
      templateId: "DLT_FEEDBACK_ACK_01",
    });
  }

  /**
   * Send Missed-Call Web Feedback Link SMS
   */
  async sendMissedCallFeedbackLink({ to, language = "hi", facilityName = "PHC" }) {
    if (!to) return null;

    let message = "";
    if (language === "mr") {
      message = `जीवनसेतू: आरोग्य सेवा अभिप्राय देण्यासाठी लिंक: jeevansetu.gov.in/feedback किंवा 1800-XXX-XXXX वर कॉल करा. धन्यवाद.`;
    } else if (language === "en") {
      message = `JeevanSetu: Please share your healthcare experience at jeevansetu.gov.in/feedback or call our toll-free line. Thank you.`;
    } else {
      message = `जीवनसेतु: स्वास्थ्य सेवा प्रतिक्रिया देने के लिए लिंक: jeevansetu.gov.in/feedback अथवा टोल-फ्री पर कॉल करें। धन्यवाद।`;
    }

    return this.provider.sendSMS({
      to,
      message,
      templateId: "DLT_MISSED_CALL_LINK_01",
    });
  }

  /**
   * Direct SMS dispatch helper
   */
  async sendCustomSMS({ to, message, templateId }) {
    return this.provider.sendSMS({ to, message, templateId });
  }
}

module.exports = new SMSService();
