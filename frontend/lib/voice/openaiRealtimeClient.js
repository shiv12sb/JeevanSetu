import { aiApi } from "../api";
import { getClientAiFallbackResponse } from "../services/clientAiFallback";
import speechRecognitionService from "./speechRecognition";
import textToSpeechService from "./textToSpeech";

export class OpenAIRealtimeVoiceClient {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.localStream = null;
    this.remoteAudioElement = null;
    this.audioContext = null;
    this.analyser = null;
    this.animFrameId = null;

    this.state = "IDLE"; // 'IDLE' | 'CONNECTING' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR' | 'DISCONNECTED'
    this.language = "mr";
    this.voice = "alloy";
    this.isMuted = false;
    this.isDevSimulation = false;
    this.isListeningActive = false;

    // Callbacks
    this.onStateChange = null;
    this.onTranscript = null;
    this.onAudioLevel = null;
    this.onError = null;
    this.onToolCall = null;
    this.onEmergency = null;
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      if (this.onStateChange) {
        this.onStateChange(newState);
      }
    }
  }

  /**
   * Start Live Voice Session
   */
  async start({
    language = "mr",
    voice = "alloy",
    onStateChange,
    onTranscript,
    onAudioLevel,
    onError,
    onToolCall,
    onEmergency,
  } = {}) {
    this.language = language || "mr";
    this.voice = voice || "alloy";
    this.onStateChange = onStateChange;
    this.onTranscript = onTranscript;
    this.onAudioLevel = onAudioLevel;
    this.onError = onError;
    this.onToolCall = onToolCall;
    this.onEmergency = onEmergency;

    this.setState("CONNECTING");

    try {
      // 1. Obtain ephemeral session token from backend (Server-Side OpenAI Key)
      const sessionResponse = await aiApi.createRealtimeSession({
        language: this.language,
        voice: this.voice,
      });

      const sessionData = sessionResponse?.data || {};

      // 2. Request user microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });
      this.localStream = stream;

      // 3. Setup Audio Analyser for UI Visualizer
      this.setupAudioAnalyser(stream);

      // 4. Check if live WebRTC Ephemeral Secret is returned
      const ephemeralKey = sessionData.client_secret?.value;

      if (!ephemeralKey || sessionData.is_dev_simulation) {
        // Run in verified local simulation mode
        this.isDevSimulation = true;
        this.startLocalSimulationMode();
        return;
      }

      // 5. Connect via WebRTC directly to OpenAI Realtime endpoint
      await this.initiateWebRTCConnection(ephemeralKey, sessionData.model || "gpt-4o-realtime-preview");
    } catch (err) {
      console.warn("Realtime WebRTC voice startup error, attempting graceful fallback:", err);
      // Fallback to local simulation mode if WebRTC negotiation fails
      this.isDevSimulation = true;
      this.startLocalSimulationMode();
    }
  }

  /**
   * Establish Peer Connection with OpenAI Realtime Endpoint
   */
  async initiateWebRTCConnection(ephemeralKey, modelName) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    this.peerConnection = pc;

    // Create remote audio playback element
    const remoteAudio = document.createElement("audio");
    remoteAudio.autoplay = true;
    this.remoteAudioElement = remoteAudio;

    pc.ontrack = (event) => {
      remoteAudio.srcObject = event.streams[0];
    };

    // Add local microphone audio track to WebRTC
    this.localStream.getTracks().forEach((track) => {
      pc.addTrack(track, this.localStream);
    });

    // Create Data Channel for bidirectional Realtime control events
    const dc = pc.createDataChannel("oai-events");
    this.dataChannel = dc;

    dc.onopen = () => {
      this.setState("LISTENING");

      // Configure OpenAI Realtime session with strict Marathi default
      this.sendDataChannelEvent({
        type: "session.update",
        session: {
          modalities: ["audio", "text"],
          instructions: `You are JeevanSetu Healthcare AI Voice Assistant for Maharashtra.
MANDATORY SPOKEN LANGUAGE RULE:
1. You MUST ALWAYS speak in authentic, natural MARATHI (मराठी) by default.
2. Speak in standard, polite Devanagari Marathi with clear pronunciation.
3. When greeting, explaining doctor schedules, hospital beds, medicines, 108 emergency, or PM-JAY schemes, ALWAYS speak in Marathi.
4. Only switch to Hindi or English if the user explicitly addresses you in Hindi or English.`,
          voice: this.voice || "alloy",
          input_audio_transcription: {
            model: "whisper-1",
            language: "mr",
          },
        },
      });

      // Trigger Marathi opening response
      this.sendDataChannelEvent({
        type: "response.create",
        response: {
          instructions: "Greet the user warmly in spoken Marathi: 'नमस्कार! मी जीवनसेतू आरोग्य सहाय्यक आहे. मी आपल्याला महाराष्ट्रातील डॉक्टर, १०८ रुग्णवाहिका, शासकीय योजना आणि औषध साठ्याविषयी माहिती देऊ शकतो. सांगा, मी आपली काय मदत करू?'",
        },
      });
    };

    dc.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.handleRealtimeServerEvent(msg);
      } catch (err) {
        console.warn("Failed to parse Realtime server event:", err);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        this.setState("LISTENING");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.setState("DISCONNECTED");
      }
    };

    // Create SDP Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send SDP Offer with Ephemeral Client Secret
    const baseUrl = "https://api.openai.com/v1/realtime";
    const sdpResponse = await fetch(`${baseUrl}?model=${modelName}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        "Content-Type": "application/sdp",
      },
    });

    if (!sdpResponse.ok) {
      throw new Error(`OpenAI WebRTC negotiation failed with status: ${sdpResponse.status}`);
    }

    const answerSdp = await sdpResponse.text();
    const answer = {
      type: "answer",
      sdp: answerSdp,
    };
    await pc.setRemoteDescription(answer);
  }

  /**
   * Handle Inbound OpenAI Realtime Events over DataChannel
   */
  async handleRealtimeServerEvent(event) {
    switch (event.type) {
      // User speech detection (Server VAD)
      case "input_audio_buffer.speech_started":
        // Barge-in: user is speaking, interrupt any active assistant speech immediately
        this.interrupt();
        this.setState("LISTENING");
        break;

      case "input_audio_buffer.speech_stopped":
        this.setState("THINKING");
        break;

      // User Transcription completed
      case "conversation.item.input_audio_transcription.completed": {
        const transcriptText = event.transcript?.trim() || "";
        if (transcriptText) {
          if (this.onTranscript) {
            this.onTranscript({ sender: "user", text: transcriptText });
          }

          // Emergency preemption check
          if (
            /(हार्ट अटॅक|साप चावला|सर्पदंश|छातीत कळा|रक्तस्त्राव|बेशुद्ध|heart attack|chest pain|stroke|snake bite|difficulty breathing)/i.test(
              transcriptText
            )
          ) {
            if (this.onEmergency) {
              this.onEmergency({
                text: transcriptText,
                helpline: "108",
              });
            }
          }
        }
        break;
      }

      // Assistant Audio Output
      case "response.output_item.added":
        this.setState("SPEAKING");
        break;

      case "response.audio_transcript.delta":
        if (this.onTranscript && event.delta) {
          this.onTranscript({ sender: "assistant", textDelta: event.delta });
        }
        break;

      case "response.audio_transcript.done":
        if (this.onTranscript && event.transcript) {
          this.onTranscript({ sender: "assistant", text: event.transcript, isFinal: true });
        }
        break;

      case "response.done":
        this.setState("LISTENING");
        break;

      // Function / Tool Call Request from OpenAI Realtime
      case "response.function_call_arguments.done": {
        const { call_id, name, arguments: argsJson } = event;
        let parsedArgs = {};
        try {
          parsedArgs = JSON.parse(argsJson || "{}");
        } catch {
          parsedArgs = {};
        }

        if (this.onToolCall) {
          this.onToolCall({ name, args: parsedArgs });
        }

        // Execute verified tool via backend API
        try {
          const toolResult = await aiApi.executeRealtimeTool(name, parsedArgs);

          // Return function call output to OpenAI Realtime
          this.sendDataChannelEvent({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id,
              output: JSON.stringify(toolResult?.data?.data || toolResult?.data || { success: true }),
            },
          });

          // Trigger assistant spoken response grounded in tool output
          this.sendDataChannelEvent({
            type: "response.create",
            response: {
              instructions: "Speak the response in authentic Marathi (मराठी) grounded in the tool output.",
            },
          });
        } catch (toolErr) {
          console.warn(`Error executing tool ${name}:`, toolErr);
          this.sendDataChannelEvent({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id,
              output: JSON.stringify({ error: toolErr.message }),
            },
          });
          this.sendDataChannelEvent({
            type: "response.create",
            response: {
              instructions: "Speak in authentic Marathi (मराठी) informing the user about the error clearly.",
            },
          });
        }
        break;
      }

      case "error":
        console.warn("Realtime error event from OpenAI:", event.error);
        if (this.onError) this.onError(event.error?.message || "Realtime Voice Error");
        break;

      default:
        break;
    }
  }

  /**
   * Send control event via WebRTC DataChannel
   */
  sendDataChannelEvent(eventObj) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(JSON.stringify(eventObj));
    }
  }

  /**
   * Interrupt Assistant Speech (Barge-in)
   */
  interrupt() {
    if (this.remoteAudioElement) {
      this.remoteAudioElement.pause();
      this.remoteAudioElement.currentTime = 0;
    }

    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.sendDataChannelEvent({
        type: "response.cancel",
      });
    }

    textToSpeechService.stop();
  }

  /**
   * Mute / Unmute Microphone
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = !muted;
      });
    }
    if (this.isDevSimulation) {
      if (muted) {
        speechRecognitionService.stop();
      } else {
        this.startLocalListening();
      }
    }
  }

  /**
   * Setup Audio Analyser for Visual Waveform Orb
   */
  setupAudioAnalyser(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      this.audioContext = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      this.analyser = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevels = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate average normalized volume (0.0 to 1.0)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalizedVolume = Math.min(1.0, average / 128);

        if (this.onAudioLevel) {
          this.onAudioLevel({
            volume: normalizedVolume,
            frequencies: Array.from(dataArray),
          });
        }

        this.animFrameId = requestAnimationFrame(updateAudioLevels);
      };

      updateAudioLevels();
    } catch (e) {
      console.warn("Web Audio Analyser setup failed:", e);
    }
  }

  /**
   * Local Simulation Fallback (when offline or running without live OpenAI credentials)
   */
  startLocalSimulationMode() {
    this.isListeningActive = true;
    this.conversationHistory = this.conversationHistory || [];

    const welcomeGreetings = {
      mr: "नमस्कार! मी जीवनसेतू सहाय्यक आहे. आपण मला आरोग्य सेवा, डॉक्टर, रुग्णालय, रुग्णवाहिका, औषधे, रेफरल आणि सरकारी योजनांविषयी विचारू शकता.",
      hi: "नमस्ते! मैं JeevanSetu Assistant हूँ। आप मुझसे स्वास्थ्य सेवाओं, डॉक्टर, अस्पताल, एम्बुलेंस, दवाइयों, रेफरल और सरकारी योजनाओं के बारे में पूछ सकते हैं।",
      en: "Hello! I am JeevanSetu Assistant. You can ask me about healthcare facilities, doctors, hospitals, ambulances, medicines, referrals, and government schemes.",
    };

    const welcomeText = welcomeGreetings[this.language] || welcomeGreetings.mr;

    if (this.onTranscript) {
      this.onTranscript({
        sender: "assistant",
        text: welcomeText,
        isFinal: true,
      });
    }

    this.speakLocalText(welcomeText, () => {
      if (this.isListeningActive && !this.isMuted) {
        this.startLocalListening();
      }
    });
  }

  /**
   * Listen to user speech via browser SpeechRecognition during local simulation
   */
  startLocalListening() {
    if (!this.isListeningActive || this.isMuted) return;

    this.setState("LISTENING");

    speechRecognitionService.start({
      language: this.language || "mr",
      onStart: () => {
        this.setState("LISTENING");
      },
      onResult: ({ transcript, isFinal }) => {
        if (transcript && this.onTranscript) {
          this.onTranscript({ sender: "user", text: transcript });
        }

        if (isFinal && transcript.trim()) {
          speechRecognitionService.stop();
          this.processLocalUserQuery(transcript.trim());
        }
      },
      onError: (err) => {
        console.warn("Simulation voice recognition warning:", err);
        if (this.isListeningActive && !this.isMuted) {
          setTimeout(() => {
            if (this.state === "LISTENING") {
              this.startLocalListening();
            }
          }, 800);
        }
      },
      onEnd: () => {
        if (this.state === "LISTENING" && this.isListeningActive && !this.isMuted) {
          setTimeout(() => {
            this.startLocalListening();
          }, 400);
        }
      },
    });
  }

  /**
   * Process query in local simulation with dynamic language switching, tool grounding & multi-turn memory
   */
  async processLocalUserQuery(userQuery) {
    // Prevent acoustic echo where microphone transcribes the assistant's own greeting or recent voice
    if (
      userQuery.includes("मी जीवनसेतू सहाय्यक आहे") ||
      userQuery.includes("मी आपला जीवनसेतू") ||
      userQuery.includes("मैं JeevanSetu Assistant हूँ") ||
      userQuery.includes("I am JeevanSetu Assistant") ||
      (this.lastSpokenText && (userQuery.includes(this.lastSpokenText.slice(0, 25)) || this.lastSpokenText.includes(userQuery)))
    ) {
      console.log("Ignored acoustic echo from speaker:", userQuery);
      if (this.isListeningActive && !this.isMuted) {
        setTimeout(() => {
          if (this.state === "LISTENING" || this.state === "IDLE") {
            this.startLocalListening();
          }
        }, 600);
      }
      return;
    }

    this.setState("THINKING");

    // Strictly honor user's chosen session language (Default: 'mr' Marathi)
    const detectedLang = this.language && ["en", "hi", "mr"].includes(this.language) ? this.language : "mr";
    this.language = detectedLang;

    // Track multi-turn conversation
    this.conversationHistory = this.conversationHistory || [];
    this.conversationHistory.push({ role: "user", content: userQuery });

    // 1. Emergency Preemption Check
    if (/(हार्ट अटॅक|साप चावला|सर्पदंश|छातीत कळा|रक्तस्त्राव|बेशुद्ध|heart attack|chest pain|snake bite|unconscious|heavy bleeding|छाती में तेज दर्द|सांस फूल)/i.test(userQuery)) {
      if (this.onEmergency) {
        this.onEmergency({ text: userQuery, helpline: "108" });
      }
      if (this.onToolCall) {
        this.onToolCall({ name: "emergency_108", args: { emergency_type: userQuery } });
      }

      const emergencyMessages = {
        mr: "ही तातडीची आपत्कालीन स्थिती असू शकते! रुग्णाला अजिबात हलवू नका आणि त्वरित १०८ या मोफत शासकीय रुग्णवाहिकेला कॉल करा. जीवनसेतुने अतिदक्षता कक्ष सतर्क केला आहे.",
        hi: "यह आपातकालीन स्थिति हो सकती है! कृपया तुरंत 108 पर कॉल करें या नजदीकी अस्पताल के कैजुअल्टी विभाग में जाएं। मरीज को अकेला न छोड़ें।",
        en: "This may be a medical emergency! Please dial 108 immediately or proceed to the nearest hospital casualty department.",
      };

      const emergencyAnswer = emergencyMessages[detectedLang] || emergencyMessages.mr;
      if (this.onTranscript) {
        this.onTranscript({ sender: "assistant", text: emergencyAnswer, isFinal: true });
      }
      this.conversationHistory.push({ role: "assistant", content: emergencyAnswer });

      this.speakLocalText(emergencyAnswer, () => {
        if (this.isListeningActive && !this.isMuted) {
          this.startLocalListening();
        }
      });
      return;
    }

    // 2. Navigation / Tool Detection
    if (/(ambulance kaise|book ambulance|रुग्णवाहिका कशी बुक|ambulance page)/i.test(userQuery)) {
      if (this.onToolCall) {
        this.onToolCall({ name: "navigate_to_page", args: { target_page: "/ambulance", page_label: "Ambulance Dispatch" } });
      }
    } else if (/(doctor search|cardiologist|doctor kaise|डॉक्टर शोधा)/i.test(userQuery)) {
      if (this.onToolCall) {
        this.onToolCall({ name: "search_doctor", args: { query: userQuery } });
      }
    } else if (/(hospital|रुग्णालय|दवाखाना|gmc|mayo)/i.test(userQuery)) {
      if (this.onToolCall) {
        this.onToolCall({ name: "search_hospital", args: { query: userQuery } });
      }
    } else if (/(medicine|inventory|dawa|औषध|asv|paracetamol)/i.test(userQuery)) {
      if (this.onToolCall) {
        this.onToolCall({ name: "get_medicine_availability", args: { medicine_name: userQuery } });
      }
    } else if (/(scheme|yojana|pmjay|mjpjay|योजना)/i.test(userQuery)) {
      if (this.onToolCall) {
        this.onToolCall({ name: "get_government_scheme_information", args: { scheme_name: userQuery } });
      }
    } else if (/(anemia|dengue|blood pressure|bp|diabetes|malaria)/i.test(userQuery)) {
      if (this.onToolCall) {
        this.onToolCall({ name: "get_health_awareness_topic", args: { topic: userQuery } });
      }
    }

    let responseText = "";

    try {
      const chatRes = await aiApi.chat({
        message: userQuery,
        query: userQuery,
        language: detectedLang,
        conversationHistory: this.conversationHistory.slice(-6),
      });
      const resData = chatRes?.data || chatRes;
      const extracted = resData?.answer || resData?.response || resData?.message;
      if (extracted && typeof extracted === "string" && extracted.trim()) {
        responseText = extracted.trim();
      }
    } catch (e) {
      console.warn("Backend chat failed in voice simulation, using resilient fallback engine:", e);
    }

    if (!responseText) {
      const fb = getClientAiFallbackResponse(userQuery, detectedLang);
      responseText = fb?.answer || fb?.message || "मी जीवनसेतू आरोग्य सहाय्यक आहे. अधिक माहितीसाठी सांगा, मी ऐकत आहे.";
    }

    if (this.onTranscript) {
      this.onTranscript({ sender: "assistant", text: responseText, isFinal: true });
    }
    this.conversationHistory.push({ role: "assistant", content: responseText });

    this.speakLocalText(responseText, () => {
      if (this.isListeningActive && !this.isMuted) {
        this.startLocalListening();
      }
    });
  }

  /**
   * Speak response via robust browser SpeechSynthesis for local simulation in Marathi
   */
  speakLocalText(text, onComplete) {
    this.lastSpokenText = text;

    // Immediately stop speech recognition so speaker output is never fed back
    try {
      speechRecognitionService.stop();
    } catch (e) {}

    textToSpeechService.speak(text, {
      language: this.language || "mr",
      rate: 0.95,
      pitch: 1.0,
      onStart: () => {
        this.setState("SPEAKING");
      },
      onEnd: () => {
        this.setState("LISTENING");
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      },
      onError: (err) => {
        console.warn("TTS notice:", err);
        this.setState("LISTENING");
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      },
    });
  }

  /**
   * Stop and cleanup all resources
   */
  stop() {
    this.isListeningActive = false;
    textToSpeechService.stop();

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch {}
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }

    if (this.remoteAudioElement) {
      this.remoteAudioElement.pause();
      this.remoteAudioElement.srcObject = null;
      this.remoteAudioElement = null;
    }

    speechRecognitionService.stop();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.setState("IDLE");
  }
}

export default new OpenAIRealtimeVoiceClient();
