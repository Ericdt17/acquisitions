#!/usr/bin/env bash
# Prep for Docker production deploy on a host (API container + external Postgres).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Docker setup — production"
echo "========================="

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker not found."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running."
  exit 1
fi

chmod +x script/dev.sh script/prod.sh script/setup-docker.sh script/setup-docker-prod.sh 2>/dev/null || true

if [ ! -f .env.production.example ]; then
  echo "Error: .env.production.example missing."
  exit 1
fi

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  echo "Created .env.production from template."
  echo ""
  echo "IMPORTANT: Edit .env.production — set real DATABASE_URL, JWT_SECRET, and PORT before deploy."
  exit 1
fi

echo ".env.production present."
echo ""
echo "Before first deploy, run DB migrations (prod image has no drizzle-kit), e.g.:"
echo "  set -a && source .env.production && set +a && npm run db:migrate"
echo "  # or the same DATABASE_URL in CI"
echo ""
echo "Then: npm run prod:docker"
