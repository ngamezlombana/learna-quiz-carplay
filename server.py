#!/usr/bin/env python3
"""
Learna AI Quiz & Apple CarPlay Server
- Serves static frontend assets
- Provides /api/accents for multi-accent English tutors
- Provides /api/tts for real-time neural speech synthesis with authentic accents (edge-tts)
- Provides /api/chat for AI tutor conversational dialogue with grammar coaching
"""

import http.server
import socketserver
import os
import sys
import json
import asyncio
import tempfile
import urllib.parse

# Try importing edge-tts
try:
    import edge_tts
    HAS_EDGE_TTS = True
except ImportError:
    HAS_EDGE_TTS = False

PORT = int(os.environ.get("PORT", 8080))
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

# Multi-Accent English Tutors Configuration
ACCENTS = [
    {
        "id": "en-US",
        "name": "American English",
        "flag": "🇺🇸",
        "tutor": "Emma Davis",
        "city": "New York, USA",
        "voice": "en-US-JennyNeural",
        "avatar": "/assets/images/personalize/ai-tutor-head-x.png",
        "description": "General American accent. Energetic, clear rhotic pronunciation, everyday idioms.",
        "sampleGreeting": "Hey there! I'm Emma from New York. Ready to practice natural American English today?"
    },
    {
        "id": "en-GB",
        "name": "British English (RP)",
        "flag": "🇬🇧",
        "tutor": "Oliver Wright",
        "city": "London, UK",
        "voice": "en-GB-SoniaNeural",
        "avatar": "/assets/images/survey-onboarding/proficiency/advanced.png",
        "description": "Received Pronunciation (London). Polite, articulate, rich vocabulary and British idioms.",
        "sampleGreeting": "Hello! I'm Oliver from London. It's brilliant to meet you. Let's sharpen your British English!"
    },
    {
        "id": "en-AU",
        "name": "Australian English",
        "flag": "🇦🇺",
        "tutor": "Natasha Hayes",
        "city": "Sydney, Australia",
        "voice": "en-AU-NatashaNeural",
        "avatar": "/assets/images/survey-onboarding/proficiency/intermediate.png",
        "description": "Aussie accent. Upbeat, warm inflection, casual expressions like 'no worries' and 'too easy'.",
        "sampleGreeting": "G'day! I'm Natasha from Sydney. No worries at all, we'll have you speaking fluent Aussie English in no time!"
    },
    {
        "id": "en-IE",
        "name": "Irish English",
        "flag": "🇮🇪",
        "tutor": "Emily O'Connor",
        "city": "Dublin, Ireland",
        "voice": "en-IE-EmilyNeural",
        "avatar": "/assets/images/survey-onboarding/proficiency/pre-intermediate.png",
        "description": "Dublin cadence. Musical melodic rhythm, welcoming tone, distinctive Irish turns of phrase.",
        "sampleGreeting": "Hi there! I'm Emily from Dublin. What's the craic? Let's have a grand chat in English today."
    },
    {
        "id": "en-IN",
        "name": "Indian English",
        "flag": "🇮🇳",
        "tutor": "Neerja Sharma",
        "city": "Bangalore, India",
        "voice": "en-IN-NeerjaNeural",
        "avatar": "/assets/images/survey-onboarding/proficiency/proficient.png",
        "description": "Clear South Asian English. Fast syllable-timed rhythm, ideal for global tech and business.",
        "sampleGreeting": "Namaste and hello! I am Neerja from Bangalore. Let us practice English for global communication and business!"
    },
    {
        "id": "en-CA",
        "name": "Canadian English",
        "flag": "🇨🇦",
        "tutor": "Liam Tremblay",
        "city": "Toronto, Canada",
        "voice": "en-CA-ClaraNeural",
        "avatar": "/assets/images/survey-onboarding/proficiency/upper-intermediate.png",
        "description": "Canadian accent. Crisp vowels, friendly and encouraging, Canadian phrasing.",
        "sampleGreeting": "Hi there, welcome! I'm Liam from Toronto. Excited to practice conversational English with you today, eh?"
    },
    {
        "id": "en-ZA",
        "name": "South African English",
        "flag": "🇿🇦",
        "tutor": "Leah Van Zyl",
        "city": "Cape Town, South Africa",
        "voice": "en-ZA-LeahNeural",
        "avatar": "/assets/images/survey-onboarding/age/age-25-34.png",
        "description": "South African cadence. Cosmopolitan rhythm, crisp consonants, colorful expressions.",
        "sampleGreeting": "Howzit! I'm Leah from Cape Town. It's lekker to have you here. Let's get talking!"
    }
]

