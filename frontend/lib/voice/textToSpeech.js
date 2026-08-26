/**
 * Text-to-Speech (TTS) Abstraction Layer for JeevanSetu
 * Supports Browser SpeechSynthesis API with Hindi, Marathi, and English voice matching
 * and graceful fallback when unsupported.
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
   * @param {string} lang - 'hi' | 'mr' | 'en'
   * @returns {SpeechSynthesisVoice|null}
   */
  getBestVoice(lang = "en") {
    const synth = this.getSynthesis();
    if (!synth) return null;

    const voices = synth.getVoices() || [];
    if (voices.length === 0) return null;

    const targetLang = lang.toLowerCase();

    if (targetLang === "hi") {
      // Look for Hindi voice
      const hindiVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("hi"));
      if (hindiVoice) return hindiVoice;
    } else if (targetLang === "mr") {
      // Look for Marathi voice
      const marathiVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("mr"));
      if (marathiVoice) return marathiVoice;
      // Fall back to Hindi voice if Marathi-specific TTS engine is unavailable
      const hindiVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("hi"));
      if (hindiVoice) return hindiVoice;
    }

    // Default to Indian English (en-IN) or any English voice
    const indianEnglish = voices.find((v) => v.lang && v.lang.toLowerCase().includes("en-in"));
    if (indianEnglish) return indianEnglish;

    const anyEnglish = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
    if (anyEnglish) return anyEnglish;

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
      .replace(/\s+/g, " ")
      .trim();
  }

  speak(text, { language = "en", rate = 0.95, pitch = 1.0, onStart, onEnd, onError } = {}) {
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
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Set language locale
      if (language === "hi") {
        utterance.lang = "hi-IN";
      } else if (language === "mr") {
        utterance.lang = "mr-IN";
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
          // Intentional stop
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
      } catch (e) {
        // Ignored
      }
    }
    this._speaking = false;
  }
}

/**
 * Future extensible Cloud TTS provider stub for server-side ElevenLabs / Azure / Google Cloud TTS
 */
export class FutureProductionTTSProvider extends TextToSpeechProvider {
  constructor(config = {}) {
    super("FutureProductionTTSProvider");
    this.endpoint = config.endpoint || "/api/ai/tts";
  }

  isSupported() {
    return typeof window !== "undefined";
  }

  async speak(text, options = {}) {
    const fallback = new BrowserTTSProvider();
    if (fallback.isSupported()) {
      return fallback.speak(text, options);
    }
    if (options.onError) options.onError("Cloud TTS provider unconfigured.");
  }

  stop() {}
}

export const textToSpeechService = new BrowserTTSProvider();
export default textToSpeechService;
