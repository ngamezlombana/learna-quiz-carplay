// Learna AI English Tutor - Complete Reverse-Engineered Quiz Data
// Extracted via REA from https://ailearna.com/onboarding-quiz-native

export const quizData = {
  metadata: {
    title: "AI English Quiz",
    tutorName: "Learna AI",
    targetLanguage: "en",
    version: "2.4.0",
    totalSteps: 22
  },

  languages: [
    { code: "es", name: "Español", emoji: "🇪🇸" },
    { code: "en", name: "English", emoji: "🇬🇧" },
    { code: "pt", name: "Português", emoji: "🇵🇹" },
    { code: "fr", name: "Français", emoji: "🇫🇷" },
    { code: "de", name: "Deutsch", emoji: "🇩🇪" },
    { code: "it", name: "Italiano", emoji: "🇮🇹" },
    { code: "tr", name: "Türkçe", emoji: "🇹🇷" },
    { code: "ru", name: "Русский", emoji: "🇷🇺" },
    { code: "ja", name: "日本語", emoji: "🇯🇵" },
    { code: "ko", name: "한국어", emoji: "🇰🇷" },
    { code: "zh", name: "中文", emoji: "🇨🇳" },
    { code: "ar", name: "العربية", emoji: "🇸🇦" },
    { code: "pl", name: "Polski", emoji: "🇵🇱" },
    { code: "uk", name: "Українська", emoji: "🇺🇦" },
    { code: "vi", name: "Tiếng Việt", emoji: "🇻🇳" },
    { code: "id", name: "Bahasa Indonesia", emoji: "🇮🇩" }
  ],

  steps: [
    // Step 0: Age Selection
    {
      id: "select_age",
      type: "grid_cards",
      component: "OnboardingSelectListAge",
      title: {
        en: "Discover Your English Potential",
        es: "Descubre tu potencial en inglés"
      },
      subtitle: {
        en: "Get your personalized learning plan tailored to your language goals.",
        es: "Obtén tu plan de aprendizaje personalizado adaptado a tus objetivos."
      },
      badge: "3 MINUTE QUIZ",
      voicePrompt: {
        en: "Welcome to Learna! Let's discover your English potential. How old are you?",
        es: "¡Bienvenido a Learna! Vamos a descubrir tu potencial. ¿Cuántos años tienes?"
      },
      options: [
        {
          id: "18_24",
          label: { en: "Age: 18-24", es: "Edad: 18-24" },
          img: "/assets/images/survey-onboarding/age/age-18-24.png",
          spokenValue: "18 to 24"
        },
        {
          id: "25_34",
          label: { en: "Age: 25-34", es: "Edad: 25-34" },
          img: "/assets/images/survey-onboarding/age/age-25-34.png",
          spokenValue: "25 to 34"
        },
        {
          id: "35_44",
          label: { en: "Age: 35-44", es: "Edad: 35-44" },
          img: "/assets/images/survey-onboarding/age/age-35-44.png",
          spokenValue: "35 to 44"
        },
        {
          id: "45_plus",
          label: { en: "Age: 45+", es: "Edad: 45+" },
          img: "/assets/images/survey-onboarding/age/age-45-plus.png",
          spokenValue: "45 and older"
        }
      ]
    },

    // Step 1: Language Selection
    {
      id: "select_language",
      type: "dropdown",
      component: "OnboardingDropdown",
      title: {
        en: "What is your native language?",
        es: "¿Cuál es tu lengua materna?"
      },
      subtitle: {
        en: "Your AI tutor will explain grammar and provide tips in this language.",
        es: "Tu tutor de IA te explicará gramática y consejos en este idioma."
      },
      voicePrompt: {
        en: "What is your native language? For example, Spanish, French, or German.",
        es: "¿Cuál es tu idioma nativo? Por ejemplo, español o portugués."
      }
    },

    // Step 2: Social Proof Community
    {
      id: "social_proof_community",
      type: "social_proof",
      component: "OnboardingSocialProofColored",
      title: {
        en: "Join 500,000+ English Learners",
        es: "Únete a más de 500,000 estudiantes de inglés"
      },
      subtitle: {
        en: "People in 160+ countries use Learna to practice speaking freely and overcome language barriers.",
        es: "Personas en más de 160 países usan Learna para practicar conversación sin miedos ni juicios."
      },
      lottie: "/assets/lotties/learna_users.json",
      stats: [
        { number: "500K+", label: { en: "Active Learners", es: "Estudiantes activos" } },
        { number: "4.8★", label: { en: "App Store Rating", es: "Calificación App Store" } },
        { number: "94%", label: { en: "Feel More Confident", es: "Mayor confianza al hablar" } }
      ],
      voicePrompt: {
        en: "Over 500,000 learners are speaking English with Learna. Let's find your current level. Tap Continue.",
        es: "Más de 500 mil estudiantes hablan inglés con Learna. Continuemos para evaluar tu nivel."
      }
    },

    // Step 3: Proficiency Level
    {
      id: "select_proficiency",
      type: "list_single",
      component: "OnboardingSelectListOne",
      title: {
        en: "What is your English level?",
        es: "¿Cuál es tu nivel de inglés?"
      },
      subtitle: {
        en: "Choose the level that best reflects your current speaking ability.",
        es: "Elige el nivel que mejor refleje tu habilidad actual de conversación."
      },
      voicePrompt: {
        en: "What is your English level? Beginner, Intermediate, or Advanced?",
        es: "¿Cuál es tu nivel de inglés? Principiante, Intermedio o Avanzado?"
      },
      options: [
        {
          id: "beginner",
          level: "A1",
          label: { en: "Beginner", es: "Principiante" },
          description: { en: "I know basic greetings and simple isolated words", es: "Conozco saludos básicos y palabras sueltas" },
          img: "/assets/images/survey-onboarding/proficiency/beginner.png",
          spokenValue: "Beginner"
        },
        {
          id: "pre_intermediate",
          level: "A2",
          label: { en: "Pre-Intermediate", es: "Pre-Intermedio" },
          description: { en: "I can communicate in simple daily situations", es: "Puedo comunicarme en situaciones cotidianas simples" },
          img: "/assets/images/survey-onboarding/proficiency/pre-intermediate.png",
          spokenValue: "Pre-Intermediate"
        },
        {
          id: "intermediate",
          level: "B1",
          label: { en: "Intermediate", es: "Intermedio" },
          description: { en: "I can have basic conversations on familiar topics", es: "Puedo mantener conversaciones sobre temas conocidos" },
          img: "/assets/images/survey-onboarding/proficiency/intermediate.png",
          spokenValue: "Intermediate"
        },
        {
          id: "upper_intermediate",
          level: "B2",
          label: { en: "Upper-Intermediate", es: "Intermedio Alto" },
          description: { en: "I express ideas fluently with minor hesitations", es: "Expreso ideas con fluidez con pequeños tropiezos" },
          img: "/assets/images/survey-onboarding/proficiency/upper-intermediate.png",
          spokenValue: "Upper Intermediate"
        },
        {
          id: "advanced",
          level: "C1",
          label: { en: "Advanced", es: "Avanzado" },
          description: { en: "I communicate effortlessly in professional & social contexts", es: "Me comunico cómodamente en entornos profesionales y sociales" },
          img: "/assets/images/survey-onboarding/proficiency/advanced.png",
          spokenValue: "Advanced"
        },
        {
          id: "proficient",
          level: "C2",
          label: { en: "Proficient", es: "Competente / Fluido" },
          description: { en: "Near-native precision, nuances, and natural mastery", es: "Dominio cercano al nativo con total soltura" },
          img: "/assets/images/survey-onboarding/proficiency/proficient.png",
          spokenValue: "Proficient"
        }
      ]
    },

    // Step 4: Motivation
    {
      id: "select_motivation",
      type: "list_multi",
      component: "OnboardingSelectListMulti",
      title: {
        en: "Why do you want to learn English?",
        es: "¿Por qué quieres aprender inglés?"
      },
      subtitle: {
        en: "Select all that apply to you.",
        es: "Selecciona todas las que apliquen a tu caso."
      },
      voicePrompt: {
        en: "Why do you want to learn English? For work, daily conversations, travel, or exams?",
        es: "¿Por qué deseas aprender inglés? ¿Trabajo, viajes, exámenes o conversación diaria?"
      },
      options: [
        { id: "work", emoji: "💼", label: { en: "Work and career advancement", es: "Trabajo y crecimiento profesional" } },
        { id: "social", emoji: "💬", label: { en: "Daily casual conversations", es: "Conversaciones cotidianas" } },
        { id: "travel", emoji: "✈️", label: { en: "Moving or traveling abroad", es: "Viajes o mudanza al extranjero" } },
        { id: "study", emoji: "🎓", label: { en: "Exam preparation (IELTS / TOEFL)", es: "Preparación para exámenes (IELTS / TOEFL)" } },
        { id: "education", emoji: "📚", label: { en: "Education and university studies", es: "Estudios y formación académica" } },
        { id: "communicating", emoji: "🤝", label: { en: "Connecting with friends & partners", es: "Conectar con amigos y parejas" } },
        { id: "brain_training", emoji: "🧠", label: { en: "Brain training & mental sharpness", es: "Entrenamiento mental y agilidad" } },
        { id: "other", emoji: "🌟", label: { en: "Personal interest and culture", es: "Interés personal y cultura" } }
      ]
    },

    // Step 5: Social Proof Phone
    {
      id: "social_proof_phone",
      type: "social_proof",
      component: "OnboardingSocialProofColored",
      title: {
        en: "Speak Without Fear or Judgement",
        es: "Habla sin miedo ni vergüenza"
      },
      subtitle: {
        en: "Learna's AI tutor listens patiently, corrects grammar in real time, and helps you speak naturally.",
        es: "El tutor de IA de Learna te escucha con paciencia, corrige tu pronunciación y te ayuda a soltarte."
      },
      lottie: "/assets/lotties/learna_apps.json",
      voicePrompt: {
        en: "With Learna you can practice speaking anywhere, even in your car. Tap Continue.",
        es: "Con Learna puedes practicar en cualquier lugar, incluso conduciendo. Continuemos."
      }
    },

    // Step 6: Learning Goal
    {
      id: "select_goal",
      type: "list_single",
      component: "OnboardingSelectListOne",
      title: {
        en: "What level of English do you aim to achieve?",
        es: "¿Qué meta de inglés deseas alcanzar?"
      },
      subtitle: {
        en: "We will build your 30-day curriculum around this milestone.",
        es: "Construiremos tu plan de 30 días enfocado en este objetivo."
      },
      voicePrompt: {
        en: "What is your main goal? To speak confidently, understand natives, or watch movies?",
        es: "¿Cuál es tu meta principal? ¿Hablar con confianza, entender a nativos o ver películas?"
      },
      options: [
        { id: "speak", emoji: "🗣️", label: { en: "Speak confidently with native speakers", es: "Hablar con soltura con hablantes nativos" } },
        { id: "watch", emoji: "🎬", label: { en: "Watch movies & shows without subtitles", es: "Ver películas y series sin subtítulos" } },
        { id: "understand", emoji: "🎧", label: { en: "Understand fast conversations effortlessly", es: "Entender conversaciones rápidas sin esfuerzo" } },
        { id: "read", emoji: "📖", label: { en: "Read articles, books, and emails fluently", es: "Leer artículos, libros y correos con fluidez" } }
      ]
    },

    // Step 7: Diagnostic Intro
    {
      id: "social_proof_personalized_intro",
      type: "social_proof",
      component: "OnboardingSocialProofColored",
      title: {
        en: "Let's Diagnose Your Speaking Hurdles",
        es: "Diagnostiquemos tus obstáculos al hablar"
      },
      subtitle: {
        en: "7 quick statements to find your biggest blockers and eliminate them step by step.",
        es: "7 afirmaciones breves para descubrir tus principales dificultades y superarlas."
      },
      voicePrompt: {
        en: "Now, tell me how true each of the next statements is for you. True, Partially True, or Not True.",
        es: "Ahora indica qué tan cierta es cada afirmación para ti. Verdadero, Parcialmente cierto o Falso."
      }
    },

    // Steps 8-14: Diagnostic Self-Assessment
    {
      id: "statement_not_understand_fluent",
      type: "statement",
      component: "OnboardingSelectListOne",
      title: {
        en: "I don't understand when fast or fluent English is spoken.",
        es: "No entiendo cuando se habla inglés rápido o muy fluido."
      },
      subtitle: {
        en: "Is the following statement true for you?",
        es: "¿Es cierta esta afirmación para ti?"
      },
      voicePrompt: {
        en: "Statement 1: I don't understand when fast or fluent English is spoken. Is this True, Partially True, or Not True?",
        es: "Afirmación 1: No entiendo cuando se habla inglés rápido. ¿Verdadero, Parcialmente o Falso?"
      }
    },
    {
      id: "statement_few_words",
      type: "statement",
      component: "OnboardingSelectListOne",
      title: {
        en: "I get stuck while speaking because I know too few words.",
        es: "Me quedo trabado al hablar porque me faltan palabras de vocabulario."
      },
      subtitle: {
        en: "Is the following statement true for you?",
        es: "¿Es cierta esta afirmación para ti?"
      },
      voicePrompt: {
        en: "Statement 2: I get stuck while speaking because I know too few words. True, Partially True, or Not True?",
        es: "Afirmación 2: Me quedo trabado al hablar por falta de vocabulario. ¿Verdadero, Parcialmente o Falso?"
      }
    },
    {
      id: "statement_incorrect_sentences",
      type: "statement",
      component: "OnboardingSelectListOne",
      title: {
        en: "I always worry about forming sentences incorrectly when speaking.",
        es: "Siempre me preocupa armar mal las frases o cometer errores gramaticales."
      },
      subtitle: {
        en: "Is the following statement true for you?",
        es: "¿Es cierta esta afirmación para ti?"
      },
      voicePrompt: {
        en: "Statement 3: I worry about forming sentences incorrectly. True, Partially True, or Not True?",
        es: "Afirmación 3: Me preocupa armar mal las frases. ¿Verdadero, Parcialmente o Falso?"
      }
    },
    {
      id: "statement_understand_cant_speak",
      type: "statement",
      component: "OnboardingSelectListOne",
      title: {
        en: "I understand English in my head, but I freeze when trying to speak.",
        es: "Entiendo inglés en mi mente, pero me bloqueo al intentar hablar."
      },
      subtitle: {
        en: "Is the following statement true for you?",
        es: "¿Es cierta esta afirmación para ti?"
      },
      voicePrompt: {
        en: "Statement 4: I understand in my head, but I freeze when speaking. True, Partially True, or Not True?",
        es: "Afirmación 4: Entiendo en mi mente, pero me bloqueo al hablar. ¿Verdadero, Parcialmente o Falso?"
      }
    },
    {
      id: "statement_improve_fluency",
      type: "statement",
      component: "OnboardingSelectListOne",
      title: {
        en: "I can speak basic English, but I need to be much more fluent.",
        es: "Puedo hablar inglés básico, pero necesito ser mucho más fluido y espontáneo."
      },
      subtitle: {
        en: "Is the following statement true for you?",
        es: "¿Es cierta esta afirmación para ti?"
      },
      voicePrompt: {
        en: "Statement 5: I can speak basic English, but I need more fluency. True, Partially True, or Not True?",
        es: "Afirmación 5: Puedo hablar básico pero necesito más fluidez. ¿Verdadero, Parcialmente o Falso?"
      }
    },
    {
      id: "statement_no_practice_partner",
      type: "statement",
      component: "OnboardingSelectListOne",
      title: {
        en: "I don't have a partner to practice speaking with whenever I want.",
        es: "No tengo a nadie con quien practicar conversación cuando yo quiera."
      },
      subtitle: {
        en: "Is the following statement true for you?",
        es: "¿Es cierta esta afirmación para ti?"
      },
      voicePrompt: {
        en: "Statement 6: I don't have a practice partner whenever I want. True, Partially True, or Not True?",
        es: "Afirmación 6: No tengo con quién practicar cuando quiera. ¿Verdadero, Parcialmente o Falso?"
      }
    },
    {
      id: "statement_struggle_movies",
      type: "statement",
      component: "OnboardingSelectListOne",
      title: {
        en: "I struggle when watching English movies or listening to podcasts.",
        es: "Me cuesta seguir películas o podcasts en inglés sin subtítulos."
      },
      subtitle: {
        en: "Is the following statement true for you?",
        es: "¿Es cierta esta afirmación para ti?"
      },
      voicePrompt: {
        en: "Statement 7: I struggle watching English movies without subtitles. True, Partially True, or Not True?",
        es: "Afirmación 7: Me cuesta ver películas en inglés sin subtítulos. ¿Verdadero, Parcialmente o Falso?"
      }
    },

    // Step 15: Improvement Area
    {
      id: "select_improvement_area",
      type: "list_single",
      component: "OnboardingSelectListOne",
      title: {
        en: "What area would you like to improve most?",
        es: "¿Qué área te gustaría mejorar primero?"
      },
      subtitle: {
        en: "Your tutor will prioritize exercises for this skill.",
        es: "Tu tutor priorizará ejercicios enfocados en esta destreza."
      },
      voicePrompt: {
        en: "What area do you want to improve most? Speaking, Listening, or Vocabulary?",
        es: "¿Qué área deseas mejorar primero? ¿Conversación, Comprensión auditiva o Vocabulario?"
      },
      options: [
        { id: "speaking", emoji: "🗣️", label: { en: "Speaking & Pronunciation", es: "Conversación y Pronunciación" } },
        { id: "listening", emoji: "🎧", label: { en: "Listening Comprehension", es: "Comprensión Auditiva" } },
        { id: "vocabulary", emoji: "📚", label: { en: "Vocabulary & Expressions", es: "Vocabulario y Expresiones" } }
      ]
    },

    // Step 16: Vocab intro
    {
      id: "social_proof_personalized_final",
      type: "social_proof",
      component: "OnboardingSocialProofColored",
      title: {
        en: "Calibrating Your Active Vocabulary",
        es: "Calibrando tu vocabulario activo"
      },
      subtitle: {
        en: "Select the words you recognize instantly to pinpoint your CEFR vocabulary grade.",
        es: "Selecciona las palabras que reconoces al instante para calibrar tu nivel de vocabulario."
      },
      voicePrompt: {
        en: "Great! Now let's test your vocabulary. Tap Continue.",
        es: "¡Excelente! Ahora calibraremos tu vocabulario. Pulsa Continuar."
      }
    },

    // Step 17: Beginner Words
    {
      id: "select_words_beginner",
      type: "words_check",
      level: "A1-A2",
      title: {
        en: "Select all the words you know:",
        es: "Selecciona las palabras que conozcas:"
      },
      subtitle: {
        en: "A1-A2 Beginner Level",
        es: "Nivel Principiante (A1-A2)"
      },
      voicePrompt: {
        en: "Select the words you know: laugh, run, drink, simple, garden, weather.",
        es: "Selecciona las palabras que conozcas de nivel principiante."
      },
      words: ["laugh", "run", "drink", "simple", "garden", "weather", "quiet", "friendly", "clean", "listen", "breakfast", "travel"]
    },

    // Step 18: Intermediate Words
    {
      id: "select_words_intermediate",
      type: "words_check",
      level: "B1-B2",
      title: {
        en: "Select all the words you know:",
        es: "Selecciona las palabras que conozcas:"
      },
      subtitle: {
        en: "B1-B2 Intermediate Level",
        es: "Nivel Intermedio (B1-B2)"
      },
      voicePrompt: {
        en: "Select the words you know: challenge, disappointment, concentrate, convenient, opportunity.",
        es: "Selecciona las palabras que conozcas de nivel intermedio."
      },
      words: ["challenge", "disappointment", "concentrate", "convenient", "opportunity", "negotiate", "persuade", "perspective", "emphasize", "flexible", "accomplish", "reliable"]
    },

    // Step 19: Advanced Words
    {
      id: "select_words_advanced",
      type: "words_check",
      level: "C1-C2",
      title: {
        en: "Select all the words you know:",
        es: "Selecciona las palabras que conozcas:"
      },
      subtitle: {
        en: "C1-C2 Advanced Level",
        es: "Nivel Avanzado (C1-C2)"
      },
      voicePrompt: {
        en: "Select the words you know: ambiguity, intricate, articulate, meticulous, ephemeral, plausible.",
        es: "Selecciona las palabras que conozcas de nivel avanzado."
      },
      words: ["ambiguity", "intricate", "articulate", "meticulous", "ephemeral", "scrutinize", "ubiquitous", "plausible", "resilient", "paradoxical", "comprehensive", "compelling"]
    },

    // Step 20: Interests
    {
      id: "select_interests",
      type: "interests",
      component: "OnboardingSelectListMulti",
      title: {
        en: "What are your personal interests?",
        es: "¿Cuáles son tus temas de interés?"
      },
      subtitle: {
        en: "Your AI tutor will customize conversation scenarios around these topics.",
        es: "Tu tutor de IA personalizará las charlas según tus temas favoritos."
      },
      voicePrompt: {
        en: "What topics do you enjoy? Choose travel, technology, music, business, or movies.",
        es: "¿Qué temas te gustan? Viajes, tecnología, música, negocios o películas."
      },
      options: [
        { id: "technology", emoji: "🤖", label: { en: "Technology & AI", es: "Tecnología e IA" } },
        { id: "travel", emoji: "🧳", label: { en: "Travel & Cultures", es: "Viajes y Culturas" } },
        { id: "movies", emoji: "🍿", label: { en: "Movies & Shows", es: "Películas y Series" } },
        { id: "business", emoji: "💼", label: { en: "Business & Startups", es: "Negocios y Startups" } },
        { id: "food", emoji: "🥑", label: { en: "Food & Cooking", es: "Comida y Cocina" } },
        { id: "sports", emoji: "⚽", label: { en: "Sports & Fitness", es: "Deportes y Fitness" } },
        { id: "music", emoji: "🎻", label: { en: "Music & Concerts", es: "Música y Conciertos" } },
        { id: "psychology", emoji: "🧠", label: { en: "Psychology & Mind", es: "Psicología y Mente" } },
        { id: "finance", emoji: "💰", label: { en: "Finance & Investing", es: "Finanzas e Inversión" } },
        { id: "science", emoji: "🔬", label: { en: "Science & Space", es: "Ciencia y Espacio" } },
        { id: "pets", emoji: "🐾", label: { en: "Pets & Animals", es: "Mascotas y Animales" } },
        { id: "fashion", emoji: "💅", label: { en: "Fashion & Lifestyle", es: "Moda y Estilo" } },
        { id: "literature", emoji: "📖", label: { en: "Books & Literature", es: "Libros y Literatura" } },
        { id: "social_media", emoji: "📱", label: { en: "Gaming & Creators", es: "Videojuegos y Creadores" } },
        { id: "art_creativity", emoji: "🎨", label: { en: "Art & Design", es: "Arte y Creatividad" } }
      ]
    },

    // Step 21: Personalized Plan & Results
    {
      id: "personalized",
      type: "personalized_summary",
      component: "OnboardingPersonalized",
      title: {
        en: "Your Personalized Learning Plan is Ready!",
        es: "¡Tu plan de aprendizaje personalizado está listo!"
      },
      subtitle: {
        en: "Tailored specially for you to reach confident fluency in 30 days.",
        es: "Diseñado especialmente para ti para alcanzar fluidez en 30 días."
      },
      lottieGraph: "/assets/lotties/1.onb.json",
      tutorAvatar: "/assets/images/personalize/ai-tutor-head-x.png",
      quote: {
        author: "Maria Angelica Reyes, 35",
        country: "Philippines",
        avatar: "/assets/images/survey-onboarding/personalized/user1.png",
        text: {
          en: "Learna helped me overcome my fear of speaking in English. Practicing 10 minutes a day on my commute made all the difference!",
          es: "Learna me ayudó a superar el miedo a hablar en inglés. ¡Practicar 10 minutos al día en el auto marcó toda la diferencia!"
        }
      },
      voicePrompt: {
        en: "Congratulations! Your personalized English plan is ready. Let's see your results and start speaking.",
        es: "¡Felicidades! Tu plan personalizado está listo. Comencemos a hablar."
      }
    }
  ],

  // Diagnostic Statement Options
  statementOptions: [
    { id: "true", label: { en: "True", es: "Verdadero" }, value: 2 },
    { id: "partially_true", label: { en: "Partially true", es: "Parcialmente cierto" }, value: 1 },
    { id: "false", label: { en: "That's not true for me", es: "No es cierto en mi caso" }, value: 0 }
  ]
};

