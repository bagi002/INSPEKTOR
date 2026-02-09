#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "Starting INSPEKTOR app..."

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed."
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "ERROR: frontend/package.json not found."
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "ERROR: Frontend dependencies are not installed."
  echo "Run ./setup.sh first."
  exit 1
fi

echo "Launching frontend development server..."
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port 5173
