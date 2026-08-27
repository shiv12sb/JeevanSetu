/**
 * Text-to-Speech (TTS) Abstraction Layer for JeevanSetu
 * Optimized for natural Indian Marathi (mr-IN), Hindi (hi-IN), and Indian English (en-IN)
 * with robust voice loading, phonetic clean-up, and zero-latency synthesis.
 */

export class TextToSpeechProvider {
  constructor(name = "BaseTTSProvider") {
    this.name = name;
  }

  isSupported() {
    return false;
  }

  speak(text, options = {}) {
    throw new Error("speak() must be implemented by subclass");
  }

  stop() {
    throw new Error("stop() must be implemented by subclass");
  }

  isSpeaking() {
    return false;
  }
}

export class BrowserTTSProvider extends TextToSpeechProvider {
  constructor() {
    super("BrowserSpeechSynthesis");
    this._speaking = false;
    this.cachedVoices = [];

    if (typeof window !== "undefined" && window.speechSynthesis) {
      this.cachedVoices = window.speechSynthesis.getVoices() || [];
      window.speechSynthesis.onvoiceschanged = () => {
        try {
          this.cachedVoices = window.speechSynthesis.getVoices() || [];
        } catch (e) {}
      };
    }
  }

  getSynthesis() {
    if (typeof window === "undefined") return null;
    return window.speechSynthesis || null;
  }

  isSupported() {
    return Boolean(this.getSynthesis() && typeof window.SpeechSynthesisUtterance !== "undefined");
  }

  isSpeaking() {
    const synth = this.getSynthesis();
    return synth ? synth.speaking || this._speaking : false;
  }

  /**
   * Find the best matching browser voice for the specified language
   * Prioritizes Marathi (mr-IN) -> Indian Hindi (hi-IN) -> Indian English (en-IN)
   */
  getBestVoice(lang = "mr") {
    const synth = this.getSynthesis();
    if (!synth) return null;

    let voices = this.cachedVoices;
    if (!voices || voices.length === 0) {
      voices = synth.getVoices() || [];
      this.cachedVoices = voices;
    }
    if (voices.length === 0) return null;

    const targetLang = (lang || "mr").toLowerCase();

    if (targetLang === "mr") {
      // 1. Direct Marathi voice match
      const marathiVoice = voices.find(
        (v) =>
          (v.lang && v.lang.toLowerCase().replace("_", "-").startsWith("mr")) ||
          (v.name && v.name.toLowerCase().includes("marathi")) ||
          (v.name && v.name.includes("मराठी"))
      );
      if (marathiVoice) return marathiVoice;

      // 2. High-quality Indian Hindi voice match for natural Devanagari phonetics
      const hindiIndianVoice = voices.find(
        (v) =>
          (v.lang && v.lang.toLowerCase().replace("_", "-").startsWith("hi")) ||
          (v.name && (v.name.includes("हिन्दी") || v.name.toLowerCase().includes("hindi") || v.name.includes("Kalpana") || v.name.includes("Hemant") || v.name.includes("Swara") || v.name.includes("Lekha")))
      );
      if (hindiIndianVoice) return hindiIndianVoice;

      // 3. Indian English voice fallback
      const inEnglish = voices.find((v) => v.lang && v.lang.toLowerCase().includes("en-in"));
      if (inEnglish) return inEnglish;
    } else if (targetLang === "hi") {
      const hindiVoice = voices.find(
        (v) =>
          (v.lang && v.lang.toLowerCase().replace("_", "-").startsWith("hi")) ||
          (v.name && (v.name.includes("हिन्दी") || v.name.toLowerCase().includes("hindi")))
      );
      if (hindiVoice) return hindiVoice;
    }

    // Default to Indian English (en-IN)
    const indianEnglish = voices.find((v) => v.lang && v.lang.toLowerCase().includes("en-in"));
    if (indianEnglish) return indianEnglish;

    return voices[0] || null;
  }

  /**
   * Sanitize text to remove markdown asterisks, URLs, and code blocks before speaking
   */
  cleanTextForSpeech(text) {
    if (!text || typeof text !== "string") return "";
    return text
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/[*_#`~[\]()]/g, "")
      .replace(/[\/\\|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  speak(text, { language = "mr", rate = 0.90, pitch = 1.0, onStart, onEnd, onError } = {}) {
    const synth = this.getSynthesis();
    if (!synth) {
      if (onError) onError("Browser speech synthesis is not supported on this device.");
      return;
    }

    // Stop any in-progress speech before starting new utterance
    this.stop();

    const clean = this.cleanTextForSpeech(text);
    if (!clean) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const utterance = new window.SpeechSynthesisUtterance(clean);
      utterance.rate = rate || 0.90;
      utterance.pitch = pitch || 1.0;

      // Set language locale explicitly
      if (language === "mr") {
        utterance.lang = "mr-IN";
      } else if (language === "hi") {
        utterance.lang = "hi-IN";
      } else {
        utterance.lang = "en-IN";
      }

      const voice = this.getBestVoice(language);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this._speaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this._speaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        this._speaking = false;
        if (event.error === "canceled" || event.error === "interrupted") {
          if (onEnd) onEnd();
          return;
        }
        if (onError) onError(`Speech synthesis error: ${event.error}`);
      };

      synth.speak(utterance);
    } catch (err) {
      this._speaking = false;
      if (onError) onError(`Speech synthesis failed: ${err.message}`);
    }
  }

  stop() {
    const synth = this.getSynthesis();
    if (synth) {
      try {
        synth.cancel();
      } catch (e) {}
    }
    this._speaking = false;
  }
}

export const textToSpeechService = new BrowserTTSProvider();
export default textToSpeechService;
