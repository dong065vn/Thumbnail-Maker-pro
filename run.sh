#!/bin/bash

# AI Thumbnail Maker - Run Script

echo "🎨 Starting AI Thumbnail Maker..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "✅ .env file created!"
    echo "⚠️  Please edit .env and add your GOOGLE_API_KEY"
    echo ""
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created!"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Run the application
echo ""
echo "✅ Starting server..."
echo "🌐 Open browser at: http://localhost:8000"
echo ""
python main.py
