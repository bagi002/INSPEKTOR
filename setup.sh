#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTO_DIR="$ROOT_DIR/Automation"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "Setting up INSPEKTOR environment..."

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed."
  exit 1
fi

if [ -x "$AUTO_DIR/bootstrap_envs.sh" ]; then
  echo "[1/2] Preparing Python environments (venv + docs_venv)..."
  "$AUTO_DIR/bootstrap_envs.sh"
else
  echo "WARNING: $AUTO_DIR/bootstrap_envs.sh not found or not executable. Skipping Python environment setup."
fi

if [ -f "$FRONTEND_DIR/package.json" ]; then
  echo "[2/2] Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
else
  echo "WARNING: frontend/package.json not found. Skipping frontend npm install."
fi

echo "Setup complete."
