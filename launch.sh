#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

VENV_PYTHON="/home/nestor/Documentos/Instaladores/NGLOOM/elevenlabs-studio/venv/bin/python3"

echo "====================================================="
echo "🚗 Iniciando Learna AI Quiz & Diálogo Avanzado CarPlay..."
echo "====================================================="

if [ -f "$VENV_PYTHON" ]; then
    echo "🎙️ Usando entorno virtual con Edge-TTS para voces neuronales..."
    "$VENV_PYTHON" server.py
else
    echo "🌐 Usando python3 del sistema..."
    python3 server.py
fi
