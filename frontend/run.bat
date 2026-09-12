@echo off
title MahaSetu - Frontend Portal (React + Vite)
cd /d "%~dp0"
echo ========================================================
echo   Starting MahaSetu Frontend on http://localhost:5173
echo ========================================================
if not exist "node_modules" (
    echo [INFO] Installing frontend packages...
    npm install
)
echo [INFO] Launching Vite development server...
npm run dev
pause
