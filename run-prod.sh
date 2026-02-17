#!/bin/bash

# Client Happiness Dashboard - Production Run Script
echo "🚀 Starting Production Stack (Docker)..."

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

# 3. Start Docker stack
echo "🏗️ Starting containers (Database & App)..."
cd deployment
docker compose up -d --build

echo ""
echo "✅ Production stack is running!"
echo "✨ Note: The database is started automatically inside the 'app' container."
echo "🌐 Admin: https://admin-rag.abhee.org"
echo "🌐 App:   https://app-rag.abhee.org"
echo ""
echo "📊 Monitoring logs for the next 5s..."
sleep 5
docker compose ps
docker compose logs --tail=20 app
