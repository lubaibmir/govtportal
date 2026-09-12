@echo off
title MahaSetu - Backend Gateway (FastAPI)
cd /d "%~dp0"
echo ========================================================
echo   Starting MahaSetu Backend Gateway on http://localhost:8000
echo ========================================================
if not exist "venv\Scripts\activate.bat" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [INFO] Installing backend dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)
echo [INFO] Starting FastAPI server...
uvicorn app.main:app --reload --port 8000
pause
