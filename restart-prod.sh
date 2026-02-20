#!/bin/bash

# Client Happiness Dashboard - Production Restart Script
# Always run from the project root, regardless of where this script is called from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "♻️ Restarting Production Stack (Docker)..."

# 1. Sync environment variables
echo "🔄 Syncing environment variables..."
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in project root!"
    exit 1
fi
cp .env deployment/.env

# 2. Check for Cloudflare Token
TOKEN=$(grep CLOUDFLARE_TUNNEL_TOKEN .env | cut -d '=' -f2)
if [ -z "$TOKEN" ] || [[ "$TOKEN" == *"your-cloudflare-tunnel-token-here"* ]]; then
    echo "⚠️  Warning: CLOUDFLARE_TUNNEL_TOKEN is not set or is using the placeholder."
    echo "   The app will start, but it won't be accessible via the Cloudflare Tunnel."
fi

# 3. Restart Docker stack
echo "🛑 Stopping containers..."
cd deployment
docker compose down

echo "🏗️ Starting containers (Database & App)..."
docker compose up -d --build

echo ""
echo "✅ Production stack has been restarted!"
echo "📊 Monitoring logs for the next 5s..."
sleep 5
docker compose ps
docker compose logs --tail=20 app
