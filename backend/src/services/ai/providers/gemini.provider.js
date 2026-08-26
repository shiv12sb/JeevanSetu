const BaseAIProvider = require("./base.provider");

class GeminiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super("Gemini", config);
    this.apiKey = process.env.GEMINI_API_KEY || config.apiKey;
    this.modelName = config.modelName || process.env.GEMINI_MODEL || "gemini-1.5-flash";
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateCompletion({ systemPrompt, messages, language = "en", maxTokens = 800, temperature = 0.2 }) {
    if (!this.isConfigured()) {
      throw new Error("Gemini API key is not configured in backend environment.");
    }

    const contents = [];

    // Format conversation history for Gemini API
    for (const msg of messages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return {
        text: candidateText.trim(),
        rawUsage: result.usageMetadata || {},
      };
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error("Gemini AI provider timed out. Please try again.");
      }
      throw err;
    }
  }
}

module.exports = GeminiProvider;
