// Learna Sound & Multi-Accent Voice AI Engine with Automotive VAD
// Handles synthetic UI audio chimes, Server Neural TTS (Edge-TTS), Web Speech API fallback,
// and 100% Hands-Free Driving Voice Activity Detection (VAD) with researched 2.0s trailing silence auto-send.

export class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.speechSynthesis = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.audioPlayer = new Audio();
    this.recognition = null;

    // VAD & Hands-Free Configuration
    this.silenceThresholdMs = 2000; // 2.0 seconds: Automotive NHTSA & CarPlay benchmark
    this.isListening = false;
    this.isHandsFreeMode = true;
    this.isSubmitting = false;
    this.shouldKeepListening = false;
    this.speechState = "idle"; // "idle" | "listening" | "speaking" | "silence_countdown" | "submitting"

    this.accumulatedTranscript = "";
    this.currentInterim = "";
    this.silenceTimer = null;
    this.silenceTicker = null;
    this.silenceDeadline = 0;

    // Callbacks
    this.speechCallback = null;
    this.onInterimCallback = null;
    this.onSilenceTickCallback = null;
    this.onStateChangeCallback = null;
    this.onListeningChange = null;

    this.initAudioContext();
    this.initSpeechRecognition();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  }

  resumeAudioContext() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playClick() {
    this.resumeAudioContext();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  playSuccess() {
    this.resumeAudioContext();
    if (!this.audioCtx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  playCarPlayChime() {
    this.resumeAudioContext();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  // Soft cue when microphone opens for hands-free driver listening turn
  playMicOpenChime() {
    this.resumeAudioContext();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.08); // C6

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  // Affirmative chime when 2.0s silence ends and auto-send occurs
  playSendChime() {
    this.resumeAudioContext();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const notes = [587.33, 880.0]; // D5 -> A5
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.13, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.18);
      });
    } catch (e) {}
  }

  setSilenceThreshold(ms) {
    this.silenceThresholdMs = Math.max(1000, Math.min(5000, ms));
    console.log(`[VAD] Trailing silence threshold set to ${this.silenceThresholdMs}ms`);
  }

  // Speak AI Tutor text aloud with selected neural voice / accent
  async speak(text, lang = "en-US", voiceName = null, onEnd = null) {
    this.stopSpeaking();
    this.stopListening();

    // 1. Try Server-Side Neural TTS (edge-tts) for studio-quality regional accents
    if (voiceName) {
      try {
        const resp = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: voiceName })
        });

        if (resp.ok) {
          const blob = await resp.blob();
          const audioUrl = URL.createObjectURL(blob);
          this.audioPlayer.src = audioUrl;
          this.audioPlayer.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (onEnd) onEnd();
          };
          this.audioPlayer.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            this.speakWebSpeech(text, lang, onEnd);
          };
          await this.audioPlayer.play();
          return;
        }
      } catch (e) {
        console.warn("Neural TTS fetch failed, using Web Speech fallback:", e);
      }
    }

    // 2. Fallback to Web Speech API
    this.speakWebSpeech(text, lang, onEnd);
  }

  speakWebSpeech(text, lang = "en-US", onEnd = null) {
    if (!this.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = this.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) || v.lang === lang);
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Web Speech error:", e);
      if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
    }
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  // Initialize Speech Recognition with streaming & VAD
  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateState("listening");
      };

      this.recognition.onresult = (event) => {
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            this.accumulatedTranscript += " " + item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        this.currentInterim = interimText;
        const fullCurrent = (this.accumulatedTranscript + " " + this.currentInterim).trim();

        if (fullCurrent.length > 0) {
          this.updateState("speaking");
          if (this.onInterimCallback) {
            this.onInterimCallback(interimText, fullCurrent);
          }

          // Restart the trailing silence countdown on every audio chunk
          this.restartSilenceCountdown(fullCurrent);
        }
      };

      this.recognition.onerror = (e) => {
        if (e.error === "no-speech") {
          // Normal background quiet; keep listening if hands-free is active
          return;
        }
        console.warn("[Voice Recognition Error]:", e.error);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          this.shouldKeepListening = false;
          this.stopListening();
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // If hands-free is still active and we didn't submit, seamlessly restart recognition
        if (this.shouldKeepListening && !this.isSubmitting) {
          try {
            this.recognition.start();
            this.isListening = true;
          } catch (e) {
            this.updateState("idle");
          }
        } else {
          this.updateState("idle");
        }
      };

    } catch (e) {
      console.warn("Failed to initialize Speech Recognition:", e);
    }
  }

  updateState(state, details = {}) {
    this.speechState = state;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state, details);
    }
    if (this.onListeningChange) {
      this.onListeningChange(state !== "idle" && state !== "submitting");
    }
  }

  // Adaptive Silence Countdown (Auto-send after 2.0s of silence)
  restartSilenceCountdown(currentText) {
    this.clearSilenceTimers();

    this.silenceDeadline = Date.now() + this.silenceThresholdMs;
    this.updateState("silence_countdown", {
      remainingMs: this.silenceThresholdMs,
      totalMs: this.silenceThresholdMs,
      percent: 100,
      text: currentText
    });

    // High frequency ticker for smooth UI progress bar
    this.silenceTicker = setInterval(() => {
      const remaining = Math.max(0, this.silenceDeadline - Date.now());
      const percent = (remaining / this.silenceThresholdMs) * 100;

      if (this.onSilenceTickCallback) {
        this.onSilenceTickCallback(remaining, this.silenceThresholdMs, percent);
      }

      if (remaining <= 0) {
        this.clearSilenceTimers();
      }
    }, 50);

    // Main timeout that triggers auto-submit
    this.silenceTimer = setTimeout(() => {
      this.clearSilenceTimers();
      this.finishAndSubmit(currentText);
    }, this.silenceThresholdMs);
  }

  clearSilenceTimers() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.silenceTicker) {
      clearInterval(this.silenceTicker);
      this.silenceTicker = null;
    }
  }

  finishAndSubmit(textToSubmit) {
    const finalClean = textToSubmit.trim();
    if (!finalClean) {
      this.accumulatedTranscript = "";
      this.currentInterim = "";
      this.updateState("listening");
      return;
    }

    console.log(`[VAD Auto-Send]: 2.0s silence detected. Auto-submitting: "${finalClean}"`);
    this.isSubmitting = true;
    this.shouldKeepListening = false;
    this.updateState("submitting", { text: finalClean });

    // Play subtle affirmative send chime
    this.playSendChime();

    // Safely stop recognition
    try {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }
    } catch (e) {}

    this.isListening = false;

    // Dispatch final recognized transcript to conversation manager
    if (this.speechCallback) {
      const cb = this.speechCallback;
      this.speechCallback = null;
      cb(finalClean);
    }

    this.accumulatedTranscript = "";
    this.currentInterim = "";
    this.isSubmitting = false;
  }

  // Start continuous hands-free listening with silence auto-send
  startListening(lang = "en-US", onRecognized = null, options = {}) {
    if (!this.recognition) return;

    this.stopSpeaking();
    this.clearSilenceTimers();

    this.speechCallback = onRecognized;
    this.onInterimCallback = options.onInterim || null;
    this.onSilenceTickCallback = options.onSilenceTick || null;
    this.onStateChangeCallback = options.onStateChange || null;

    if (options.silenceThresholdMs) {
      this.silenceThresholdMs = options.silenceThresholdMs;
    }

    this.accumulatedTranscript = "";
    this.currentInterim = "";
    this.isSubmitting = false;
    this.shouldKeepListening = true;
    this.recognition.lang = lang;

    try {
      this.recognition.start();
      this.isListening = true;
      this.playMicOpenChime();
      this.updateState("listening");
    } catch (e) {
      // If already started, smoothly update lang & continue
      this.isListening = true;
      this.updateState("listening");
    }
  }

  stopListening() {
    this.shouldKeepListening = false;
    this.clearSilenceTimers();

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
    this.accumulatedTranscript = "";
    this.currentInterim = "";
    this.updateState("idle");
  }

  abortListening() {
    this.shouldKeepListening = false;
    this.clearSilenceTimers();
    this.speechCallback = null;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.isListening = false;
    }
    this.accumulatedTranscript = "";
    this.currentInterim = "";
    this.updateState("idle");
  }
}
