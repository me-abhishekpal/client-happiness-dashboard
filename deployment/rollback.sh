#!/bin/bash
# rollback.sh — Roll back production to a previous image
#
# Usage:
#   ./deployment/rollback.sh sha-abc1234def5  # Roll back to a specific SHA
#   ./deployment/rollback.sh latest           # Roll forward to latest
#
# Find available tags at:
#   https://github.com/me-abhishekpal/client-happiness-dashboard/pkgs/container/client-happiness-dashboard

set -e

IMAGE_TAG="${1:-}"

if [ -z "$IMAGE_TAG" ]; then
  echo "❌ Usage: ./deployment/rollback.sh <sha-tag>"
  echo "   Example: ./deployment/rollback.sh sha-abc1234def"
  echo ""
  echo "   Find tags at: https://github.com/me-abhishekpal/client-happiness-dashboard/pkgs/container/client-happiness-dashboard"
  exit 1
fi

echo "🔁 Rolling back production to image: ghcr.io/me-abhishekpal/client-happiness-dashboard:${IMAGE_TAG}"

cd "$(dirname "$0")/.."

# Pull the target image
export IMAGE_TAG="${IMAGE_TAG}"
docker compose -f deployment/docker-compose.yml pull app

# Restart only the app container
docker compose -f deployment/docker-compose.yml up -d --no-deps app

echo "✅ Rollback complete! Running containers:"
docker ps --filter "name=client-happiness" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

echo ""
echo "⏳ Checking health..."
sleep 15
curl -f http://localhost:3000/api/health && echo "✅ Health OK!" || echo "⚠️  Health check failed — check logs: docker logs client-happiness-app"
