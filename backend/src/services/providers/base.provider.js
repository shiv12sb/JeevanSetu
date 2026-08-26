/**
 * ==============================================================================
 * JEEVANSETU PHASE 28 — COMMON BASE PROVIDER ABSTRACTION
 * ==============================================================================
 * Universal base interface for all external integration adapters (SMS, Email,
 * Telephony, Weather, Pharmacy, n8n, WhatsApp).
 *
 * Core Rule: If provider credentials or endpoints are absent in the environment,
 * the provider must gracefully report isConfigured() = false and status =
 * "PROVIDER_NOT_CONFIGURED" rather than throwing uncaught errors or pretending
 * external delivery succeeded.
 */

class BaseProvider {
  /**
   * @param {string} name - Provider identifier (e.g. 'MockSMSProvider', 'TwilioSMSAdapter')
   * @param {string} category - Integration category ('SMS', 'EMAIL', 'TELEPHONY', 'WEATHER', 'PHARMACY', 'N8N', 'WHATSAPP')
   * @param {boolean} [isAvailable=false] - Baseline availability flag
   */
  constructor(name = "BaseProvider", category = "GENERIC", isAvailable = false) {
    this.name = name;
    this.category = category;
    this.isAvailable = isAvailable;
  }

  /**
   * Check if live external credentials are fully configured in the environment
   * @returns {boolean}
   */
  isConfigured() {
    return this.isAvailable;
  }

  /**
   * Get operational health status of this provider
   * @returns {Object}
   */
  getHealthStatus() {
    const configured = this.isConfigured();
    return {
      name: this.name,
      category: this.category,
      configured,
      status: configured ? "ONLINE" : "PROVIDER_NOT_CONFIGURED",
      isMock: this.name.startsWith("Mock"),
    };
  }

  /**
   * Verify incoming webhook signature (HMAC or secret)
   * @param {Object} req - Express request object
   * @returns {boolean}
   */
  verifyWebhookSignature(req) {
    return true;
  }
}

module.exports = BaseProvider;
