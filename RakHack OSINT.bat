@echo off
echo Starting RakHack OSINT Toolkit...

:: Start Backend
echo Starting Backend Server...
cd backend
start "RakHack OSINT Backend" cmd /k "call venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..

:: Start Frontend
echo Starting Frontend Client...
cd frontend
start "RakHack OSINT Frontend" cmd /k "npm run dev"
cd ..

echo ===================================================
echo Services are starting in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ===================================================
