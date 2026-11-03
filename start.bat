@echo off
title EDX AI Resume Analyzer
echo ===================================================
echo        Starting EDX AI Resume Analyzer v2.1
echo ===================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found. Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)

:: 2. Auto-install dependencies if missing
if not exist "server\node_modules" (
    echo [1/3] Installing server dependencies...
    call npm --prefix server install
)

if not exist "client\node_modules" (
    echo [2/3] Installing client dependencies...
    call npm --prefix client install
)

:: 3. Launch backend and frontend
echo [3/3] Starting backend (port 8000) and frontend (port 5173)...
echo.
echo Application will be available at: http://localhost:5173
echo.

start "Backend Server" cmd /k "cd server && npm run dev"
start "Frontend Client" cmd /k "cd client && npm run dev"

:: Wait 3 seconds for Vite dev server to bind then open browser
timeout /t 3 >nul
start http://localhost:5173

echo.
echo Both servers are running in separate windows. Close them to stop the app.
