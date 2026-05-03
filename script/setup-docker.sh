#!/usr/bin/env bash
# One-time / occasional prep for Docker-based local development.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Docker setup — acquisitions API"
echo "================================"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker not found. Install Docker Desktop or Docker Engine."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running. Start it and try again."
  exit 1
fi

chmod +x script/dev.sh script/prod.sh script/setup-docker.sh script/setup-docker-prod.sh 2>/dev/null || true

if [ ! -f .env.development.example ]; then
  echo "Error: .env.development.example missing."
  exit 1
fi

if [ ! -f .env.development ]; then
  cp .env.development.example .env.development
  echo "Created .env.development from .env.development.example — edit JWT_SECRET if needed."
else
  echo ".env.development already exists — left unchanged."
fi

echo ""
echo "Next: npm run dev:docker"
