#!/usr/bin/env bash
# Build and run the production API container (docker-compose.prod.yml).
# Postgres must be reachable via DATABASE_URL in .env.production.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f docker-compose.prod.yml)
APP_PORT="${APP_PORT:-3001}"

echo "Acquisitions API — production (Docker)"
echo "======================================"

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is not running."
  exit 1
fi

if [ ! -f .env.production ]; then
  echo "Error: .env.production not found. Run: npm run setup:docker:prod"
  exit 1
fi

echo "Building and starting app (detached)..."
"${COMPOSE[@]}" up --build -d

echo ""
echo "Status:"
"${COMPOSE[@]}" ps
echo ""
echo "API: http://localhost:${APP_PORT} (or your host / reverse proxy)"
echo "Logs: docker compose -f docker-compose.prod.yml logs -f app"
echo "Stop:  docker compose -f docker-compose.prod.yml down"
