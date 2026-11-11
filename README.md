# Learna AI English Quiz & Apple CarPlay Clone 🚗 📱

Clon de alta fidelidad de la experiencia interactiva de onboarding de **Learna AI English Tutor** (`https://ailearna.com/onboarding-quiz-native`), recreado mediante ingeniería inversa con **REA (Reverse Engineer Anything)** y adaptado tanto para dispositivos móviles/web como para el sistema de infoentretenimiento **Apple CarPlay**.

---

## 🌟 Características Principales

### 1. Clon Pixel-Perfect de Learna (`ailearna.com`)
- **22 pasos completos** del flujo de diagnóstico y evaluación lingüística CEFR (A1 a C2):
  - **Paso 0**: Selección de edad con tarjetas visuales (`age-18-24.png`, etc.)
  - **Paso 1**: Selector de idioma nativo (Español, Portugués, Francés, Alemán, etc.)
  - **Pasos 2, 5, 7, 16**: Pantallas de prueba social con animaciones Lottie originales (`learna_users.json`, `learna_apps.json`)
  - **Paso 3**: Nivel de dominio actual (Beginner a Proficient) con insignias visuales
  - **Paso 4**: Motivaciones de aprendizaje (trabajo, viajes, exámenes, etc.)
  - **Paso 6**: Metas específicas (fluidez, ver películas sin subtítulos, etc.)
  - **Pasos 8–14**: 7 declaraciones de autodiagnóstico (True, Partially true, False)
  - **Paso 15**: Área de enfoque (Conversación, Comprensión auditiva, Vocabulario)
  - **Pasos 17–19**: Test rápido de calibración de vocabulario por niveles
  - **Paso 20**: Selección de temas de interés (tecnología, viajes, cine, negocios, etc.)
  - **Paso 21**: Plan de fluidez a 30 días, selector de práctica diaria (5, 10 o 15 min), tutor de IA asignado y testimonio de María Angélica Reyes.

### 2. Modo Avanzado de Diálogo Conversacional Multi-Acento 🗣️
Puedes acceder directamente pulsando el botón **"🗣️ Diálogo IA"** en la barra superior o al finalizar el quiz:
- **7 Acentos Regionales de Inglés con Voces Neuronales Auténticas (Edge-TTS)**:
  - 🇺🇸 **American English**: *Emma Davis (New York)* — Claro, rhotico, modismos y expresiones casuales cotidianas.
  - 🇬🇧 **British English (RP)**: *Oliver Wright (London)* — Articulado, vocabulario refinado y modismos británicos (*"brilliant"*, *"spot on"*).
  - 🇦🇺 **Australian English**: *Natasha Hayes (Sydney)* — Cadencia australiana cálida y expresiones típicas (*"no worries"*, *"too easy"*).
  - 🇮🇪 **Irish English**: *Emily O'Connor (Dublin)* — Entonación melódica y ritmo musical irlandés (*"grand"*, *"what's the craic?"*).
  - 🇮🇳 **Indian English**: *Neerja Sharma (Bangalore)* — Ritmo claro de sílabas marcadas, ideal para tecnología y negocios globales.
  - 🇨🇦 **Canadian English**: *Liam Tremblay (Toronto)* — Pronunciación norteamericana pulcra con calidez canadiense.
  - 🇿🇦 **South African English**: *Leah Van Zyl (Cape Town)* — Entonación sudafricana única y expresiones locales (*"howzit"*, *"lekker"*).
- **Escenarios de Conversación**:
  - 💬 Charla Casual Diaria
  - 🚗 Diálogo en el Auto / Conducción (Optimizado para Apple CarPlay)
  - ☕ Pedidos en la Cafetería / Restaurante
  - 💼 Entrevista de Trabajo y Reuniones de Negocios
  - ✈️ Aeropuerto y Situaciones de Viaje
  - 🧠 Debate sobre Inteligencia Artificial y Futuro
- **Coaching en Tiempo Real**:
  - La IA analiza lo que dices y resalta sugerencias gramaticales constructivas (ej. corregir *"I have 25 years"* por *"I am 25 years old"* o *"I am agree"* por *"I agree"*).
- **Voz 100% Manos Libres en Conducción (Bucle Conversacional Continuo)**:
  - **Cero toques en pantalla**: El conductor **nunca** debe oprimir "Enviar" mientras maneja.
  - **Detección Automática de Actividad de Voz (VAD) con Silencio Prolongado Investigado**:
    - Se implementó un umbral de silencio final (*trailing silence endpointing*) de **2.0 segundos**, el estándar de oro en sistemas de voz automotrices (según directrices de la **NHTSA** y especificaciones de **Apple CarPlay / Siri, Android Auto y Nuance Automotive**).
    - Permite al conductor vacilar o mirar los retrovisores sin ser interrumpido a mitad de frase, y envía la respuesta con chime afirmativo apenas transcurre el silencio.
    - Incluye visualizador de ondas en tiempo real y barra de cuenta regresiva automática de 2.0s.
  - **Bucle Infinito de Diálogo**: El tutor IA habla -> el micrófono se activa automáticamente con un sutil timbre -> el conductor responde en inglés -> tras 2.0s de silencio se envía solo -> el tutor IA responde con el acento regional elegido -> el ciclo se repite de forma natural.
  - **Seguridad Vial y Volante**: Botón táctil grande y soporte de volante (`MediaSession`) para pausar (`⏸️`) o reanudar (`▶️`) el diálogo en cualquier momento.

