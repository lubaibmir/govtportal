@echo off
title MahaSetu - Full Platform Launcher
echo ========================================================
echo   Launching MahaSetu (FastAPI Backend + React Frontend)
echo ========================================================
start "MahaSetu Backend" cmd /k "cd /d %~dp0backend && run.bat"
start "MahaSetu Frontend" cmd /k "cd /d %~dp0frontend && run.bat"
echo.
echo MahaSetu is starting!
echo - Backend:  http://localhost:8000 (Docs: http://localhost:8000/api/v1/docs)
echo - Frontend: http://localhost:5173
echo.
