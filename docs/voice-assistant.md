# JeevanSetu Browser Voice AI Assistant Specification

## 1. Overview

The **JeevanSetu Voice AI Assistant** provides rural citizens, non-literate patients, and health workers with hands-free, voice-driven healthcare navigation. It enables users to speak natural questions in **Hindi (हिंदी)**, **Marathi (मराठी)**, or **English**, automatically transcribes their speech, queries the grounded JeevanSetu AI backend, and speaks the verified answer aloud using browser speech synthesis.

---

## 2. Voice Architecture & Interaction Flow

```
[ USER TAPS MICROPHONE ]
           │
           ▼
[ Browser Microphone Permission Check ]
           │
           ▼
[ Speech-to-Text (STT) Engine ]
(Browser SpeechRecognition with hi-IN, mr-IN, en-IN)
           │
           ▼
[ Real-Time Transcript Display ]
           │
           ▼
[ Central JeevanSetu AI Backend ]
(POST /api/ai/chat — Same backend used by text chat)
           │
           ▼
[ Grounded Healthcare Safety Validation ]
           │
           ▼
[ Formatted Response Text + Resource Cards ]
           │
           ▼
[ Text-to-Speech (TTS) Engine ]
(Browser SpeechSynthesis with voice matching)
           │
           ▼
[ Spoken Voice Response + Visual Playback Indicator ]
```

---

## 3. STT & TTS Provider Abstractions

### Speech Recognition Abstraction (`frontend/lib/voice/speechRecognition.js`)
- `SpeechRecognitionProvider`: Generic provider interface defining `isSupported()`, `start()`, `stop()`, `abort()`.
- `BrowserSpeechRecognitionProvider`: Web Speech API implementation utilizing `window.SpeechRecognition` / `window.webkitSpeechRecognition`.
- `FutureProductionSTTProvider`: Extensible adapter for server-side Whisper / Cloud Speech endpoints.

### Text-to-Speech Abstraction (`frontend/lib/voice/textToSpeech.js`)
- `TextToSpeechProvider`: Generic provider interface defining `isSupported()`, `speak()`, `stop()`, `isSpeaking()`.
- `BrowserTTSProvider`: Web Speech Synthesis API implementation utilizing `window.speechSynthesis`.
- `FutureProductionTTSProvider`: Extensible adapter for neural cloud speech synthesis.

---

## 4. Voice UX States & State Machine

The Voice Assistant follows a deterministic 6-state lifecycle:

1. **`IDLE`**: Ready for input. Displays microphone button (`🎙️`).
2. **`LISTENING`**: Microphone active, capturing audio input. Animated pulsing rose indicator with live waveform.
3. **`TRANSCRIBING`**: Receiving interim partial speech tokens from the STT engine.
4. **`THINKING`**: Speech finished; backend query dispatched to `/api/ai/chat` for safety validation and data grounding.
5. **`SPEAKING`**: Audio playback in progress. Displays bouncing audio waveform and prominent **"Stop Speaking"** interrupt button.
6. **`ERROR`**: Actionable error banner with retry option (e.g. microphone permission denied or network drop).

---

## 5. Multi-Language Voice & Accent Handling

- **Hindi (`hi-IN`)**: Matched against available Indian Hindi voices.
- **Marathi (`mr-IN`)**: Matched against Marathi browser voices; gracefully falls back to Hindi or Indian English voice if Marathi TTS is not installed on the client device.
- **English (`en-IN`)**: Matched against Indian English voices (or standard English voices).

> [!IMPORTANT]
> **Browser & Device Voice Availability Limitation:**
> Browser TTS voices, accents, and pronunciations are determined by the user's operating system, installed voice packages, and browser engine (e.g. Chrome, Safari, Android WebView). JeevanSetu dynamically queries `speechSynthesis.getVoices()` to select the highest-quality matching regional voice available on the device. If no Indian voice is present, the system falls back gracefully to default device voices or visual text cards.

---

## 6. Interruption & Speech Control

- **Stop Speaking Button**: Instantly cancels active speech synthesis (`speechSynthesis.cancel()`) without discarding the rendered text cards.
- **Overlapping Speech Guard**: Any new microphone tap or message read-aloud action cancels in-progress audio before starting the new utterance.
- **Auto-Speak Toggle**: Automatically plays audio for voice-initiated queries, while maintaining optional manual "Listen" buttons on all message cards.

---

## 7. Accessibility & Mobile Optimization

- **High-Contrast Touch Targets**: Microphone buttons feature $\ge 44 \times 44$px touch targets for rural touchscreen usability.
- **Screen Reader Support**: Full ARIA labels (`aria-label="Open JeevanSetu AI Assistant"`, `aria-label="Stop Speaking"`).
- **Floating Widget (`FloatingAssistantButton.js`)**: Lightweight, non-intrusive floating button accessible across all dashboard and directory views without occluding emergency 108 hotline banners or mobile navigation bars.
