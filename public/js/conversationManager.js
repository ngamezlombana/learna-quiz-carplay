// Learna AI Advanced Conversational Dialogue Manager with Automotive VAD
// Multi-accent English speaking practice with real-time streaming feedback,
// Apple CarPlay in-dash support, and 100% Hands-Free Driving Dialogue with 2.0s silence auto-send.

const DEFAULT_ACCENTS = [
  {
    id: "en-US",
    name: "American English",
    flag: "🇺🇸",
    tutor: "Emma Davis",
    city: "New York, USA",
    voice: "en-US-JennyNeural",
    avatar: "./assets/images/personalize/ai-tutor-head-x.png",
    description: "General American. Energetic, clear rhotic pronunciation, everyday idioms.",
    sampleGreeting: "Hey there! I'm Emma from New York. Ready to practice natural American English today?"
  },
  {
    id: "en-GB",
    name: "British English (RP)",
    flag: "🇬🇧",
    tutor: "Oliver Wright",
    city: "London, UK",
    voice: "en-GB-SoniaNeural",
    avatar: "./assets/images/survey-onboarding/proficiency/advanced.png",
    description: "Received Pronunciation. Polite, articulate, rich vocabulary and British idioms.",
    sampleGreeting: "Hello! I'm Oliver from London. It's brilliant to meet you. Let's sharpen your British English!"
  },
  {
    id: "en-AU",
    name: "Australian English",
    flag: "🇦🇺",
    tutor: "Natasha Hayes",
    city: "Sydney, Australia",
    voice: "en-AU-NatashaNeural",
    avatar: "./assets/images/survey-onboarding/proficiency/intermediate.png",
    description: "Aussie accent. Upbeat, warm inflection, casual expressions like 'no worries' and 'too easy'.",
    sampleGreeting: "G'day! I'm Natasha from Sydney. No worries at all, we'll have you speaking fluent Aussie English in no time!"
  },
  {
    id: "en-IE",
    name: "Irish English",
    flag: "🇮🇪",
    tutor: "Emily O'Connor",
    city: "Dublin, Ireland",
    voice: "en-IE-EmilyNeural",
    avatar: "./assets/images/survey-onboarding/proficiency/pre-intermediate.png",
    description: "Dublin cadence. Musical melodic rhythm, welcoming tone, distinctive Irish turns of phrase.",
    sampleGreeting: "Hi there! I'm Emily from Dublin. What's the craic? Let's have a grand chat in English today."
  },
  {
    id: "en-IN",
    name: "Indian English",
    flag: "🇮🇳",
    tutor: "Neerja Sharma",
    city: "Bangalore, India",
    voice: "en-IN-NeerjaNeural",
    avatar: "./assets/images/survey-onboarding/proficiency/proficient.png",
    description: "Clear South Asian English. Fast syllable-timed rhythm, ideal for global tech and business.",
    sampleGreeting: "Namaste and hello! I am Neerja from Bangalore. Let us practice English for global communication and business!"
  },
  {
    id: "en-CA",
    name: "Canadian English",
    flag: "🇨🇦",
    tutor: "Liam Tremblay",
    city: "Toronto, Canada",
    voice: "en-CA-ClaraNeural",
    avatar: "./assets/images/survey-onboarding/proficiency/upper-intermediate.png",
    description: "Canadian accent. Crisp vowels, friendly and encouraging, Canadian phrasing.",
    sampleGreeting: "Hi there, welcome! I'm Liam from Toronto. Excited to practice conversational English with you today, eh?"
  },
  {
    id: "en-ZA",
    name: "South African English",
    flag: "🇿🇦",
    tutor: "Leah Van Zyl",
    city: "Cape Town, South Africa",
    voice: "en-ZA-LeahNeural",
    avatar: "./assets/images/survey-onboarding/age/age-25-34.png",
    description: "South African cadence. Cosmopolitan rhythm, crisp consonants, colorful expressions.",
    sampleGreeting: "Howzit! I'm Leah from Cape Town. It's lekker to have you here. Let's get talking!"
  }
];

