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
    this.lastSpeechEndTime = 0;
    this.recentSpokenPhrases = [];
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
   * Determine if the microphone should be quarantined from listening
   * due to active playback or physical acoustic room reverberation.
   * @param {number} bufferMs - Cooldown duration in ms after speech playback ends
   */
  isEchoQuarantine(bufferMs = 1200) {
    if (this.isSpeaking()) return true;
    const elapsedSinceEnd = Date.now() - (this.lastSpeechEndTime || 0);
    return elapsedSinceEnd < bufferMs;
  }

  /**
   * Record a recently spoken assistant response so speech recognition can
   * filter out any acoustic feedback picked up by the phone's microphone.
   */
  trackSpokenText(text) {
    if (!text || typeof text !== "string") return;
    const clean = text.toLowerCase().replace(/[*_#`~[\]()]/g, "").trim();
    if (!clean) return;

    this.recentSpokenPhrases = this.recentSpokenPhrases || [];
    this.recentSpokenPhrases.push({ text: clean, timestamp: Date.now() });

    // Prune entries older than 25 seconds
    const now = Date.now();
    this.recentSpokenPhrases = this.recentSpokenPhrases.filter(p => now - p.timestamp < 25000);
  }

  /**
   * Check if an incoming user transcript is actually an acoustic reflection
   * of words recently uttered by the assistant through the device speaker.
   */
  isEchoOfSpokenText(transcript) {
    if (!transcript || typeof transcript !== "string") return false;
    const candidate = transcript.toLowerCase().trim();
    if (!candidate || candidate.length < 2) return false;

    // Common system greeting fragments that loop in feedback
    const knownSystemSnippets = [
      "मी जीवनसेतू", "जीवनसेतू सहाय्यक", "मी आपला जीवनसेतू", "आरोग्य सहाय्यक",
      "आरोग्य सेवा", "विचारू शकता", "काय मदत करू", "उपलब्ध आहेत", "नमस्ते",
      "मैं jeevansetu", "jeevansetu assistant", "hello i am jeevansetu"
    ];

    for (const snippet of knownSystemSnippets) {
      if (candidate.includes(snippet) || snippet.includes(candidate)) {
        return true;
      }
    }

    const phrases = this.recentSpokenPhrases || [];
    for (const p of phrases) {
      // Direct substring match
      if (p.text.includes(candidate) || candidate.includes(p.text)) {
        return true;
      }

      // Word-level overlap match (50% or more overlap with spoken words)
      const candWords = candidate.split(/\s+/).filter(w => w.length > 2);
      if (candWords.length >= 2) {
        const matches = candWords.filter(w => p.text.includes(w));
        if (matches.length / candWords.length >= 0.5) {
          return true;
        }
      }
    }

    return false;
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

      const voice = this.getBestVoice(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || (language === "mr" ? "hi-IN" : "en-IN");
      } else {
        // If no explicit voice object is bound, default Marathi to hi-IN locale which SAPI/Chromium natively supports for Devanagari text
        utterance.lang = language === "mr" ? "hi-IN" : language === "hi" ? "hi-IN" : "en-IN";
      }

      utterance.onstart = () => {
        this._speaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this._speaking = false;
        this.lastSpeechEndTime = Date.now();
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        this._speaking = false;
        this.lastSpeechEndTime = Date.now();
        if (event.error === "canceled" || event.error === "interrupted") {
          if (onEnd) onEnd();
          return;
        }
        if (onError) onError(`Speech synthesis error: ${event.error}`);
      };

      if (synth.paused) {
        synth.resume();
      }
      synth.speak(utterance);
      if (synth.paused) {
        synth.resume();
      }
    } catch (err) {
      this._speaking = false;
      this.lastSpeechEndTime = Date.now();
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
    this.lastSpeechEndTime = Date.now();
  }
}

export const textToSpeechService = new BrowserTTSProvider();
export default textToSpeechService;
