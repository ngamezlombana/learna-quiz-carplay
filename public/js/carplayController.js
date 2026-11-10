// Apple CarPlay Integration Controller for Learna
// Coordinates CarPlay in-vehicle display, MediaSession API, and hands-free voice answering

export class CarPlayController {
  constructor(app, soundManager) {
    this.app = app;
    this.soundManager = soundManager;
    this.isCarPlayMode = false;
    this.voiceAnsweringEnabled = true;
    this.initMediaSession();
  }

  // Setup Apple CarPlay MediaSession API
  initMediaSession() {
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "AI English Quiz Onboarding",
        artist: "Learna AI English Tutor",
        album: "Apple CarPlay Audio Learning",
        artwork: [
          { src: "/assets/images/personalize/ai-tutor-head-x.png", sizes: "192x192", type: "image/png" }
        ]
      });

      // Steering wheel next track button -> Next question
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        console.log("[CarPlay Action]: Next Track (Steering Wheel)");
        this.app.nextStep();
      });

      // Steering wheel prev track button -> Repeat question
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        console.log("[CarPlay Action]: Prev Track (Steering Wheel)");
        this.app.speakCurrentStep();
      });

      // Play/Pause button
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("[CarPlay Action]: Play");
        this.app.speakCurrentStep();
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("[CarPlay Action]: Pause");
        this.soundManager.stopSpeaking();
        this.soundManager.stopListening();
      });
    } catch (e) {
      console.warn("Failed to set MediaSession handlers:", e);
    }
  }

  updateMediaSession(stepTitle, stepIndex, totalSteps) {
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Step ${stepIndex + 1}/${totalSteps}: ${stepTitle}`,
        artist: "Learna AI English Tutor",
        album: "Apple CarPlay Hands-Free Quiz",
        artwork: [
          { src: "/assets/images/personalize/ai-tutor-head-x.png", sizes: "192x192", type: "image/png" }
        ]
      });
    } catch (e) {}
  }

  // Parse driver's voice response to find matching option
  handleVoiceAnswer(transcript, step, currentLang) {
    if (!transcript) return false;
    console.log("[CarPlay Driver Input]:", transcript);

    const text = transcript.toLowerCase();

    // Check for common navigation commands
    if (text.includes("siguiente") || text.includes("next") || text.includes("continuar") || text.includes("continue")) {
      this.app.nextStep();
      return true;
    }
    if (text.includes("repetir") || text.includes("repeat") || text.includes("again") || text.includes("de nuevo")) {
      this.app.speakCurrentStep();
      return true;
    }

    // Step-specific option matching
    if (step.type === "statement") {
      if (text.includes("verdadero") || text.includes("true") || text.includes("cierto") || text.includes("sí") || text.includes("yes")) {
        this.app.selectAnswer("true");
        return true;
      }
      if (text.includes("parcial") || text.includes("partially") || text.includes("a veces") || text.includes("más o menos")) {
        this.app.selectAnswer("partially_true");
        return true;
      }
      if (text.includes("falso") || text.includes("false") || text.includes("no") || text.includes("para nada")) {
        this.app.selectAnswer("false");
        return true;
      }
    }

    if (step.options && Array.isArray(step.options)) {
      // Check options by spokenValue, label, or option number
      for (let i = 0; i < step.options.length; i++) {
        const opt = step.options[i];
        const optLabel = (typeof opt.label === "object" ? opt.label[currentLang] || opt.label.en : opt.label || "").toLowerCase();
        const spoken = (opt.spokenValue || opt.id || "").toLowerCase();

        // Direct phrase match
        if (text.includes(spoken) || text.includes(optLabel) || text.includes(opt.id.toLowerCase())) {
          this.app.selectAnswer(opt.id);
          return true;
        }

        // Match "option 1", "opción 1", "primera", "first"
        const numWords = ["one", "uno", "primera", "first", "two", "dos", "segunda", "second", "three", "tres", "tercera", "third", "four", "cuatro", "cuarta", "fourth"];
        if (text.includes(`option ${i + 1}`) || text.includes(`opción ${i + 1}`) || text.includes(`${i + 1}`) || text.includes(numWords[i * 4]) || text.includes(numWords[i * 4 + 1])) {
          this.app.selectAnswer(opt.id);
          return true;
        }
      }
    }

    return false;
  }
}

