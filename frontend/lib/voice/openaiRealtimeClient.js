/**
 * ==============================================================================
 * JEEVANSETU OPENAI REALTIME WEBRTC VOICE CLIENT
 * ==============================================================================
 * Production WebRTC audio streaming manager with ephemeral session tokens,
 * automatic tool calling, real-time waveform analysis, and seamless barge-in interruption.
 */

import { aiApi } from "../api";
import { getClientAiFallbackResponse } from "../services/clientAiFallback";

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
    this.isMuted = false;
    this.isDevSimulation = false;

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
    this.language = language;
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
        voice,
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
        this.setState("LISTENING");
        this.startLocalSimulationMode();
        return;
      }

      // 5. Connect via WebRTC directly to OpenAI Realtime endpoint
      await this.initiateWebRTCConnection(ephemeralKey, sessionData.model || "gpt-4o-realtime-preview");
    } catch (err) {
      console.warn("Realtime WebRTC voice startup error, attempting graceful fallback:", err);
      if (this.onError) this.onError(err.message || "Failed to start voice session");
      this.setState("ERROR");
      this.stop();
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

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
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
    if (this.onTranscript) {
      const welcomeMap = {
        mr: "नमस्कार! मी आपला जीवनसेतू रिअल-टाइम व्हॉईस सहाय्यक आहे. मी आपल्याला महाराष्ट्रातील डॉक्टर, १०८ रुग्णवाहिका, शासकीय योजना आणि औषध साठ्याविषयी अचूक माहिती देऊ शकतो. विचारा.",
        hi: "नमस्ते! मैं आपका जीवनसेतु रियल-टाइम वॉइस असिस्टेंट हूँ। मैं आपको महाराष्ट्र के डॉक्टरों, 108 एम्बुलेंस और सरकारी योजनाओं की सटीक जानकारी दे सकता हूँ। पूछिए।",
        en: "Hello! I am your JeevanSetu Realtime Voice Assistant. I can help you find verified doctors, 108 ambulances, and government schemes in Maharashtra. How can I help you today?",
      };

      const welcomeText = welcomeMap[this.language] || welcomeMap.mr;
      this.onTranscript({
        sender: "assistant",
        text: welcomeText,
        isFinal: true,
      });

      this.speakLocalText(welcomeText);
    }
  }

  /**
   * Speak response via browser SpeechSynthesis for local simulation
   */
  speakLocalText(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { mr: "mr-IN", hi: "hi-IN", en: "en-IN" };
    utterance.lang = langMap[this.language] || "mr-IN";
    utterance.rate = 1.0;

    utterance.onstart = () => this.setState("SPEAKING");
    utterance.onend = () => this.setState("LISTENING");
    utterance.onerror = () => this.setState("LISTENING");

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop and cleanup all resources
   */
  stop() {
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

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.setState("IDLE");
  }
}

export default new OpenAIRealtimeVoiceClient();