export class ConversationManager {
  constructor(app, soundManager) {
    this.app = app;
    this.soundManager = soundManager;
    this.accents = DEFAULT_ACCENTS;
    this.currentAccentId = "en-US";
    this.currentScenario = "carplay"; // Default to CarPlay driving scenario
    this.messages = [];
    this.isAiThinking = false;

    // Automotive Hands-Free Dialogue State
    this.isHandsFreeActive = true;
    this.isPaused = false;
    this.silenceThresholdMs = 2000; // 2.0s NHTSA & automotive standard
    this.vadState = "idle"; // "idle" | "listening" | "speaking" | "silence_countdown" | "thinking" | "paused"
    this.liveInterimText = "";
    this.liveFullText = "";
    this.silenceRemainingMs = 2000;
    this.silencePercent = 100;

    this.scenarios = [
      { id: "carplay", name: { es: "🚗 Conducción & Viaje", en: "🚗 Commute & Drive" }, prompt: "Practicing English hands-free while driving" },
      { id: "casual", name: { es: "💬 Charla Casual", en: "💬 Casual Chat" }, prompt: "Casual daily conversation" },
      { id: "coffee", name: { es: "☕ En la Cafetería", en: "☕ Coffee Shop" }, prompt: "Ordering food and drinks at a café" },
      { id: "interview", name: { es: "💼 Entrevista de Trabajo", en: "💼 Job Interview" }, prompt: "Professional job interview simulation" },
      { id: "travel", name: { es: "✈️ Aeropuerto y Viajes", en: "✈️ Travel & Airport" }, prompt: "Checking in at an international airport" },
      { id: "tech", name: { es: "🧠 Debate sobre IA y Tecnología", en: "🧠 AI & Tech Debate" }, prompt: "Discussing future technology and AI" }
    ];

    this.loadAccents();
  }

  async loadAccents() {
    try {
      const resp = await fetch("/api/accents");
      if (resp.ok) {
        this.accents = await resp.json();
      }
    } catch (e) {
      // Keep DEFAULT_ACCENTS
    }
  }

  getCurrentAccent() {
    return this.accents.find(a => a.id === this.currentAccentId) || this.accents[0];
  }

