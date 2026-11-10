// Learna AI English Tutor - Main Web & Apple CarPlay App
import { quizData } from "./quizData.js";
import { SoundManager } from "./soundManager.js";
import { CarPlayController } from "./carplayController.js";
import { ConversationManager } from "./conversationManager.js";

class LearnaApp {
  constructor() {
    this.quiz = quizData;
    this.currentStepIndex = 0;
    this.answers = {};
    this.history = [];
    this.currentLang = "es"; // Default to Spanish for Latin America / Spain, easily toggled to English
    this.viewMode = "mobile"; // 'mobile' | 'carplay'
    this.autoSpeak = false;
    this.isDialogueMode = false; // Toggle between Onboarding Quiz and Advanced Multi-Accent Speaking Practice

    this.soundManager = new SoundManager();
    this.carplay = new CarPlayController(this, this.soundManager);
    this.conversationManager = new ConversationManager(this, this.soundManager);

    this.soundManager.onListeningChange = (isListening) => {
      this.updateMicIndicator(isListening);
    };

    this.initDOM();
    this.bindEvents();
    this.render();
  }

  initDOM() {
    this.appContainer = document.getElementById("app-container");
    this.progressBar = document.getElementById("progress-bar");
    this.backBtn = document.getElementById("back-btn");
    this.stepContent = document.getElementById("step-content");
    this.modeToggleBtn = document.getElementById("mode-toggle-btn");
    this.langToggleBtn = document.getElementById("lang-toggle-btn");
    this.voiceToggleBtn = document.getElementById("voice-toggle-btn");
    this.dialogueToggleBtn = document.getElementById("dialogue-toggle-btn");
    this.carplayBezel = document.getElementById("carplay-bezel");
  }

