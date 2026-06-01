@echo off
echo ============================================
echo  StudyBuddy AI — Backend Startup
echo ============================================
echo.

IF NOT EXIST ".env" (
    echo [SETUP] Creating .env from template...
    copy .env.example .env
    echo [ACTION] Please edit backend\.env and add your GEMINI_API_KEY
    echo          Get a free key at: https://aistudio.google.com/
    echo.
    pause
)

echo [INFO] Installing Python dependencies...
pip install -r requirements.txt --quiet

echo.
echo [START] Launching FastAPI backend on http://localhost:8000
echo         Press Ctrl+C to stop
echo.
python -m uvicorn main:app --reload --port 8000
