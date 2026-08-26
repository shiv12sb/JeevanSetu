const BaseAIProvider = require("./base.provider");

class ClaudeProvider extends BaseAIProvider {
  constructor(config = {}) {
    super("Claude", config);
    this.apiKey = process.env.ANTHROPIC_API_KEY || config.apiKey;
    this.modelName = config.modelName || process.env.CLAUDE_MODEL || "claude-3-haiku-20240307";
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateCompletion({ systemPrompt, messages, language = "en", maxTokens = 800, temperature = 0.2 }) {
    if (!this.isConfigured()) {
      throw new Error("Anthropic Claude API key is not configured in backend environment.");
    }

    const endpoint = "https://api.anthropic.com/v1/messages";

    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.modelName,
          system: systemPrompt,
          messages: formattedMessages,
          max_tokens: maxTokens,
          temperature,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const textBlock = result.content?.find((c) => c.type === "text");

      return {
        text: textBlock?.text?.trim() || "",
        rawUsage: result.usage || {},
      };
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error("Claude AI provider timed out. Please try again.");
      }
      throw err;
    }
  }
}

module.exports = ClaudeProvider;