  bindEvents() {
    if (this.backBtn) {
      this.backBtn.addEventListener("click", () => {
        if (this.isDialogueMode) {
          this.isDialogueMode = false;
          this.render();
        } else {
          this.previousStep();
        }
      });
    }

    if (this.dialogueToggleBtn) {
      this.dialogueToggleBtn.addEventListener("click", () => {
        this.isDialogueMode = !this.isDialogueMode;
        this.soundManager.playClick();
        if (this.isDialogueMode) {
          this.soundManager.playSuccess();
        }
        this.render();
      });
    }

    if (this.modeToggleBtn) {
      this.modeToggleBtn.addEventListener("click", () => {
        this.viewMode = this.viewMode === "mobile" ? "carplay" : "mobile";
        this.soundManager.playClick();
        if (this.viewMode === "carplay") {
          this.autoSpeak = true;
          this.soundManager.playCarPlayChime();
        }
        this.render();
      });
    }

    if (this.langToggleBtn) {
      this.langToggleBtn.addEventListener("click", () => {
        this.currentLang = this.currentLang === "es" ? "en" : "es";
        this.soundManager.playClick();
        this.render();
      });
    }

    if (this.voiceToggleBtn) {
      this.voiceToggleBtn.addEventListener("click", () => {
        this.autoSpeak = !this.autoSpeak;
        this.soundManager.playClick();
        if (this.autoSpeak) {
          this.speakCurrentStep();
        } else {
          this.soundManager.stopSpeaking();
          this.soundManager.stopListening();
        }
        this.updateVoiceToggleUI();
      });
    }

    // Keyboard navigation (Enter / Space / Left / Right)
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.previousStep();
      if (e.key === "ArrowRight") this.nextStep();
    });
  }

  getCurrentStep() {
    return this.quiz.steps[this.currentStepIndex];
  }

  getText(field) {
    if (!field) return "";
    if (typeof field === "object") {
      return field[this.currentLang] || field.en || "";
    }
    return field;
  }

  render() {
    // Update Dialogue Toggle Text & Style
    if (this.dialogueToggleBtn) {
      if (this.isDialogueMode) {
        this.dialogueToggleBtn.classList.add("bg-primary-base", "text-white");
        this.dialogueToggleBtn.classList.remove("bg-primary-50", "text-primary-base");
        this.dialogueToggleBtn.innerHTML = `<span>📝</span><span class="hidden sm:inline">Ver Quiz</span>`;
      } else {
        this.dialogueToggleBtn.classList.remove("bg-primary-base", "text-white");
        this.dialogueToggleBtn.classList.add("bg-primary-50", "text-primary-base");
        this.dialogueToggleBtn.innerHTML = `<span>🗣️</span><span class="hidden sm:inline">Diálogo IA</span>`;
      }
    }

    // If in Conversational Dialogue Mode, render the multi-accent dialogue interface
    if (this.isDialogueMode) {
      if (this.progressBar) this.progressBar.style.width = "100%";
      if (this.backBtn) this.backBtn.style.visibility = "visible";
      this.conversationManager.render();
      return;
    }

    const step = this.getCurrentStep();
    if (!step) return;

    // Update Mode Classes
    if (this.viewMode === "carplay") {
      document.body.classList.add("carplay-active");
      if (this.carplayBezel) this.carplayBezel.classList.remove("hidden");
      if (this.modeToggleBtn) {
        this.modeToggleBtn.innerHTML = `<span>📱</span><span class="hidden sm:inline">Modo Móvil</span>`;
      }
    } else {
      document.body.classList.remove("carplay-active");
      if (this.carplayBezel) this.carplayBezel.classList.add("hidden");
      if (this.modeToggleBtn) {
        this.modeToggleBtn.innerHTML = `<span>🚗</span><span class="hidden sm:inline">Apple CarPlay</span>`;
      }
    }

    // Update Language Toggle Text
    if (this.langToggleBtn) {
      this.langToggleBtn.innerHTML = this.currentLang === "es" ? "🇪🇸 ES" : "🇬🇧 EN";
    }

    this.updateVoiceToggleUI();

    // Update Progress Bar
    const progressPct = Math.min(100, Math.round(((this.currentStepIndex + 1) / this.quiz.totalSteps) * 100));
    if (this.progressBar) {
      this.progressBar.style.width = `${progressPct}%`;
    }

    // Update Back button visibility
    if (this.backBtn) {
      this.backBtn.style.visibility = this.history.length > 0 ? "visible" : "hidden";
    }

    // Update MediaSession metadata
    const stepTitle = this.getText(step.title);
    this.carplay.updateMediaSession(stepTitle, this.currentStepIndex, this.quiz.totalSteps);

    // Render Step Content based on view mode
    if (this.viewMode === "carplay") {
      this.renderCarPlayView(step);
    } else {
      this.renderMobileView(step);
    }

    // Speak voice prompt if autoSpeak is enabled
    if (this.autoSpeak) {
      this.speakCurrentStep();
    }
  }

  updateVoiceToggleUI() {
    if (!this.voiceToggleBtn) return;
    if (this.autoSpeak) {
      this.voiceToggleBtn.classList.add("bg-primary-base", "text-white");
      this.voiceToggleBtn.classList.remove("bg-white", "text-neutral-700");
      this.voiceToggleBtn.innerHTML = `<span>🔊</span><span class="hidden sm:inline">Voz Activa</span>`;
    } else {
      this.voiceToggleBtn.classList.remove("bg-primary-base", "text-white");
      this.voiceToggleBtn.classList.add("bg-white", "text-neutral-700");
      this.voiceToggleBtn.innerHTML = `<span>🔇</span><span class="hidden sm:inline">Voz</span>`;
    }
  }

  speakCurrentStep() {
    if (this.isDialogueMode) return;
    const step = this.getCurrentStep();
    if (!step) return;
    const prompt = this.getText(step.voicePrompt) || this.getText(step.title);
    this.soundManager.speak(prompt, this.currentLang, () => {
      // In CarPlay mode, automatically listen for driver's voice response after speaking
      if (this.viewMode === "carplay" && this.autoSpeak && step.type !== "personalized_summary") {
        this.soundManager.startListening(this.currentLang, (transcript) => {
          const matched = this.carplay.handleVoiceAnswer(transcript, step, this.currentLang);
          if (matched) {
            this.soundManager.playSuccess();
          }
        });
      }
    });
  }

  updateMicIndicator(isListening) {
    const micStatus = document.getElementById("carplay-mic-indicator");
    if (micStatus) {
      if (isListening) {
        micStatus.classList.remove("hidden");
        micStatus.classList.add("animate-pulse");
      } else {
        micStatus.classList.add("hidden");
        micStatus.classList.remove("animate-pulse");
      }
    }
  }

  selectAnswer(answerValue) {
    const step = this.getCurrentStep();
    this.soundManager.playClick();
    this.answers[step.id] = answerValue;
    this.history.push(this.currentStepIndex);

    // Move to next step with slight animation delay
    setTimeout(() => {
      this.nextStep();
    }, 180);
  }

  toggleMultiAnswer(itemValue) {
    const step = this.getCurrentStep();
    this.soundManager.playClick();
    if (!Array.isArray(this.answers[step.id])) {
      this.answers[step.id] = [];
    }
    const idx = this.answers[step.id].indexOf(itemValue);
    if (idx >= 0) {
      this.answers[step.id].splice(idx, 1);
    } else {
      this.answers[step.id].push(itemValue);
    }
    this.render();
  }

  nextStep() {
    this.soundManager.stopSpeaking();
    this.soundManager.stopListening();
    if (this.currentStepIndex < this.quiz.totalSteps - 1) {
      this.history.push(this.currentStepIndex);
      this.currentStepIndex++;
      this.render();
    }
  }

  previousStep() {
    this.soundManager.stopSpeaking();
    this.soundManager.stopListening();
    if (this.history.length > 0) {
      this.currentStepIndex = this.history.pop();
      this.render();
    }
  }

  // ==========================================
  // MOBILE / STANDARD WEB VIEW RENDERERS
  // ==========================================
  renderMobileView(step) {
    let html = `
      <div class="w-full max-w-md mx-auto flex flex-col items-center animate-fade-in pb-12">
    `;

    // Step Badge (e.g. 3 MINUTE QUIZ)
    if (step.badge) {
      html += `
        <span class="inline-block bg-primary-100 text-primary-base font-bold text-xs uppercase px-3 py-1 rounded-full mb-3 tracking-wider">
          ${step.badge}
        </span>
      `;
    }

    // Step Titles
    html += `
      <h1 class="text-2xl sm:text-3xl font-extrabold text-neutral-900 text-center mb-2 leading-tight">
        ${this.getText(step.title)}
      </h1>
    `;
    if (step.subtitle) {
      html += `
        <p class="text-sm sm:text-base text-neutral-500 text-center mb-6 max-w-sm">
          ${this.getText(step.subtitle)}
        </p>
      `;
    }

    // Dynamic Step Type Dispatch
    switch (step.type) {
      case "grid_cards":
        html += this.renderGridCards(step);
        break;
      case "dropdown":
        html += this.renderDropdown(step);
        break;
      case "social_proof":
        html += this.renderSocialProof(step);
        break;
      case "list_single":
        html += this.renderListSingle(step);
        break;
      case "list_multi":
        html += this.renderListMulti(step);
        break;
      case "statement":
        html += this.renderStatement(step);
        break;
      case "words_check":
        html += this.renderWordsCheck(step);
        break;
      case "interests":
        html += this.renderInterests(step);
        break;
      case "personalized_summary":
        html += this.renderPersonalizedSummary(step);
        break;
      default:
        html += `<p class="text-neutral-400">Step content loading...</p>`;
    }

    html += `</div>`;
    this.stepContent.innerHTML = html;
    this.postRenderBindings(step);
  }

  // Step 0: Grid Cards (Age Selection)
  renderGridCards(step) {
    const selected = this.answers[step.id];
    let html = `<div class="grid grid-cols-2 gap-4 w-full">`;
    step.options.forEach((opt) => {
      const isSelected = selected === opt.id;
      html += `
        <div class="opt-card cursor-pointer flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
          isSelected ? "border-primary-base bg-primary-50 shadow-md scale-[1.02]" : "border-neutral-200 bg-white hover:border-primary-base/50 hover:shadow-sm"
        }" data-value="${opt.id}">
          <div class="flex items-center justify-center p-3 bg-neutral-50/70 h-[130px]">
            <img src="${opt.img}" alt="${this.getText(opt.label)}" class="max-h-[110px] w-auto object-contain transition-transform duration-300 hover:scale-105" />
          </div>
          <div class="p-3 text-center bg-white font-semibold text-neutral-800 flex items-center justify-between border-t border-neutral-100">
            <span class="text-sm sm:text-base">${this.getText(opt.label)}</span>
            <svg class="w-4 h-4 text-primary-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  // Step 1: Language Dropdown
  renderDropdown(step) {
    const selected = this.answers[step.id] || "es";
    let html = `
      <div class="w-full flex flex-col gap-4">
        <div class="relative w-full">
          <input type="text" id="lang-search" placeholder="${this.currentLang === "es" ? "Buscar tu idioma..." : "Search your language..."}" class="w-full p-3.5 pl-11 rounded-xl border-2 border-neutral-200 focus:border-primary-base focus:outline-none text-neutral-800 text-sm" />
          <span class="absolute left-3.5 top-3.5 text-neutral-400">🔍</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1" id="lang-list">
    `;
    this.quiz.languages.forEach((lang) => {
      const isSelected = selected === lang.code;
      html += `
        <div class="lang-opt cursor-pointer flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
          isSelected ? "border-primary-base bg-primary-50 text-primary-base font-bold" : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800"
        }" data-value="${lang.code}">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${lang.emoji}</span>
            <span class="text-sm">${lang.name}</span>
          </div>
          ${isSelected ? `<span class="text-primary-base font-bold">✓</span>` : ""}
        </div>
      `;
    });
    html += `
        </div>
        <button id="lang-continue-btn" class="w-full mt-4 py-3.5 px-6 rounded-xl bg-primary-base text-white font-bold text-base shadow-md hover:bg-primary-600 active:scale-[0.98] transition-all">
          ${this.currentLang === "es" ? "Continuar" : "Continue"}
        </button>
      </div>
    `;
    return html;
  }

  // Social Proof Screens
  renderSocialProof(step) {
    let html = `<div class="w-full flex flex-col items-center text-center">`;
    if (step.lottie) {
      html += `
        <div class="w-64 h-64 mb-4 flex items-center justify-center relative">
          <div id="lottie-container" class="w-full h-full"></div>
        </div>
      `;
    }
    if (step.stats) {
      html += `<div class="grid grid-cols-3 gap-3 w-full my-4">`;
      step.stats.forEach((st) => {
        html += `
          <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col items-center">
            <span class="text-primary-base font-black text-xl">${st.number}</span>
            <span class="text-xs text-neutral-500 font-medium">${this.getText(st.label)}</span>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `
      <button id="cta-continue-btn" class="w-full mt-6 py-4 px-6 rounded-xl bg-primary-base text-white font-bold text-base shadow-lg hover:bg-primary-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <span>${this.currentLang === "es" ? "Continuar" : "Continue"}</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </button>
    </div>`;
    return html;
  }

  // List Single Select (Proficiency, Goals, Improvement)
  renderListSingle(step) {
    const selected = this.answers[step.id];
    let html = `<div class="w-full flex flex-col gap-3">`;
    step.options.forEach((opt) => {
      const isSelected = selected === opt.id;
      html += `
        <div class="opt-card cursor-pointer flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
          isSelected ? "border-primary-base bg-primary-50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
        }" data-value="${opt.id}">
          <div class="flex items-center gap-3.5">
            ${opt.img ? `<img src="${opt.img}" alt="${opt.id}" class="w-12 h-12 rounded-xl object-contain bg-neutral-100 p-1 flex-shrink-0" />` : ""}
            ${opt.emoji ? `<span class="text-3xl flex-shrink-0">${opt.emoji}</span>` : ""}
            <div class="flex flex-col text-left">
              <div class="flex items-center gap-2">
                <span class="font-bold text-neutral-900 text-sm sm:text-base">${this.getText(opt.label)}</span>
                ${opt.level ? `<span class="bg-primary-100 text-primary-base text-xs font-bold px-2 py-0.5 rounded-md">${opt.level}</span>` : ""}
              </div>
              ${opt.description ? `<span class="text-xs text-neutral-500 mt-0.5 leading-snug">${this.getText(opt.description)}</span>` : ""}
            </div>
          </div>
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isSelected ? "border-primary-base bg-primary-base text-white" : "border-neutral-300"
          }">
            ${isSelected ? "✓" : ""}
          </div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  // List Multi Select (Motivation)
  renderListMulti(step) {
    const selected = this.answers[step.id] || [];
    let html = `<div class="w-full flex flex-col gap-2.5">`;
    step.options.forEach((opt) => {
      const isSelected = selected.includes(opt.id);
      html += `
        <div class="multi-card cursor-pointer flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
          isSelected ? "border-primary-base bg-primary-50 text-neutral-900 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
        }" data-value="${opt.id}">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${opt.emoji}</span>
            <span class="font-semibold text-sm sm:text-base">${this.getText(opt.label)}</span>
          </div>
          <div class="w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs ${
            isSelected ? "border-primary-base bg-primary-base text-white font-bold" : "border-neutral-300 bg-white"
          }">
            ${isSelected ? "✓" : ""}
          </div>
        </div>
      `;
    });
    html += `
      <button id="multi-continue-btn" class="w-full mt-4 py-3.5 px-6 rounded-xl bg-primary-base text-white font-bold text-base shadow-md hover:bg-primary-600 active:scale-[0.98] transition-all ${
        selected.length === 0 ? "opacity-50 cursor-not-allowed" : ""
      }">
        ${this.currentLang === "es" ? "Continuar" : "Continue"}
      </button>
    </div>`;
    return html;
  }

  // Diagnostic Statement
  renderStatement(step) {
    const selected = this.answers[step.id];
    let html = `
      <div class="w-full bg-white border border-neutral-200 rounded-2xl p-5 mb-5 shadow-sm text-center">
        <span class="text-3xl mb-2 inline-block">🎯</span>
        <h3 class="text-lg font-bold text-neutral-800 leading-snug">"${this.getText(step.title)}"</h3>
      </div>
      <div class="w-full flex flex-col gap-3">
    `;
    this.quiz.statementOptions.forEach((opt) => {
      const isSelected = selected === opt.id;
      let badgeColor = opt.id === "true" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : opt.id === "partially_true" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-neutral-600 bg-neutral-50 border-neutral-200";
      html += `
        <div class="statement-card cursor-pointer flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
          isSelected ? "border-primary-base bg-primary-50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
        }" data-value="${opt.id}">
          <span class="font-bold text-sm sm:text-base text-neutral-800">${this.getText(opt.label)}</span>
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected ? "border-primary-base bg-primary-base text-white text-xs font-bold" : "border-neutral-300"
          }">
            ${isSelected ? "✓" : ""}
          </div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  // Words Checkbox Benchmark
  renderWordsCheck(step) {
    const selected = this.answers[step.id] || [];
    let html = `
      <div class="w-full flex flex-wrap gap-2.5 justify-center my-3 max-h-[350px] overflow-y-auto p-1">
    `;
    step.words.forEach((w) => {
      const isSelected = selected.includes(w);
      html += `
        <button class="word-chip px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
          isSelected ? "border-primary-base bg-primary-base text-white shadow-sm scale-105" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
        }" data-value="${w}">
          ${w} ${isSelected ? "✓" : "+"}
        </button>
      `;
    });
    html += `
      </div>
      <button id="words-continue-btn" class="w-full mt-4 py-3.5 px-6 rounded-xl bg-primary-base text-white font-bold text-base shadow-md hover:bg-primary-600 active:scale-[0.98] transition-all">
        ${this.currentLang === "es" ? "Continuar" : "Continue"} (${selected.length} ${this.currentLang === "es" ? "seleccionadas" : "selected"})
      </button>
    `;
    return html;
  }

  // Interests Selection
  renderInterests(step) {
    const selected = this.answers[step.id] || [];
    let html = `
      <p class="text-xs text-primary-base font-bold mb-3 uppercase tracking-wider">
        ${this.currentLang === "es" ? "Elige 3 o más temas" : "Choose 3 or more topics"} (${selected.length}/3)
      </p>
      <div class="w-full flex flex-wrap gap-2.5 justify-center max-h-[350px] overflow-y-auto p-1">
    `;
    step.options.forEach((opt) => {
      const isSelected = selected.includes(opt.id);
      html += `
        <button class="interest-chip flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
          isSelected ? "border-primary-base bg-primary-50 text-primary-base shadow-sm scale-105 font-bold" : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
        }" data-value="${opt.id}">
          <span class="text-lg">${opt.emoji}</span>
          <span>${this.getText(opt.label)}</span>
        </button>
      `;
    });
    html += `
      </div>
      <button id="interests-continue-btn" class="w-full mt-5 py-3.5 px-6 rounded-xl bg-primary-base text-white font-bold text-base shadow-md hover:bg-primary-600 active:scale-[0.98] transition-all ${
        selected.length < 3 ? "opacity-50 cursor-not-allowed" : ""
      }">
        ${this.currentLang === "es" ? "Generar mi plan personalizado" : "Generate My Plan"}
      </button>
    `;
    return html;
  }

  // Final Screen: Personalized Plan & Results
  renderPersonalizedSummary(step) {
    const levelKey = this.answers["select_proficiency"] || "intermediate";
    const levelName = levelKey.toUpperCase().replace("_", " ");
    const duration = this.answers["duration"] || "10";

    let html = `
      <div class="w-full flex flex-col items-center">
        <!-- AI Tutor Pair Badge -->
        <div class="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-2xl p-4 w-full mb-5">
          <img src="${step.tutorAvatar}" alt="AI Tutor" class="w-14 h-14 rounded-full border-2 border-primary-base bg-white shadow-sm" />
          <div class="flex flex-col text-left">
            <span class="text-xs uppercase font-extrabold text-primary-base tracking-wider">Tutor Asignado</span>
            <span class="text-base font-bold text-neutral-900">Learna Voice AI</span>
            <span class="text-xs text-neutral-500">Acento nativo · Corrección en tiempo real</span>
          </div>
        </div>

        <!-- 30-Day Fluency Projection Graph -->
        <div class="w-full bg-white border border-neutral-200 rounded-2xl p-5 mb-5 shadow-sm text-left">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-extrabold uppercase text-neutral-400">Proyección a 30 Días</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+150% Fluidez</span>
          </div>
          <div class="flex items-end justify-between h-32 px-4 pt-4 pb-2 border-b border-neutral-100 relative">
            <!-- Today Bar -->
            <div class="flex flex-col items-center gap-2">
              <span class="text-xs font-bold text-neutral-500">400 frases</span>
              <div class="w-12 bg-neutral-200 rounded-t-lg h-14"></div>
              <span class="text-xs font-semibold text-neutral-600">Hoy (${levelName})</span>
            </div>
            <!-- Arrow -->
            <div class="text-primary-base font-black text-xl mb-4">➔</div>
            <!-- 30 Days Bar -->
            <div class="flex flex-col items-center gap-2">
              <span class="text-xs font-extrabold text-primary-base">1,000+ frases</span>
              <div class="w-12 bg-primary-base rounded-t-lg h-24 shadow-md"></div>
              <span class="text-xs font-bold text-primary-base">En 30 Días</span>
            </div>
          </div>
        </div>

        <!-- Daily Practice Duration Selector -->
        <div class="w-full bg-white border border-neutral-200 rounded-2xl p-5 mb-5 shadow-sm text-left">
          <span class="text-sm font-bold text-neutral-900 block mb-3">
            ${this.currentLang === "es" ? "¿Cuánto tiempo puedes practicar al día?" : "How many minutes can you practice daily?"}
          </span>
          <div class="grid grid-cols-3 gap-2.5">
            <button class="duration-btn py-3 px-2 rounded-xl border-2 text-center text-sm font-bold transition-all ${
              duration === "5" ? "border-primary-base bg-primary-50 text-primary-base" : "border-neutral-200 text-neutral-700"
            }" data-val="5">5 min</button>
            <button class="duration-btn py-3 px-2 rounded-xl border-2 text-center text-sm font-bold transition-all ${
              duration === "10" ? "border-primary-base bg-primary-50 text-primary-base" : "border-neutral-200 text-neutral-700"
            }" data-val="10">10 min ⭐</button>
            <button class="duration-btn py-3 px-2 rounded-xl border-2 text-center text-sm font-bold transition-all ${
              duration === "15" ? "border-primary-base bg-primary-50 text-primary-base" : "border-neutral-200 text-neutral-700"
            }" data-val="15">15 min</button>
          </div>
        </div>

        <!-- Testimonial Quote Card -->
        <div class="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 mb-6 text-left">
          <div class="flex items-center gap-3 mb-2">
            <img src="${step.quote.avatar}" alt="${step.quote.author}" class="w-10 h-10 rounded-full object-cover" />
            <div>
              <p class="text-xs font-bold text-neutral-800">${step.quote.author}</p>
              <p class="text-[10px] text-neutral-400">🇵🇭 ${step.quote.country}</p>
            </div>
          </div>
          <p class="text-xs text-neutral-600 italic">"${this.getText(step.quote.text)}"</p>
        </div>

        <!-- CTA Start Free Trial / Interactive Practice -->
        <button id="final-cta-btn" class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary-base to-blue-600 text-white font-extrabold text-lg shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span>🚀 ${this.currentLang === "es" ? "Iniciar Diálogo con Tutor IA (Diferentes Acentos)" : "Start Speaking with AI Tutor (Multi-Accent)"}</span>
        </button>
      </div>
    `;
    return html;
  }

  // ==========================================
  // APPLE CARPLAY IN-DASH VIEW RENDERER
  // ==========================================
  renderCarPlayView(step) {
    let html = `
      <div class="carplay-infotainment w-full max-w-4xl mx-auto bg-[#0A0A0C] text-white rounded-3xl border border-[#2C2C2E] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[480px]">
        
        <!-- CarPlay Left Dock / Sidebar -->
        <div class="carplay-dock w-full md:w-20 bg-[#1C1C1E] border-b md:border-b-0 md:border-r border-[#2C2C2E] flex md:flex-col items-center justify-between p-3 flex-shrink-0">
          <div class="flex md:flex-col items-center gap-2">
            <span class="text-sm font-bold text-neutral-300">12:45</span>
            <div class="flex items-center gap-1 text-[10px] text-neutral-400">
              <span>5G</span>
              <span>📶</span>
            </div>
          </div>

          <!-- CarPlay Home Button -->
          <button id="carplay-home-btn" class="w-12 h-12 rounded-full border-2 border-white/80 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 active:scale-90 transition-transform">
            <div class="w-5 h-5 rounded-[4px] border-2 border-white"></div>
          </button>

          <!-- Voice / Dialogue Buttons -->
          <div class="flex md:flex-col items-center gap-2">
            <button id="carplay-dock-dialogue-btn" class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-500 active:scale-95 transition-all text-sm" title="Ir a Diálogo IA">
              🗣️
            </button>
            <button id="carplay-mic-btn" class="w-10 h-10 rounded-full bg-primary-base text-white flex items-center justify-center shadow-lg hover:bg-primary-600 active:scale-95 transition-all" title="Hablar / Escuchar">
              🎙️
            </button>
          </div>
        </div>

        <!-- CarPlay Main Infotainment Display Area -->
        <div class="carplay-display flex-1 flex flex-col p-6 overflow-y-auto justify-between bg-gradient-to-b from-[#121214] to-[#0A0A0C]">
          
          <!-- Automotive Header / Status -->
          <div class="flex items-center justify-between border-b border-[#2C2C2E] pb-3 mb-4">
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <span class="text-xs uppercase font-extrabold tracking-widest text-[#0A84FF]">Apple CarPlay · Driving Audio Quiz</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-neutral-400">
              <span>Paso ${this.currentStepIndex + 1} de ${this.quiz.totalSteps}</span>
              <div id="carplay-mic-indicator" class="hidden text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                🔴 Escuchando...
              </div>
            </div>
          </div>

          <!-- Center Content: High Contrast Large Font for In-Dash Safety -->
          <div class="flex-1 flex flex-col justify-center">
            <h2 class="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
              ${this.getText(step.title)}
            </h2>
            ${step.subtitle ? `<p class="text-base text-neutral-400 mb-6">${this.getText(step.subtitle)}</p>` : ""}

            <!-- CarPlay Automotive Options List (Large touch targets for car screen) -->
            ${this.renderCarPlayOptions(step)}
          </div>

          <!-- CarPlay Bottom Transport Bar (Steering Wheel / Media controls) -->
          <div class="flex items-center justify-between border-t border-[#2C2C2E] pt-3 mt-4">
            <button id="carplay-prev-btn" class="py-2.5 px-4 rounded-xl bg-[#2C2C2E] text-neutral-300 font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all flex items-center gap-2">
              ⏮️ <span>Repetir Pregunta</span>
            </button>

            <button id="carplay-listen-btn" class="py-3 px-6 rounded-xl bg-gradient-to-r from-[#0A84FF] to-blue-600 text-white font-extrabold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
              🎙️ <span>Hablar Respuesta</span>
            </button>

            <button id="carplay-next-btn" class="py-2.5 px-4 rounded-xl bg-[#2C2C2E] text-neutral-300 font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all flex items-center gap-2">
              <span>Siguiente</span> ⏭️
            </button>
          </div>

        </div>
      </div>
    `;

    this.stepContent.innerHTML = html;
    this.postRenderCarPlayBindings(step);
  }

  renderCarPlayOptions(step) {
    if (step.type === "statement") {
      let html = `<div class="grid grid-cols-3 gap-3 w-full">`;
      this.quiz.statementOptions.forEach((opt, idx) => {
        html += `
          <button class="carplay-opt-btn py-4 px-3 rounded-2xl bg-[#1C1C1E] border-2 border-[#3A3A3C] text-white font-extrabold text-base hover:border-[#0A84FF] hover:bg-[#2C2C2E] active:scale-95 transition-all flex flex-col items-center justify-center gap-1" data-value="${opt.id}">
            <span class="text-xs text-neutral-400">Opción ${idx + 1}</span>
            <span>${this.getText(opt.label)}</span>
          </button>
        `;
      });
      html += `</div>`;
      return html;
    }

    if (step.options && Array.isArray(step.options)) {
      const isGrid = step.options.length <= 4;
      let html = `<div class="grid ${isGrid ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-3 w-full max-h-[220px] overflow-y-auto pr-1">`;
      step.options.slice(0, 6).forEach((opt, idx) => {
        html += `
          <button class="carplay-opt-btn p-3.5 rounded-2xl bg-[#1C1C1E] border-2 border-[#3A3A3C] text-white font-bold text-sm md:text-base hover:border-[#0A84FF] hover:bg-[#2C2C2E] active:scale-95 transition-all flex items-center gap-3 text-left" data-value="${opt.id}">
            <span class="w-7 h-7 rounded-full bg-[#2C2C2E] text-[#0A84FF] flex items-center justify-center text-xs font-black flex-shrink-0">${idx + 1}</span>
            ${opt.emoji ? `<span class="text-xl flex-shrink-0">${opt.emoji}</span>` : ""}
            <span class="truncate">${this.getText(opt.label)}</span>
          </button>
        `;
      });
      html += `</div>`;
      return html;
    }

    if (step.type === "social_proof" || step.type === "personalized_summary") {
      return `
        <div class="flex flex-col items-center justify-center py-4">
          <p class="text-base text-neutral-300 text-center max-w-lg mb-4">
            ${this.getText(step.subtitle)}
          </p>
          <button id="carplay-continue-btn" class="py-4 px-8 rounded-2xl bg-[#0A84FF] text-white font-extrabold text-lg shadow-lg hover:bg-blue-600 active:scale-95 transition-all">
            Continuar ➔
          </button>
        </div>
      `;
    }

    return `<div class="text-center text-neutral-400 py-4">Presiona Continuar o di tu respuesta en voz alta.</div>`;
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  postRenderBindings(step) {
    // Grid cards / single select
    document.querySelectorAll(".opt-card").forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-value");
        this.selectAnswer(val);
      });
    });

    // Statements
    document.querySelectorAll(".statement-card").forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-value");
        this.selectAnswer(val);
      });
    });

    // Multi select
    document.querySelectorAll(".multi-card").forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-value");
        this.toggleMultiAnswer(val);
      });
    });

    const multiBtn = document.getElementById("multi-continue-btn");
    if (multiBtn) {
      multiBtn.addEventListener("click", () => {
        if ((this.answers[step.id] || []).length > 0) {
          this.soundManager.playClick();
          this.nextStep();
        }
      });
    }

    // Word chips
    document.querySelectorAll(".word-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const val = chip.getAttribute("data-value");
        this.toggleMultiAnswer(val);
      });
    });

    const wordsBtn = document.getElementById("words-continue-btn");
    if (wordsBtn) {
      wordsBtn.addEventListener("click", () => {
        this.soundManager.playClick();
        this.nextStep();
      });
    }

    // Interest chips
    document.querySelectorAll(".interest-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const val = chip.getAttribute("data-value");
        this.toggleMultiAnswer(val);
      });
    });

    const interestsBtn = document.getElementById("interests-continue-btn");
    if (interestsBtn) {
      interestsBtn.addEventListener("click", () => {
        if ((this.answers[step.id] || []).length >= 3) {
          this.soundManager.playSuccess();
          this.nextStep();
        }
      });
    }

    // Language Dropdown
    document.querySelectorAll(".lang-opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        const val = opt.getAttribute("data-value");
        this.answers[step.id] = val;
        this.soundManager.playClick();
        this.render();
      });
    });

    const langBtn = document.getElementById("lang-continue-btn");
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        this.soundManager.playClick();
        this.nextStep();
      });
    }

    const langSearch = document.getElementById("lang-search");
    if (langSearch) {
      langSearch.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll(".lang-opt").forEach((el) => {
          const text = el.innerText.toLowerCase();
          el.style.display = text.includes(q) ? "flex" : "none";
        });
      });
    }

    // Social Proof Continue
    const ctaContinue = document.getElementById("cta-continue-btn");
    if (ctaContinue) {
      ctaContinue.addEventListener("click", () => {
        this.soundManager.playClick();
        this.nextStep();
      });
    }

    // Duration Selector on Final Screen
    document.querySelectorAll(".duration-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.answers["duration"] = btn.getAttribute("data-val");
        this.soundManager.playClick();
        this.render();
      });
    });

    // Final CTA button -> Enter Advanced Conversational Dialogue
    const finalCta = document.getElementById("final-cta-btn");
    if (finalCta) {
      finalCta.addEventListener("click", () => {
        this.soundManager.playSuccess();
        this.isDialogueMode = true;
        this.render();
      });
    }
  }

  postRenderCarPlayBindings(step) {
    const cpDockDialogue = document.getElementById("carplay-dock-dialogue-btn");
    if (cpDockDialogue) {
      cpDockDialogue.addEventListener("click", () => {
        this.soundManager.playCarPlayChime();
        this.isDialogueMode = true;
        this.render();
      });
    }
    document.querySelectorAll(".carplay-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-value");
        this.soundManager.playCarPlayChime();
        this.selectAnswer(val);
      });
    });

    const cContinue = document.getElementById("carplay-continue-btn");
    if (cContinue) {
      cContinue.addEventListener("click", () => {
        this.soundManager.playCarPlayChime();
        this.nextStep();
      });
    }

    const cPrev = document.getElementById("carplay-prev-btn");
    if (cPrev) {
      cPrev.addEventListener("click", () => {
        this.speakCurrentStep();
      });
    }

    const cNext = document.getElementById("carplay-next-btn");
    if (cNext) {
      cNext.addEventListener("click", () => {
        this.soundManager.playCarPlayChime();
        this.nextStep();
      });
    }

    const cListen = document.getElementById("carplay-listen-btn");
    if (cListen) {
      cListen.addEventListener("click", () => {
        this.soundManager.startListening(this.currentLang, (transcript) => {
          const matched = this.carplay.handleVoiceAnswer(transcript, step, this.currentLang);
          if (matched) {
            this.soundManager.playSuccess();
          }
        });
      });
    }

    const cMic = document.getElementById("carplay-mic-btn");
    if (cMic) {
      cMic.addEventListener("click", () => {
        this.soundManager.startListening(this.currentLang, (transcript) => {
          this.carplay.handleVoiceAnswer(transcript, step, this.currentLang);
        });
      });
    }

    const cHome = document.getElementById("carplay-home-btn");
    if (cHome) {
      cHome.addEventListener("click", () => {
        this.soundManager.playCarPlayChime();
        this.currentStepIndex = 0;
        this.history = [];
        this.render();
      });
    }
  }
}

// Bootstrap on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.learnaApp = new LearnaApp();
});