  setAccent(accentId) {
    this.currentAccentId = accentId;
    const accent = this.getCurrentAccent();
    this.soundManager.playClick();

    this.messages.push({
      sender: "ai",
      text: accent.sampleGreeting,
      tutor: accent.tutor,
      flag: accent.flag,
      voice: accent.voice,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    this.render();
    this.soundManager.speak(accent.sampleGreeting, accent.id, accent.voice, () => {
      if (this.isHandsFreeActive && !this.isPaused) {
        this.startHandsFreeListening();
      }
    });
  }

  setScenario(scenarioId) {
    this.currentScenario = scenarioId;
    this.soundManager.playClick();
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    const accent = this.getCurrentAccent();

    const text = `Let's practice: ${scenario.name.en}! How would you like to start?`;
    this.messages.push({
      sender: "ai",
      text,
      tutor: accent.tutor,
      flag: accent.flag,
      voice: accent.voice,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    this.render();
    this.soundManager.speak(text, accent.id, accent.voice, () => {
      if (this.isHandsFreeActive && !this.isPaused) {
        this.startHandsFreeListening();
      }
    });
  }

  setSilenceThreshold(ms) {
    this.silenceThresholdMs = ms;
    this.soundManager.setSilenceThreshold(ms);
    this.render();
  }

  cycleSilenceThreshold() {
    const options = [1500, 2000, 2500];
    const currentIndex = options.indexOf(this.silenceThresholdMs);
    const nextMs = options[(currentIndex + 1) % options.length];
    this.setSilenceThreshold(nextMs);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.soundManager.stopSpeaking();
      this.soundManager.stopListening();
      this.vadState = "paused";
    } else {
      this.vadState = "idle";
      this.startHandsFreeListening();
    }
    this.render();
  }

  // Client-side intelligent conversation generator fallback
  generateLocalResponse(userText, accentId, scenario) {
    const textLower = userText.toLowerCase().trim();
    const accent = this.getCurrentAccent();

    const flavor = {
      "en-US": { cheer: "Awesome!", agree: "Totally makes sense." },
      "en-GB": { cheer: "Brilliant!", agree: "Quite right." },
      "en-AU": { cheer: "Too easy, mate!", agree: "Spot on, no worries." },
      "en-IE": { cheer: "Grand so!", agree: "Dead right." },
      "en-IN": { cheer: "Superb!", agree: "That is absolutely correct." },
      "en-CA": { cheer: "Great job, eh!", agree: "For sure." },
      "en-ZA": { cheer: "Lekker!", agree: "Awesome vibe." }
    }[accentId] || { cheer: "Great!", agree: "I see." };

    let feedback = null;
    if (textLower.includes("i have ") && textLower.includes(" years")) {
      feedback = "💡 Natural English Tip: In English we say 'I am X years old', rather than 'I have X years'.";
    } else if (textLower.includes("i am agree")) {
      feedback = "💡 Grammar Tip: We say 'I agree', not 'I am agree'.";
    } else if (textLower.includes("make a question")) {
      feedback = "💡 Collocation Tip: We say 'ask a question', not 'make a question'.";
    } else if (textLower.includes("depend of")) {
      feedback = "💡 Preposition Tip: It's 'depends on', rather than 'depends of'.";
    }

    let reply = "";
    if (["hello", "hi", "hey", "hola", "good morning", "good afternoon"].some(g => textLower.includes(g))) {
      reply = `${flavor.cheer} Hello! It's fantastic to chat with you today while driving. ${flavor.agree} What is on your mind today?`;
    } else if (["how are you", "what's up", "how do you do"].some(q => textLower.includes(q))) {
      reply = `I'm doing wonderful, thank you for asking! I'm really excited to practice with you. How has your drive been so far?`;
    } else if (scenario === "carplay") {
      reply = `${flavor.cheer} Hands-free conversation is great for building real-world reflex. ${flavor.agree} Tell me, what do you usually listen to when you're driving?`;
    } else if (scenario === "coffee") {
      reply = `${flavor.cheer} Welcome to the café! Would you like a hot latte, an iced Americano, or perhaps some pastry to go with it?`;
    } else if (scenario === "interview") {
      reply = `Thank you for sharing that. ${flavor.agree} Could you describe a challenging project you worked on recently, and how you solved it?`;
    } else if (scenario === "travel") {
      reply = `Safe travels! ${flavor.cheer} May I see your passport and boarding pass, and do you have any luggage to check in today?`;
    } else if (userText.split(" ").length < 3) {
      reply = `${flavor.agree} Could you tell me a little bit more about that? Try adding one or two more sentences!`;
    } else {
      const generic = [
        `${flavor.cheer} That's a great point! ${flavor.agree} What made you think about that, and how does that affect your daily routine?`,
        `I really like how you expressed that. ${flavor.agree} If you had to explain that to a friend, what would be the most important detail?`,
        `${flavor.cheer} You're communicating very clearly. Let's take it a step further: what do you think is the biggest advantage of that?`
      ];
      reply = generic[Math.floor(Math.random() * generic.length)];
    }

    return {
      reply,
      tutor: accent.tutor,
      accent: accent.name,
      flag: accent.flag,
      voice: accent.voice,
      feedback
    };
  }

  // Continuous Hands-Free Listening Loop with 2.0s Trailing Silence Detection
  startHandsFreeListening() {
    if (this.isPaused) return;

    this.vadState = "listening";
    this.liveInterimText = "";
    this.liveFullText = "";
    this.silenceRemainingMs = this.silenceThresholdMs;
    this.silencePercent = 100;
    this.updateVadUi();

    this.soundManager.startListening(this.currentAccentId, (finalTranscript) => {
      // 2.0s silence detected: auto-send without button press!
      this.vadState = "thinking";
      this.liveInterimText = "";
      this.liveFullText = "";
      this.updateVadUi();
      this.sendMessage(finalTranscript);
    }, {
      silenceThresholdMs: this.silenceThresholdMs,
      onInterim: (interim, full) => {
        this.vadState = "speaking";
        this.liveInterimText = interim;
        this.liveFullText = full;
        this.updateVadUi();
      },
      onSilenceTick: (remainingMs, totalMs, percent) => {
        this.vadState = "silence_countdown";
        this.silenceRemainingMs = remainingMs;
        this.silencePercent = percent;
        this.updateVadUi();
      },
      onStateChange: (state) => {
        if (state === "idle" && !this.isAiThinking && !this.isPaused && this.isHandsFreeActive) {
          this.vadState = "idle";
          this.updateVadUi();
        }
      }
    });
  }

  // Fast selective DOM update for 60 FPS hands-free VAD animations without repainting the whole interface
  updateVadUi() {
    const carplayVad = document.getElementById("carplay-vad-box");
    const mobileVad = document.getElementById("mobile-vad-box");

    const content = this.renderVadWidgetHtml();

    if (carplayVad) {
      carplayVad.innerHTML = content;
    }
    if (mobileVad) {
      mobileVad.innerHTML = content;
    }
  }

  renderVadWidgetHtml() {
    const isCarPlay = this.app.viewMode === "carplay";
    const accent = this.getCurrentAccent();
    const secondsLeft = (this.silenceRemainingMs / 1000).toFixed(1);

    if (this.isPaused) {
      return `
        <div class="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-fade-in">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">⏸️</span>
            <div>
              <p class="font-bold text-xs ${isCarPlay ? 'text-white' : 'text-amber-900'}">Diálogo Manos Libres en Pausa</p>
              <p class="text-[11px] ${isCarPlay ? 'text-neutral-400' : 'text-amber-700'}">Pulsa 'Reanudar' en pantalla o volante para continuar</p>
            </div>
          </div>
          <button id="vad-resume-btn" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-900 font-extrabold text-xs shadow-md transition-all active:scale-95">
            ▶️ Reanudar
          </button>
        </div>
      `;
    }

    if (this.vadState === "speaking") {
      return `
        <div class="w-full flex flex-col gap-2 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/40 text-blue-200 animate-fade-in">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 h-5">
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
                <span class="wave-bar"></span>
              </div>
              <span class="text-xs font-bold ${isCarPlay ? 'text-[#0A84FF]' : 'text-primary-base'} uppercase tracking-wide">
                🗣️ Escuchándote hablar en inglés...
              </span>
            </div>
            <span class="text-[11px] text-neutral-400">Silencio auto-envío: ${(this.silenceThresholdMs/1000).toFixed(1)}s</span>
          </div>
          <p class="text-sm md:text-base font-semibold ${isCarPlay ? 'text-white' : 'text-neutral-900'} italic">
            "${this.liveFullText || this.liveInterimText}"
          </p>
        </div>
      `;
    }

    if (this.vadState === "silence_countdown") {
      return `
        <div class="w-full flex flex-col gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 animate-fade-in">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-xs font-extrabold ${isCarPlay ? 'text-emerald-400' : 'text-emerald-800'}">
                ⚡ Silencio detectado: Enviando en ${secondsLeft}s...
              </span>
            </div>
            <span class="text-[10px] text-neutral-400">Estándar NHTSA Conducción</span>
          </div>

          <!-- Countdown Progress Bar -->
          <div class="w-full bg-neutral-700/50 h-2 rounded-full overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-400 to-[#0A84FF] h-full transition-all duration-75 ease-linear rounded-full" style="width: ${this.silencePercent}%"></div>
          </div>

          <p class="text-xs md:text-sm font-medium ${isCarPlay ? 'text-neutral-200' : 'text-neutral-700'} truncate">
            "${this.liveFullText || this.liveInterimText}"
          </p>
        </div>
      `;
    }

    if (this.vadState === "thinking" || this.isAiThinking) {
      return `
        <div class="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1C1C1E] border border-neutral-700 text-white animate-fade-in">
          <div class="flex items-center gap-3">
            <span class="text-lg">🧠</span>
            <div>
              <p class="font-bold text-xs text-white">${accent.tutor} está respondiendo...</p>
              <p class="text-[11px] text-neutral-400">Generando respuesta con acento ${accent.name}</p>
            </div>
          </div>
          <div class="flex gap-1.5 items-center">
            <span class="w-2 h-2 bg-[#0A84FF] rounded-full animate-bounce"></span>
            <span class="w-2 h-2 bg-[#0A84FF] rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-2 h-2 bg-[#0A84FF] rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      `;
    }

    // Default "listening" state (waiting for driver to begin speaking)
    return `
      <div class="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] text-white">
        <div class="flex items-center gap-3">
          <div class="relative w-8 h-8 rounded-full bg-[#0A84FF]/20 border border-[#0A84FF] flex items-center justify-center pulse-glow-carplay">
            <span class="text-sm">🎙️</span>
          </div>
          <div>
            <p class="font-extrabold text-xs text-white">
              Manos Libres Activo · Escuchando
            </p>
            <p class="text-[11px] text-neutral-400">
              Habla en inglés; al hacer una pausa de ${(this.silenceThresholdMs/1000).toFixed(1)}s se envía solo
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
            🟢 AUTO-SEND
          </span>
        </div>
      </div>
    `;
  }

  async sendMessage(userText) {
    if (!userText || !userText.trim()) return;

    this.soundManager.stopSpeaking();
    this.soundManager.stopListening();

    const accent = this.getCurrentAccent();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    this.messages.push({
      sender: "user",
      text: userText,
      time: timeStr
    });

    this.isAiThinking = true;
    this.vadState = "thinking";
    this.render();

    let data = null;
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          accent: this.currentAccentId,
          scenario: this.currentScenario,
          history: this.messages.slice(-6)
        })
      });

