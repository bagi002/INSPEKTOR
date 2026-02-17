#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
ADMIN_FRONTEND_DIR="$ROOT_DIR/admin-frontend"

echo "Starting INSPEKTOR app..."

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed."
  exit 1
fi

if [ ! -f "$BACKEND_DIR/package.json" ]; then
  echo "ERROR: backend/package.json not found."
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "ERROR: frontend/package.json not found."
  exit 1
fi

if [ ! -f "$ADMIN_FRONTEND_DIR/package.json" ]; then
  echo "ERROR: admin-frontend/package.json not found."
  exit 1
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "ERROR: Backend dependencies are not installed."
  echo "Run ./setup.sh first."
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "ERROR: Frontend dependencies are not installed."
  echo "Run ./setup.sh first."
  exit 1
fi

if [ ! -d "$ADMIN_FRONTEND_DIR/node_modules" ]; then
  echo "ERROR: Admin frontend dependencies are not installed."
  echo "Run ./setup.sh first."
  exit 1
fi

echo "Launching backend development server..."
(
  cd "$BACKEND_DIR"
  HOST=0.0.0.0 PORT=3001 npm run dev
) &
BACKEND_PID=$!

echo "Launching admin frontend development server..."
(
  cd "$ADMIN_FRONTEND_DIR"
  npm run dev -- --host 0.0.0.0 --port 5174
) &
ADMIN_FRONTEND_PID=$!

cleanup() {
  if kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  if kill -0 "$ADMIN_FRONTEND_PID" >/dev/null 2>&1; then
    kill "$ADMIN_FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

sleep 1
if ! kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
  echo "ERROR: Backend failed to start."
  exit 1
fi

if ! kill -0 "$ADMIN_FRONTEND_PID" >/dev/null 2>&1; then
  echo "ERROR: Admin frontend failed to start."
  exit 1
fi

echo "Launching frontend development server..."
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port 5173
