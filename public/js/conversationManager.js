// Learna AI Advanced Conversational Dialogue Manager
// Multi-accent English speaking practice with real-time feedback & CarPlay support

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
    this.currentScenario = "casual";
    this.messages = [];
    this.isAiThinking = false;
    this.autoListenAfterAi = true;

    this.scenarios = [
      { id: "casual", name: { es: "💬 Charla Casual", en: "💬 Casual Chat" }, prompt: "Casual daily conversation" },
      { id: "carplay", name: { es: "🚗 Conversación en el Auto", en: "🚗 Commute & Drive" }, prompt: "Practicing English while driving" },
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
    this.soundManager.speak(accent.sampleGreeting, accent.id, accent.voice);
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
    this.soundManager.speak(text, accent.id, accent.voice);
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
      reply = `${flavor.cheer} Hello! It's fantastic to chat with you today. ${flavor.agree} How are you feeling right now, and what would you like to talk about?`;
    } else if (["how are you", "what's up", "how do you do"].some(q => textLower.includes(q))) {
      reply = `I'm doing wonderful, thank you for asking! I'm really excited to practice with you. How has your day been so far?`;
    } else if (scenario === "coffee") {
      reply = `${flavor.cheer} Welcome to the café! Would you like a hot latte, an iced Americano, or perhaps some pastry to go with it?`;
    } else if (scenario === "interview") {
      reply = `Thank you for sharing that. ${flavor.agree} Could you describe a challenging project you worked on recently, and how you solved it?`;
    } else if (scenario === "travel") {
      reply = `Safe travels! ${flavor.cheer} May I see your passport and boarding pass, and do you have any luggage to check in today?`;
    } else if (scenario === "carplay") {
      reply = `${flavor.cheer} Driving and practicing English is the best way to build automatic fluency! Where are you heading today?`;
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
        if (this.autoListenAfterAi && (this.app.viewMode === "carplay" || this.app.autoSpeak)) {
          this.startVoiceInput();
        }
      });
    }
  }

  startVoiceInput() {
    this.soundManager.startListening(this.currentAccentId, (transcript) => {
      this.soundManager.playSuccess();
      this.sendMessage(transcript);
    });
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

            <button id="exit-dialogue-btn" class="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all">
              ⬅️ Test
            </button>
          </div>

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

        <div id="chat-messages" class="flex-1 overflow-y-auto bg-neutral-50/70 border border-neutral-200 rounded-2xl p-4 flex flex-col gap-3.5 mb-3">
    `;

    if (this.messages.length === 0) {
      html += `
        <div class="flex flex-col items-center justify-center h-full text-center py-10">
          <span class="text-4xl mb-2">🎙️</span>
          <p class="font-bold text-neutral-700 text-base">¡Habla en voz alta con ${accent.tutor}!</p>
          <p class="text-xs text-neutral-500 max-w-xs mt-1">Presiona el botón de micrófono abajo o escribe para empezar la conversación en acento ${accent.name}.</p>
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

    if (this.isAiThinking) {
      html += `
        <div class="flex items-center gap-2 text-xs text-neutral-500 self-start bg-white border border-neutral-200 rounded-xl px-3 py-2 shadow-sm animate-pulse">
          <span>${accent.flag} ${accent.tutor} está respondiendo...</span>
          <div class="flex gap-1">
            <span class="w-1.5 h-1.5 bg-primary-base rounded-full animate-bounce"></span>
            <span class="w-1.5 h-1.5 bg-primary-base rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 bg-primary-base rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      `;
    }

    html += `
        </div>

        <div class="bg-white border border-neutral-200 rounded-2xl p-2.5 shadow-md flex items-center gap-2">
          <button id="talk-mic-btn" class="w-12 h-12 rounded-xl bg-primary-base text-white flex items-center justify-center flex-shrink-0 shadow-md hover:bg-primary-600 active:scale-95 transition-all relative">
            <span class="text-xl">🎙️</span>
            <span id="mic-pulse" class="hidden absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          </button>

          <input type="text" id="chat-input" placeholder="Habla con el micrófono o escribe en inglés..." class="flex-1 p-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-primary-base text-neutral-800" />

          <button id="send-chat-btn" class="px-4 py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-1.5">
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
        
        <div class="carplay-dock w-full md:w-20 bg-[#1C1C1E] border-b md:border-b-0 md:border-r border-[#2C2C2E] flex md:flex-col items-center justify-between p-3 flex-shrink-0">
          <div class="flex md:flex-col items-center gap-2">
            <span class="text-sm font-bold text-neutral-300">12:45</span>
            <div class="flex items-center gap-1 text-[10px] text-neutral-400">
              <span>5G</span>
              <span>📶</span>
            </div>
          </div>

          <button id="exit-dialogue-btn" class="w-12 h-12 rounded-full border-2 border-white/80 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 active:scale-90 transition-transform" title="Volver al Quiz">
            <div class="w-5 h-5 rounded-[4px] border-2 border-white"></div>
          </button>

          <button id="talk-mic-btn" class="w-10 h-10 rounded-full bg-[#0A84FF] text-white flex items-center justify-center shadow-lg hover:bg-blue-600 active:scale-95 transition-all" title="Hablar">
            🎙️
          </button>
        </div>

        <div class="carplay-display flex-1 flex flex-col p-6 justify-between bg-gradient-to-b from-[#141416] to-[#0A0A0C]">
          
          <div class="flex items-center justify-between border-b border-[#2C2C2E] pb-3 mb-2">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${accent.flag}</span>
              <div>
                <p class="text-sm font-extrabold text-white">${accent.tutor} · ${accent.name}</p>
                <p class="text-[11px] text-neutral-400">${accent.city}</p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 overflow-x-auto max-w-[280px]">
    `;

    this.accents.forEach(acc => {
      const isSelected = acc.id === this.currentAccentId;
      html += `
        <button class="accent-select-btn px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
          isSelected ? "bg-[#0A84FF] text-white" : "bg-[#2C2C2E] text-neutral-400 hover:text-white"
        }" data-accent="${acc.id}">
          ${acc.flag}
        </button>
      `;
    });

    html += `
            </div>
          </div>

          <div class="flex-1 flex flex-col justify-center px-2">
            <div class="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl p-5 mb-3 shadow-lg">
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
                <span class="text-neutral-200 italic font-medium">"${lastUser.text}"</span>
              </div>
            ` : ""}
          </div>

          <div class="flex items-center justify-between border-t border-[#2C2C2E] pt-3 mt-2">
            <button id="carplay-repeat-btn" class="py-3 px-5 rounded-2xl bg-[#2C2C2E] text-neutral-300 font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all flex items-center gap-2">
              ⏮️ <span>Repetir</span>
            </button>

            <button id="carplay-talk-btn" class="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-blue-600 text-white font-extrabold text-base shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-3">
              <span class="text-xl">🎙️</span>
              <span>PULSA Y HABLA EN INGLÉS</span>
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

    document.querySelectorAll(".accent-select-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const accentId = btn.getAttribute("data-accent");
        this.setAccent(accentId);
      });
    });

    document.querySelectorAll(".scenario-select-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const scenarioId = btn.getAttribute("data-scenario");
        this.setScenario(scenarioId);
      });
    });

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

    const micBtn = document.getElementById("talk-mic-btn");
    if (micBtn) {
      micBtn.addEventListener("click", () => {
        this.startVoiceInput();
      });
    }

    const carplayTalkBtn = document.getElementById("carplay-talk-btn");
    if (carplayTalkBtn) {
      carplayTalkBtn.addEventListener("click", () => {
        this.startVoiceInput();
      });
    }

    document.querySelectorAll(".replay-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = btn.getAttribute("data-idx");
        const msg = idx !== null ? this.messages[idx] : this.messages.filter(m => m.sender === "ai").slice(-1)[0];
        if (msg) {
          const accent = this.getCurrentAccent();
          this.soundManager.speak(msg.text, this.currentAccentId, msg.voice || accent.voice);
        }
      });
    });

    const cpRepeat = document.getElementById("carplay-repeat-btn");
    if (cpRepeat) {
      cpRepeat.addEventListener("click", () => {
        const lastAi = this.messages.filter(m => m.sender === "ai").slice(-1)[0];
        if (lastAi) {
          const accent = this.getCurrentAccent();
          this.soundManager.speak(lastAi.text, this.currentAccentId, lastAi.voice || accent.voice);
        }
      });
    }

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
