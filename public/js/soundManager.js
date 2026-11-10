// Learna Sound & Multi-Accent Voice AI Engine
// Handles synthetic UI audio chimes, Server Neural TTS (Edge-TTS), Web Speech API fallback, and Hands-free STT

export class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.speechSynthesis = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.audioPlayer = new Audio();
    this.recognition = null;
    this.isListening = false;
    this.speechCallback = null;
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

  // Speak AI Tutor text aloud with selected neural voice / accent
  async speak(text, lang = "en-US", voiceName = null, onEnd = null) {
    this.stopSpeaking();

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

  // Speech Recognition for Hands-Free voice interaction
  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;

      this.recognition.onresult = (event) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          console.log("[Voice Recognition Output]:", transcript);
          if (this.speechCallback) {
            this.speechCallback(transcript);
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onListeningChange) this.onListeningChange(false);
      };

      this.recognition.onerror = (e) => {
        console.warn("[Voice Recognition Error]:", e.error);
        this.isListening = false;
        if (this.onListeningChange) this.onListeningChange(false);
      };
    } catch (e) {
      console.warn("Failed to initialize Speech Recognition:", e);
    }
  }

  startListening(lang = "en-US", onRecognized = null) {
    if (!this.recognition) return;
    this.stopSpeaking();
    this.speechCallback = onRecognized;
    this.recognition.lang = lang;

    try {
      this.recognition.start();
      this.isListening = true;
      this.playCarPlayChime();
      if (this.onListeningChange) this.onListeningChange(true);
    } catch (e) {
      console.warn("Recognition already active or failed to start", e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      if (this.onListeningChange) this.onListeningChange(false);
    }
  }
}
