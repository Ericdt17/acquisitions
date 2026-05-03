#!/usr/bin/env bash
# Start Postgres + API for local development (see docker-compose.dev.yml).
# No Neon: uses the Docker service "postgres".

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f docker-compose.dev.yml)
POSTGRES_USER="${POSTGRES_USER:-acquisitions}"
POSTGRES_DB="${POSTGRES_DB:-acquisitions}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
APP_PORT="${APP_PORT:-3001}"

echo "Acquisitions API — development (Docker)"
echo "=========================================="

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is not running. Start Docker and try again."
  exit 1
fi

if [ ! -f .env.development.example ]; then
  echo "Error: .env.development.example is missing from the repo root."
  exit 1
fi

if [ ! -f .env.development ]; then
  echo "Note: .env.development not found — Compose will use .env.development.example only."
  echo "      Copy to .env.development if you need custom JWT_SECRET or other overrides."
  echo ""
fi

echo "Starting Postgres..."
"${COMPOSE[@]}" up -d postgres

echo "Waiting for Postgres (user=${POSTGRES_USER}, db=${POSTGRES_DB})..."
ready=0
for _ in $(seq 1 60); do
  if "${COMPOSE[@]}" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" &>/dev/null; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo "Error: Postgres did not become ready in time."
  exit 1
fi

echo "Starting API + Postgres (hot reload on ./src; migrations run when the app starts)..."
echo "  API:    http://localhost:${APP_PORT}"
echo "  DB:     localhost:${POSTGRES_PORT} (user ${POSTGRES_USER}, DB ${POSTGRES_DB})"
echo "  Stop:   Ctrl+C, then: docker compose -f docker-compose.dev.yml down"
echo ""
"${COMPOSE[@]}" up --build
