/**
 * Speech Recognition (STT) Abstraction Layer for JeevanSetu
 * Supports Browser SpeechRecognition API with multi-language support (Hindi, Marathi, English)
 * and graceful fallback when unsupported.
 */

import textToSpeechService from "./textToSpeech";

export class SpeechRecognitionProvider {
  constructor(name = "BaseSTTProvider") {
    this.name = name;
  }

  isSupported() {
    return false;
  }

  start({ language, onStart, onResult, onError, onEnd }) {
    throw new Error("start() must be implemented by subclass");
  }

  stop() {
    throw new Error("stop() must be implemented by subclass");
  }

  abort() {
    throw new Error("abort() must be implemented by subclass");
  }
}

export class BrowserSpeechRecognitionProvider extends SpeechRecognitionProvider {
  constructor() {
    super("BrowserSpeechRecognition");
    this.recognition = null;
    this.isListening = false;
  }

  getRecognitionConstructor() {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  isSupported() {
    return Boolean(this.getRecognitionConstructor());
  }

  /**
   * Map platform language code to BCP 47 speech recognition locale
   * @param {string} lang - 'hi' | 'mr' | 'en'
   */
  getLocale(lang = "en") {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      case "en":
      default:
        return "en-IN";
    }
  }

  start({ language = "en", onStart, onResult, onError, onEnd }) {
    const SpeechConstructor = this.getRecognitionConstructor();
    if (!SpeechConstructor) {
      if (onError) onError("Browser speech recognition is not supported on this device/browser.");
      return;
    }

    // Abort existing instance cleanly if running (drop pending audio buffer)
    this.abort();

    try {
      this.recognition = new SpeechConstructor();
      this.recognition.continuous = false; // Single utterance query flow
      this.recognition.interimResults = true; // Show real-time partial transcription
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.getLocale(language);

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      this.recognition.onresult = (event) => {
        // Acoustic feedback guard: Discard recognition if audio synthesis is currently playing or in room cooldown
        if (textToSpeechService.isEchoQuarantine(1200)) {
          console.log("[STT Guard] Suppressed microphone audio during assistant playback / acoustic cooldown");
          return;
        }

        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const candidateText = (finalTranscript || interimTranscript).trim();

        // Assistant phrase echo guard: Discard if transcript is an echo of recently spoken text
        if (textToSpeechService.isEchoOfSpokenText(candidateText)) {
          console.log("[STT Guard] Suppressed acoustic echo matching assistant spoken phrase:", candidateText);
          return;
        }

        if (onResult) {
          onResult({
            transcript: candidateText,
            isFinal: Boolean(finalTranscript),
          });
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        let userFriendlyError = "Voice recognition error. Please try again.";

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          userFriendlyError = "Microphone permission denied. Please allow microphone access in your browser settings.";
        } else if (event.error === "no-speech") {
          userFriendlyError = "No speech was detected. Please tap the microphone and speak again.";
        } else if (event.error === "network") {
          userFriendlyError = "Network error during speech recognition. Please check your connectivity.";
        } else if (event.error === "aborted") {
          return; // Intentional stop, do not trigger error notice
        }

        if (onError) onError(userFriendlyError, event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      if (onError) onError(`Failed to initiate microphone: ${err.message}`);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
    }
    this.isListening = false;
  }

  abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignored
      }
    }
    this.isListening = false;
  }
}

/**
 * Future extensible STT provider stub for server-side Whisper / Azure / Google Cloud Speech
 */
export class FutureProductionSTTProvider extends SpeechRecognitionProvider {
  constructor(config = {}) {
    super("FutureProductionSTTProvider");
    this.endpoint = config.endpoint || "/api/ai/stt";
  }

  isSupported() {
    return Boolean(typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia);
  }

  async start({ language, onStart, onResult, onError, onEnd }) {
    // Graceful fallback to browser STT
    const fallback = new BrowserSpeechRecognitionProvider();
    if (fallback.isSupported()) {
      return fallback.start({ language, onStart, onResult, onError, onEnd });
    }
    if (onError) onError("Cloud STT provider unconfigured. Please use browser speech or type your query.");
  }

  stop() {}
  abort() {}
}

export const speechRecognitionService = new BrowserSpeechRecognitionProvider();
export default speechRecognitionService;
