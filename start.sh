#!/usr/bin/env bash
set -e

echo "==================================================="
echo "       Starting EDX AI Resume Analyzer v2.1"
echo "==================================================="
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not found. Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

# 2. Install dependencies if missing
if [ ! -d "server/node_modules" ]; then
    echo "[1/3] Installing server dependencies..."
    npm --prefix server install
fi

if [ ! -d "client/node_modules" ]; then
    echo "[2/3] Installing client dependencies..."
    npm --prefix client install
fi

# 3. Start servers
echo "[3/3] Starting backend (port 8000) and frontend (port 5173)..."
echo "Application URL: http://localhost:5173"
echo ""

npm --prefix server run dev &
SERVER_PID=$!

npm --prefix client run dev &
CLIENT_PID=$!

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null" EXIT

# Open browser if available
if command -v xdg-open &> /dev/null; then
    sleep 2 && xdg-open http://localhost:5173 &
elif command -v open &> /dev/null; then
    sleep 2 && open http://localhost:5173 &
fi

wait
