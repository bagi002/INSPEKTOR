#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTO_DIR="$ROOT_DIR/Automation"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_ENV_FILE="$BACKEND_DIR/.env"
BACKEND_ENV_TEMPLATE="$BACKEND_DIR/.env.example"

echo "Setting up INSPEKTOR environment..."

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed."
  exit 1
fi

if command -v python3 >/dev/null 2>&1 && [ -x "$AUTO_DIR/bootstrap_envs.sh" ]; then
  echo "[1/5] Preparing Python environments (venv + docs_venv)..."
  "$AUTO_DIR/bootstrap_envs.sh"
else
  echo "[1/5] Skipping Python environment setup (python3 or bootstrap script not available)."
fi

if [ -f "$BACKEND_DIR/package.json" ]; then
  echo "[2/5] Installing backend dependencies..."
  (cd "$BACKEND_DIR" && npm install)

  if [ ! -f "$BACKEND_ENV_FILE" ] && [ -f "$BACKEND_ENV_TEMPLATE" ]; then
    echo "[3/5] Creating backend .env from template..."
    cp "$BACKEND_ENV_TEMPLATE" "$BACKEND_ENV_FILE"
  else
    echo "[3/5] Backend .env already exists or template is missing. Skipping .env creation."
  fi

  echo "[4/5] Initializing backend database..."
  (cd "$BACKEND_DIR" && npm run db:init)
else
  echo "WARNING: backend/package.json not found. Skipping backend npm install."
  echo "WARNING: Skipping backend .env creation and database init."
fi

if [ -f "$FRONTEND_DIR/package.json" ]; then
  echo "[5/5] Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
else
  echo "WARNING: frontend/package.json not found. Skipping frontend npm install."
fi

echo "Setup complete."
