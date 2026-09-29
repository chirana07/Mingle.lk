#!/bin/bash
set -e

echo "🚀 Setting up Project Katha (Mingle.lk)..."

# 1. Environment file
if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Python Virtual Environment
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing backend dependencies..."
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r backend/requirements.txt

# 3. Seed database
echo "🌱 Initializing database and seeding 100+ Sri Lankan profiles..."
PYTHONPATH=. ./venv/bin/python3 -m backend.seed.seed_data

# 4. Frontend dependencies
echo "⚛️ Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Katha setup is complete!"
echo ""
echo "To start development:"
echo "  Terminal 1 (Backend):  ./venv/bin/uvicorn backend.app.main:app --reload --port 8000"
echo "  Terminal 2 (Frontend): cd frontend && npm run dev"
echo ""
echo "Open http://localhost:3000 in your browser."