### 3. Soporte para Apple CarPlay 🚗
Dado que Apple CarPlay prohíbe el uso de navegadores web estándar mientras se conduce por razones de seguridad vial, la experiencia se adaptó según las directrices oficiales de Apple (**Human Interface Guidelines for CarPlay**):
- **Modo Infoentretenimiento Vehicular**:
  - Bisel de pantalla CarPlay (800x480) con dock lateral (reloj 12:45, cobertura 5G, botón Home circular de iOS).
  - Interfaz de alto contraste (fondo oscuro `#0A0A0C`, tarjetas táctiles grandes `#1C1C1E`, botón de respuesta mínimo 60px).
- **Asistente de Voz Manos Libres**:
  - Lectura en voz alta de preguntas y opciones mediante **Text-To-Speech (TTS)**.
  - Reconocimiento de voz del conductor mediante **Speech Recognition (STT)**: el conductor puede responder en voz alta (ej. *"Intermedio"*, *"Trabajo"*, *"Opción 1"*, *"Verdadero"*).
- **Controles del Volante & MediaSession API**:
  - Integración nativa con `navigator.mediaSession`:
    - Botón de pista siguiente en el volante ⏭️: Avanza a la siguiente pregunta.
    - Botón de pista anterior en el volante ⏮️: Repite la pregunta por los altavoces del auto.
    - Metadatos en la pantalla *Now Playing* de CarPlay con el icono del tutor de Learna.
- **Puente Nativo Swift para iOS (Xcode)**:
  - Archivos nativos en `ios/LearnaCarPlay/` con `CPTemplateApplicationSceneDelegate`, `CPListTemplate` y `CPVoiceControlTemplate` para compilar directamente una app nativa de iOS compatible con CarPlay.

---

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Servidor Python (Recomendada)
```bash
python3 server.py
```
Abre en tu navegador:
- **http://localhost:8080**

### Opción 2: Script de Lanzamiento Rápido
```bash
./launch.sh
```

---

## 🎮 Controles de la Interfaz

- **🚗 / 📱 Botón Modo (Arriba a la derecha)**: Alterna entre el diseño estándar de teléfono móvil y la pantalla de tablero de **Apple CarPlay**.
- **🔊 / 🔇 Botón Voz**: Activa o desactiva la narración de audio del tutor de IA.
- **🇪🇸 / 🇬🇧 Selector de Idioma**: Cambia al instante entre Español e Inglés.
- **⬅️ Flecha Atrás**: Permite retroceder en cualquier momento para corregir una respuesta.

---

## 📂 Estructura del Proyecto

```text
learna-quiz-carplay/
├── extracted/                 # Datos, scripts y recursos extraídos mediante REA
│   ├── index.html
│   ├── survey_onboarding_flow.json
│   ├── translations_en.json
│   └── nuxt_scripts/
├── public/                    # Aplicación Web Frontend
│   ├── index.html             # Shell principal con alternador Móvil / CarPlay
│   ├── css/
│   │   └── style.css          # Estilos Tailwind y tema automotriz CarPlay
│   ├── js/
│   │   ├── app.js             # Coordinador de vistas y estado
│   │   ├── quizData.js        # Estructura de las 22 preguntas y opciones
│   │   ├── soundManager.js    # Motor de sonido Web Audio + TTS/STT
│   │   └── carplayController.js # Controlador CarPlay y MediaSession
│   └── assets/
│       ├── images/            # Imágenes originales descargadas
│       └── lotties/           # Archivos Lottie JSON
├── ios/                       # Código Nativo para Apple CarPlay (Xcode)
│   └── LearnaCarPlay/
│       ├── CarPlaySceneDelegate.swift
│       ├── CarPlayQuizManager.swift
│       └── Info.plist
├── server.py                  # Servidor HTTP local con CORS
├── launch.sh                  # Script ejecutable de inicio
└── README.md
```

---

## 🛠️ Ingeniería Inversa con REA (Reverse Engineer Anything)

Para clonar esta aplicación se utilizó la herramienta REA sobre el target `https://ailearna.com/onboarding-quiz-native`:
1. **Inspección de Bundles**: Se analizaron los bundles de Nuxt 3 y Pinia (`Df16ugFv.js`, `B-Cj1HSA.js`, `BsF7qoW02.js`).
2. **Devaluación de Estado**: Se decodificó el payload hidratado de Nuxt (`window.__NUXT__`) para recuperar las definiciones exactas de los 22 pasos del onboarding.
3. **Extracción de Recursos**: Se recuperaron los vectores gráficos, imágenes PNG de niveles y edad, y animaciones vectoriales Lottie.
4. **Recuperación del Prompt del Tutor**: Se identificaron las directrices pedagógicas del tutor conversacional de Learna codificadas en el bundle JavaScript.

