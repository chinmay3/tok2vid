#!/bin/bash
set -e

echo "=== YouTube RAG ==="
echo ""

if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and add your OpenAI API key."
    echo "  cp .env.example .env"
    exit 1
fi

echo "Starting backend on :8000..."
cd backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo "Starting frontend on :3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
