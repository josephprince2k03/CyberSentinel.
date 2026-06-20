@echo off
echo Starting CyberSentinel OSINT Toolkit...

:: Start Backend
echo Starting Backend Server...
cd backend
start "CyberSentinel Backend" cmd /k "call venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..

:: Start Frontend
echo Starting Frontend Client...
cd frontend
start "CyberSentinel Frontend" cmd /k "npm run dev"
cd ..

echo ===================================================
echo Services are starting in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ===================================================
echo CyberSentinel is now launching...
pause
