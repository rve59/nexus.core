#!/bin/bash

# --- CONFIGURATION ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

BASE_DIR="${BASE_DIR:-${PROJECT_ROOT}}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
BACKEND_PORT="${BACKEND_PORT:-8078}"
FRONTEND_DIR="${FRONTEND_DIR:-${BASE_DIR}/src/ui}"

LOG_DIR="${BASE_DIR}/.nexus/runtime/logs"
BACKEND_LOG="${LOG_DIR}/backend/uvicorn.log"
FRONTEND_LOG="${LOG_DIR}/frontend/vite.log"

mkdir -p "$(dirname "${BACKEND_LOG}")" "$(dirname "${FRONTEND_LOG}")"

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
nohup "${PYTHON_BIN}" -m uvicorn src.api.main:app --host 127.0.0.1 --port "${BACKEND_PORT}" > "${BACKEND_LOG}" 2>&1 &
echo "   (Logs: ${BACKEND_LOG})"

# 3. STARTING FRONTEND
echo "🚀 Starting Frontend (Vite)..."
cd "${FRONTEND_DIR}"
# Start vite via npm, ensuring it binds to 127.0.0.1
nohup npm run dev -- --host 127.0.0.1 > "${FRONTEND_LOG}" 2>&1 &
echo "   (Logs: ${FRONTEND_LOG})"

echo "------------------------------------------------"
echo "✅ NEXUS SERVICES DISPATCHED"
echo "------------------------------------------------"
echo "Backend:  http://127.0.0.1:8078"
echo "Frontend: http://127.0.0.1:5178 (Check logs for actual port)"
echo "------------------------------------------------"