      if (resp.ok) {
        data = await resp.json();
      }
    } catch (e) {
      // Fallback
    }

    if (!data) {
      data = this.generateLocalResponse(userText, this.currentAccentId, this.currentScenario);
    }

    this.messages.push({
      sender: "ai",
      text: data.reply,
      tutor: data.tutor,
      flag: data.flag,
      voice: data.voice,
      feedback: data.feedback,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    this.isAiThinking = false;
    this.render();

    const lastAiMsg = this.messages[this.messages.length - 1];
    if (lastAiMsg && lastAiMsg.sender === "ai") {
      this.soundManager.speak(lastAiMsg.text, this.currentAccentId, lastAiMsg.voice, () => {
        // Continuous hands-free loop: automatically listen again after AI completes speech!
        if (this.isHandsFreeActive && !this.isPaused) {
          this.startHandsFreeListening();
        }
      });
    }
  }

  render() {
    const container = document.getElementById("step-content");
    if (!container) return;

    if (this.app.viewMode === "carplay") {
      this.renderCarPlayDialogue(container);
    } else {
      this.renderMobileDialogue(container);
    }

    this.bindDialogueEvents();
  }

  renderMobileDialogue(container) {
    const accent = this.getCurrentAccent();

    let html = `
      <div class="w-full max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)] animate-fade-in">
        
        <!-- Header with Tutor Info, Accents, and Hands-Free Toggle -->
        <div class="bg-white border border-neutral-200 rounded-2xl p-4 mb-3 shadow-sm flex flex-col gap-3">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="relative">
                <img src="${accent.avatar}" alt="${accent.tutor}" class="w-12 h-12 rounded-full border-2 border-primary-base object-cover bg-neutral-50" />
                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div class="flex flex-col text-left">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-neutral-900 text-base">${accent.tutor}</span>
                  <span class="text-xs bg-primary-100 text-primary-base font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>${accent.flag}</span>
                    <span>${accent.name}</span>
                  </span>
                </div>
                <span class="text-xs text-neutral-500">${accent.city} · ${accent.description}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button id="silence-config-btn" class="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all" title="Ajustar tiempo de silencio de auto-envío">
                ⏱️ ${(this.silenceThresholdMs / 1000).toFixed(1)}s
              </button>
              <button id="exit-dialogue-btn" class="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all">
                ⬅️ Test
              </button>
            </div>
          </div>

          <!-- Accents Horizontal Bar -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-neutral-100">
            <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider flex-shrink-0">Acentos:</span>
    `;

    this.accents.forEach(acc => {
      const isSelected = acc.id === this.currentAccentId;
      html += `
        <button class="accent-select-btn flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
          isSelected
            ? "border-primary-base bg-primary-50 text-primary-base shadow-sm scale-105"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
        }" data-accent="${acc.id}">
          <span class="text-sm">${acc.flag}</span>
          <span>${acc.name.split(" ")[0]}</span>
        </button>
      `;
    });

    html += `
          </div>

          <!-- Topics Horizontal Bar -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-neutral-100">
            <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider flex-shrink-0">Tema:</span>
    `;

    this.scenarios.forEach(sc => {
      const isSelected = sc.id === this.currentScenario;
      html += `
        <button class="scenario-select-btn flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          isSelected ? "bg-neutral-900 text-white font-bold" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
        }" data-scenario="${sc.id}">
          ${sc.name[this.app.currentLang] || sc.name.en}
        </button>
      `;
    });

    html += `
          </div>
        </div>

        <!-- Chat Conversation Messages -->
        <div id="chat-messages" class="flex-1 overflow-y-auto bg-neutral-50/70 border border-neutral-200 rounded-2xl p-4 flex flex-col gap-3.5 mb-3">
    `;

    if (this.messages.length === 0) {
      html += `
        <div class="flex flex-col items-center justify-center h-full text-center py-10">
          <span class="text-4xl mb-2">🚗</span>
          <p class="font-bold text-neutral-800 text-base">¡Diálogo Continuo Manos Libres con ${accent.tutor}!</p>
          <p class="text-xs text-neutral-500 max-w-sm mt-1">
            No necesitas pulsar Enviar. Habla libremente en inglés y el sistema enviará tu respuesta tras <strong>${(this.silenceThresholdMs/1000).toFixed(1)} segundos de silencio</strong>.
          </p>
        </div>
      `;
    }

    this.messages.forEach((msg, idx) => {
      if (msg.sender === "ai") {
        html += `
          <div class="flex flex-col items-start gap-1 max-w-[85%] self-start animate-fade-in">
            <div class="flex items-center gap-1.5 text-xs text-neutral-500 px-1">
              <span>${msg.flag} ${msg.tutor}</span>
              <span class="text-[10px] text-neutral-400">· ${msg.time}</span>
            </div>
            <div class="bg-white border border-neutral-200 text-neutral-900 rounded-2xl rounded-tl-sm p-3.5 shadow-sm relative group">
              <p class="text-sm sm:text-base leading-relaxed">${msg.text}</p>
              <button class="replay-btn mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary-base hover:underline" data-idx="${idx}">
                <span>🔊</span> <span>Repetir</span>
              </button>
            </div>
            ${msg.feedback ? `
              <div class="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-2.5 mt-1 shadow-sm">
                ${msg.feedback}
              </div>
            ` : ""}
          </div>
        `;
      } else {
        html += `
          <div class="flex flex-col items-end gap-1 max-w-[85%] self-end animate-fade-in">
            <span class="text-[10px] text-neutral-400 px-1">Tú · ${msg.time}</span>
            <div class="bg-primary-base text-white rounded-2xl rounded-tr-sm p-3.5 shadow-sm">
              <p class="text-sm sm:text-base leading-relaxed">${msg.text}</p>
            </div>
          </div>
        `;
      }
    });

    html += `
        </div>

        <!-- Dynamic Hands-Free VAD Bar -->
        <div id="mobile-vad-box" class="mb-2">
          ${this.renderVadWidgetHtml()}
        </div>

        <!-- Input Bar with Hands-Free Controls -->
        <div class="bg-white border border-neutral-200 rounded-2xl p-2.5 shadow-md flex items-center gap-2">
          <button id="pause-toggle-btn" class="px-3 py-2.5 rounded-xl ${this.isPaused ? 'bg-amber-500 text-neutral-900' : 'bg-neutral-100 text-neutral-700'} text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1" title="Pausar o reanudar el diálogo continuo manos libres">
            <span>${this.isPaused ? '▶️' : '⏸️'}</span>
            <span class="hidden sm:inline">${this.isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>

          <input type="text" id="chat-input" placeholder="Habla libremente en inglés (auto-envío) o escribe..." class="flex-1 p-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-base text-neutral-800" />

          <button id="send-chat-btn" class="px-4 py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-1.5" title="Enviar manualmente">
            <span>Enviar</span>
            <span>➔</span>
          </button>
        </div>

      </div>
    `;

    container.innerHTML = html;

    const chatBox = document.getElementById("chat-messages");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }

  renderCarPlayDialogue(container) {
    const accent = this.getCurrentAccent();
    const lastAi = this.messages.filter(m => m.sender === "ai").slice(-1)[0] || { text: accent.sampleGreeting, tutor: accent.tutor, flag: accent.flag };
    const lastUser = this.messages.filter(m => m.sender === "user").slice(-1)[0];

    let html = `
      <div class="carplay-infotainment w-full max-w-4xl mx-auto bg-[#0A0A0C] text-white rounded-3xl border border-[#2C2C2E] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[480px]">
        
        <!-- Apple CarPlay Side Dock -->
        <div class="carplay-dock w-full md:w-20 bg-[#1C1C1E] border-b md:border-b-0 md:border-r border-[#2C2C2E] flex md:flex-col items-center justify-between p-3 flex-shrink-0">
          <div class="flex md:flex-col items-center gap-2">
            <span class="text-sm font-bold text-neutral-300">12:45</span>
            <div class="flex items-center gap-1 text-[10px] text-neutral-400">
              <span>5G</span>
              <span>📶</span>
            </div>
          </div>

          <!-- Home Button (Back to Quiz) -->
          <button id="exit-dialogue-btn" class="w-12 h-12 rounded-full border-2 border-white/80 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 active:scale-90 transition-transform" title="Volver al Quiz">
            <div class="w-5 h-5 rounded-[4px] border-2 border-white"></div>
          </button>

          <!-- Quick Pause/Resume Dock Button -->
          <button id="carplay-dock-pause-btn" class="w-10 h-10 rounded-full ${this.isPaused ? 'bg-amber-500 text-neutral-900' : 'bg-[#0A84FF] text-white'} flex items-center justify-center shadow-lg active:scale-95 transition-all" title="${this.isPaused ? 'Reanudar Diálogo' : 'Pausar Diálogo'}">
            ${this.isPaused ? '▶️' : '🎙️'}
          </button>
        </div>

        <!-- Apple CarPlay Main Infotainment Display -->
        <div class="carplay-display flex-1 flex flex-col p-6 justify-between bg-gradient-to-b from-[#141416] to-[#0A0A0C]">
          
          <!-- Top Status Bar: Tutor, Regional Accent, and Silence Threshold -->
          <div class="flex items-center justify-between border-b border-[#2C2C2E] pb-3 mb-2">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${accent.flag}</span>
              <div>
                <p class="text-sm font-extrabold text-white">${accent.tutor} · ${accent.name}</p>
                <p class="text-[11px] text-neutral-400">${accent.city} · Manos Libres Activo</p>
              </div>
            </div>

            <!-- Silence Timeout Selector & Accents Bar -->
            <div class="flex items-center gap-2">
              <button id="silence-config-btn" class="px-3 py-1 rounded-xl bg-[#2C2C2E] text-xs font-bold text-neutral-300 hover:text-white border border-[#3A3A3C] transition-all" title="Cambiar umbral de silencio (NHTSA Estándar: 2.0s)">
                ⏱️ Silencio: ${(this.silenceThresholdMs / 1000).toFixed(1)}s
              </button>

              <div class="flex items-center gap-1 overflow-x-auto max-w-[200px]">
    `;

    this.accents.forEach(acc => {
      const isSelected = acc.id === this.currentAccentId;
      html += `
        <button class="accent-select-btn px-2 py-1 rounded-xl text-xs font-bold transition-all ${
          isSelected ? "bg-[#0A84FF] text-white scale-105" : "bg-[#2C2C2E] text-neutral-400 hover:text-white"
        }" data-accent="${acc.id}" title="${acc.name}">
          ${acc.flag}
        </button>
      `;
    });

    html += `
              </div>
            </div>
          </div>

          <!-- Central Stage: AI Question / Speech Bubble -->
          <div class="flex-1 flex flex-col justify-center px-1">
            <div class="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl p-5 mb-2 shadow-lg">
              <div class="flex items-center justify-between text-xs text-[#0A84FF] font-bold mb-1">
                <span>${accent.flag} ${accent.tutor} dice:</span>
                <button class="replay-btn text-xs text-neutral-400 hover:text-white flex items-center gap-1">
                  🔊 Repetir
                </button>
              </div>
              <p class="text-xl md:text-2xl font-bold text-white leading-relaxed">
                "${lastAi.text}"
              </p>
            </div>

            ${lastUser ? `
              <div class="text-xs text-neutral-400 flex items-center gap-2 px-1">
                <span>🗣️ Tú dijiste:</span>
                <span class="text-neutral-200 italic font-medium truncate">"${lastUser.text}"</span>
              </div>
            ` : ""}
          </div>

          <!-- Dynamic Hands-Free Voice Activity & Trailing Silence Box -->
          <div id="carplay-vad-box" class="my-2">
            ${this.renderVadWidgetHtml()}
          </div>

          <!-- Bottom Automotive Driving Controls (High-contrast, easy-tap) -->
          <div class="flex items-center justify-between border-t border-[#2C2C2E] pt-3 mt-1">
            <button id="carplay-repeat-btn" class="py-3 px-5 rounded-2xl bg-[#2C2C2E] text-neutral-300 font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all flex items-center gap-2">
              ⏮️ <span>Repetir</span>
            </button>

            <!-- Large Hands-Free Pause / Resume Button -->
            <button id="pause-toggle-btn" class="py-3.5 px-7 rounded-2xl ${
              this.isPaused
                ? 'bg-amber-500 text-neutral-900 font-extrabold shadow-lg hover:bg-amber-600'
                : 'bg-[#2C2C2E] text-neutral-200 font-bold hover:bg-neutral-700'
            } active:scale-95 transition-all flex items-center gap-2.5">
              <span class="text-lg">${this.isPaused ? '▶️' : '⏸️'}</span>
              <span>${this.isPaused ? 'REANUDAR DIÁLOGO' : 'PAUSAR DIÁLOGO'}</span>
            </button>

            <button id="carplay-next-topic-btn" class="py-3 px-5 rounded-2xl bg-[#2C2C2E] text-neutral-300 font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all flex items-center gap-2">
              <span>Tema</span> ⏭️
            </button>
          </div>

        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  bindDialogueEvents() {
    const exitBtn = document.getElementById("exit-dialogue-btn");
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        this.app.isDialogueMode = false;
        this.soundManager.stopSpeaking();
        this.soundManager.stopListening();
        this.soundManager.playClick();
        this.app.render();
      });
    }

    // Accents selection
    document.querySelectorAll(".accent-select-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const accentId = btn.getAttribute("data-accent");
        this.setAccent(accentId);
      });
    });

    // Scenarios selection
    document.querySelectorAll(".scenario-select-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const scenarioId = btn.getAttribute("data-scenario");
        this.setScenario(scenarioId);
      });
    });

    // Silence configuration button (cycle 1.5s -> 2.0s -> 2.5s)
    const silenceBtn = document.getElementById("silence-config-btn");
    if (silenceBtn) {
      silenceBtn.addEventListener("click", () => {
        this.cycleSilenceThreshold();
      });
    }

    // Pause / Resume toggles
    const pauseToggleBtns = document.querySelectorAll("#pause-toggle-btn, #carplay-dock-pause-btn, #vad-resume-btn");
    pauseToggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.togglePause();
      });
    });

    // Manual text sending (fallback)
    const sendBtn = document.getElementById("send-chat-btn");
    const input = document.getElementById("chat-input");
    if (sendBtn && input) {
      sendBtn.addEventListener("click", () => {
        const val = input.value;
        input.value = "";
        this.sendMessage(val);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const val = input.value;
          input.value = "";
          this.sendMessage(val);
        }
      });
    }

    // Repeat buttons
    document.querySelectorAll(".replay-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.getAttribute("data-idx");
        const msg = idx !== null && idx !== undefined && this.messages[idx] ? this.messages[idx] : this.messages.filter(m => m.sender === "ai").slice(-1)[0];
        if (msg) {
          const accent = this.getCurrentAccent();
          this.soundManager.speak(msg.text, this.currentAccentId, msg.voice || accent.voice, () => {
            if (this.isHandsFreeActive && !this.isPaused) {
              this.startHandsFreeListening();
            }
          });
        }
      });
    });

    const cpRepeat = document.getElementById("carplay-repeat-btn");
    if (cpRepeat) {
      cpRepeat.addEventListener("click", () => {
        const lastAi = this.messages.filter(m => m.sender === "ai").slice(-1)[0];
        if (lastAi) {
          const accent = this.getCurrentAccent();
          this.soundManager.speak(lastAi.text, this.currentAccentId, lastAi.voice || accent.voice, () => {
            if (this.isHandsFreeActive && !this.isPaused) {
              this.startHandsFreeListening();
            }
          });
        }
      });
    }

    // Topic switcher
    const cpNextTopic = document.getElementById("carplay-next-topic-btn");
    if (cpNextTopic) {
      cpNextTopic.addEventListener("click", () => {
        const currentIndex = this.scenarios.findIndex(s => s.id === this.currentScenario);
        const nextScenario = this.scenarios[(currentIndex + 1) % this.scenarios.length];
        this.setScenario(nextScenario.id);
      });
    }
  }
}