# AI Tutor Dialogue Generator
def generate_tutor_response(user_text, accent_id, scenario="casual", history=None):
    accent_meta = next((a for a in ACCENTS if a["id"] == accent_id), ACCENTS[0])
    text_lower = user_text.lower().strip()
    
    # Accent flavor words
    flavor = {
        "en-US": {"cheer": "Awesome!", "agree": "Totally makes sense.", "idiom": "get the ball rolling"},
        "en-GB": {"cheer": "Brilliant!", "agree": "Quite right.", "idiom": "spot on"},
        "en-AU": {"cheer": "Too easy, mate!", "agree": "Spot on, no worries.", "idiom": "fair dinkum"},
        "en-IE": {"cheer": "Grand so!", "agree": "Dead right.", "idiom": "sound as a pound"},
        "en-IN": {"cheer": "Superb!", "agree": "That is absolutely correct.", "idiom": "first-rate"},
        "en-CA": {"cheer": "Great job, eh!", "agree": "For sure.", "idiom": "smooth sailing"},
        "en-ZA": {"cheer": "Lekker!", "agree": "Awesome vibe.", "idiom": "top-notch"}
    }.get(accent_id, {"cheer": "Great!", "agree": "I see.", "idiom": "keep going"})

    feedback = None

    # Common grammar checks / corrections
    if "i have " in text_lower and " years" in text_lower:
        feedback = "💡 Natural English Tip: Instead of 'I have X years', in English we say 'I am X years old'."
    elif "i am agree" in text_lower:
        feedback = "💡 Grammar Tip: We say 'I agree', not 'I am agree'."
    elif "make a question" in text_lower:
        feedback = "💡 Collocation Tip: We say 'ask a question', not 'make a question'."
    elif "depend of" in text_lower:
        feedback = "💡 Preposition Tip: It's 'depends on', rather than 'depends of'."

    # Dynamic contextual response based on scenarios
    if any(greet in text_lower for greet in ["hello", "hi", "hey", "hola", "good morning", "good afternoon", "howdy"]):
        reply = f"{flavor['cheer']} Hello! It's fantastic to chat with you today. {flavor['agree']} How are you feeling right now, and what would you like to talk about?"
    elif any(q in text_lower for q in ["how are you", "how are you doing", "what's up", "how do you do"]):
        reply = f"I'm doing wonderful, thank you for asking! I'm really excited to practice with you. How has your day been so far?"
    elif scenario == "coffee":
        reply = f"{flavor['cheer']} Welcome to the coffee shop! Would you like a hot latte, an iced Americano, or perhaps some pastry to go with it?"
    elif scenario == "interview":
        reply = f"Thank you for sharing that. {flavor['agree']} Could you describe a challenging project you worked on recently, and how you solved it?"
    elif scenario == "travel":
        reply = f"Safe travels! {flavor['cheer']} May I see your passport and boarding pass, and do you have any luggage to check in today?"
    elif scenario == "carplay":
        reply = f"{flavor['cheer']} Driving and practicing English is the best way to build automatic fluency! Where are you heading today, and what's on your mind?"
    elif len(user_text.split()) < 3:
        reply = f"{flavor['agree']} Could you tell me a little bit more about that? Try adding one or two more sentences!"
    else:
        replies = [
            f"{flavor['cheer']} That's a great point! {flavor['agree']} What made you think about that, and how does that affect your daily routine?",
            f"I really like how you expressed that. {flavor['agree']} If you had to explain that to a friend, what would be the most important detail?",
            f"{flavor['cheer']} You're communicating very clearly. Let's take it a step further: what do you think is the biggest advantage of that?"
        ]
        import random
        reply = random.choice(replies)

    return {
        "reply": reply,
        "tutor": accent_meta["tutor"],
        "accent": accent_meta["name"],
        "flag": accent_meta["flag"],
        "voice": accent_meta["voice"],
        "feedback": feedback
    }


class LearnaHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        url_parsed = urllib.parse.urlparse(self.path)
        
        # API: Get available English accents
        if url_parsed.path == "/api/accents":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(ACCENTS, ensure_ascii=False).encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        url_parsed = urllib.parse.urlparse(self.path)

        # Read JSON body
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            payload = {}

        # API: Chat with AI Tutor
        if url_parsed.path == "/api/chat":
            user_text = payload.get("message", "")
            accent_id = payload.get("accent", "en-US")
            scenario = payload.get("scenario", "casual")
            history = payload.get("history", [])

            response = generate_tutor_response(user_text, accent_id, scenario, history)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode("utf-8"))
            return

        # API: Neural Text-To-Speech with edge-tts
        if url_parsed.path == "/api/tts":
            text = payload.get("text", "")
            voice = payload.get("voice", "en-US-JennyNeural")

            if not text:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Text is required")
                return

            if not HAS_EDGE_TTS:
                # Fallback response
                self.send_response(501)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "edge_tts not installed on server, use Web Speech fallback"}).encode("utf-8"))
                return

            try:
                # Generate MP3 using edge-tts
                async def generate_audio():
                    communicate = edge_tts.Communicate(text, voice)
                    temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
                    temp_path = temp_file.name
                    temp_file.close()
                    await communicate.save(temp_path)
                    return temp_path

                temp_path = asyncio.run(generate_audio())
                with open(temp_path, "rb") as f:
                    audio_data = f.read()
                os.remove(temp_path)

                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(len(audio_data)))
                self.end_headers()
                self.wfile.write(audio_data)
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        super().do_POST()


def run_server(port=PORT):
    for p in range(port, port + 20):
        try:
            with socketserver.TCPServer(("", p), LearnaHTTPRequestHandler) as httpd:
                print(f"=====================================================")
                print(f"🚀 Learna AI Quiz & Conversational Tutor Server")
                print(f"📱 Web / Mobile URL: http://localhost:{p}")
                print(f"🚗 Apple CarPlay UI: http://localhost:{p}")
                print(f"🎙️ Multi-Accent AI:  7 Regional English Accents Ready")
                print(f"🔊 Edge-TTS Engine:  {'✅ Enabled' if HAS_EDGE_TTS else '⚠️ Web Speech Fallback'}")
                print(f"📁 Serving from:     {DIRECTORY}")
                print(f"=====================================================")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e):
                continue
            else:
                raise e

if __name__ == "__main__":
    run_server()
