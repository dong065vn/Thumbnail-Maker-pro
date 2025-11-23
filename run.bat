@echo off
REM AI Thumbnail Maker - Run Script for Windows

echo 🎨 Starting AI Thumbnail Maker...
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo 📝 Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ✅ .env file created!
    echo ⚠️  Please edit .env and add your GOOGLE_API_KEY
    echo.
    exit /b 1
)

REM Check if virtual environment exists
if not exist venv (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created!
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Run the application
echo.
echo ✅ Starting server...
echo 🌐 Open browser at: http://localhost:8000
echo.
python main.py
