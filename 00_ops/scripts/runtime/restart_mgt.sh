#!/bin/bash

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

FRONTEND_PORT="${FRONTEND_PORT:-5191}"
BACKEND_PORT="${BACKEND_PORT:-8091}"
NEXUS_ENV_DIR="${NEXUS_ENV_DIR:-${PROJECT_ROOT}}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

LOG_DIR="${NEXUS_ENV_DIR}/.nexus/runtime/logs"
BACKEND_LOG="${LOG_DIR}/backend/flask-mgt.log"
FRONTEND_LOG="${LOG_DIR}/frontend/vite-mgt.log"

mkdir -p "$(dirname "${BACKEND_LOG}")" "$(dirname "${FRONTEND_LOG}")"

echo "🚀 Restarting Nexus MGT Prototyper..."

# Function to kill process by port
kill_port() {
  local port=$1
  echo "Checking port $port..."
  # Use fuser to kill if available, else lsof
  if command -v fuser > /dev/null; then
    fuser -k $port/tcp > /dev/null 2>&1
  else
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
      kill -9 $pid
    fi
  fi
}

# Kill existing services
kill_port $FRONTEND_PORT
kill_port $BACKEND_PORT

# Optional: Kill by process name if ports are weird
pkill -f "python src/api/web_agent_api.py"
pkill -f "vite"

# Start Backend
echo "Starting Flask Backend on port $BACKEND_PORT..."
cd $NEXUS_ENV_DIR
# Use nohup or run in background to allow script to exit if needed, 
# but here we'll assume the user might want to see logs or we start in background
nohup "${PYTHON_BIN}" src/api/web_agent_api.py > "${BACKEND_LOG}" 2>&1 &
echo "Backend started (PID: $!). Logs in ${BACKEND_LOG}"

# Start Frontend
echo "Starting Vite Frontend on port $FRONTEND_PORT..."
cd $NEXUS_ENV_DIR/nexus_web
nohup npm run dev > "${FRONTEND_LOG}" 2>&1 &
echo "Frontend started (PID: $!). Logs in ${FRONTEND_LOG}"

echo "✅ Nexus MGT Prototyper is running!"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend:  http://localhost:$BACKEND_PORT (API)"
echo "   Use 'tail -f ${BACKEND_LOG}' or 'tail -f ${FRONTEND_LOG}' to view logs."
