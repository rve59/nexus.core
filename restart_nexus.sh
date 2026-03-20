#!/bin/bash

# --- CONFIGURATION ---
BASE_DIR="/home/raynier/Development/workspaces/fullstack/vibes/00_NEXUS/nexus_env"
PYTHON_BIN="/home/raynier/.pyenv/versions/3.11.11/bin/python3.11"
BACKEND_PORT=8078
FRONTEND_DIR="${BASE_DIR}/src/ui"

echo "------------------------------------------------"
echo "♻️  RESTARTING NEXUS ASDLC ENVIRONMENT"
echo "------------------------------------------------"

# 1. STOPPING SERVICES
echo "🛑 Stopping Backend (Uvicorn)..."
# We target the specific module to avoid killing other uvicorn instances
pkill -f "uvicorn src.api.main:app" || echo "Backend not running."

echo "🛑 Stopping Frontend (Vite)..."
pkill -f "vite" || echo "Frontend not running."

sleep 2

# 2. STARTING BACKEND
echo "🚀 Starting Backend on port ${BACKEND_PORT}..."
cd "${BASE_DIR}"
nohup "${PYTHON_BIN}" -m uvicorn src.api.main:app --host 127.0.0.1 --port "${BACKEND_PORT}" > backend.log 2>&1 &
echo "   (Logs: ${BASE_DIR}/backend.log)"

# 3. STARTING FRONTEND
echo "🚀 Starting Frontend (Vite)..."
cd "${FRONTEND_DIR}"
# Start vite via npm, ensuring it binds to 127.0.0.1
nohup npm run dev -- --host 127.0.0.1 > "${BASE_DIR}/frontend.log" 2>&1 &
echo "   (Logs: ${BASE_DIR}/frontend.log)"

echo "------------------------------------------------"
echo "✅ NEXUS SERVICES DISPATCHED"
echo "------------------------------------------------"
echo "Backend:  http://127.0.0.1:8078"
echo "Frontend: http://127.0.0.1:5178 (Check logs for actual port)"
echo "------------------------------------------------"
