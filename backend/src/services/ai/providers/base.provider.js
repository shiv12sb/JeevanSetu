/**
 * Abstract Base Provider for LLM Integrations
 */
class BaseAIProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.timeoutMs = config.timeoutMs || 15000;
  }

  /**
   * Check if provider is configured with required credentials
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }

  /**
   * Generate completion from messages and system prompt
   * @param {Object} params
   * @param {string} params.systemPrompt
   * @param {Array<{role: string, content: string}>} params.messages
   * @param {string} params.language
   * @param {number} [params.maxTokens]
   * @param {number} [params.temperature]
   * @returns {Promise<{text: string, rawUsage?: Object}>}
   */
  async generateCompletion({ systemPrompt, messages, language = "en", maxTokens = 800, temperature = 0.2 }) {
    throw new Error(`generateCompletion must be implemented by ${this.name} provider`);
  }
}

module.exports = BaseAIProvider;
