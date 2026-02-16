#!/bin/bash
set -e

echo "🚀 Deploying Client Happiness Dashboard with Docker"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to deployment directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if .env exists
if [ ! -f "../.env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file in the project root based on .env.example"
    echo ""
    echo "At minimum, you need:"
    echo "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "  - CLOUDFLARE_TUNNEL_TOKEN (from Cloudflare dashboard)"
    exit 1
fi

# Source environment variables
set -a
source ../.env
set +a

# Check required variables
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${RED}❌ Error: NEXTAUTH_SECRET not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

# Build Docker images
echo "🏗️  Building Docker images..."
docker compose build --no-cache

echo ""
echo -e "${GREEN}✅ Docker images built successfully${NC}"
echo ""

# Start services
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check service status
docker compose ps

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 Service Information:"
echo "  - Application: http://localhost:${APP_PORT:-3000}"
if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
    echo "  - Cloudflare Tunnel: Active (check Cloudflare dashboard for domain)"
fi
echo ""
echo "📝 Useful commands:"
echo "  - View logs:    docker compose -f deployment/docker-compose.yml logs -f"
echo "  - Stop:         docker compose -f deployment/docker-compose.yml stop"
echo "  - Restart:      docker compose -f deployment/docker-compose.yml restart"
echo "  - Remove:       docker compose -f deployment/docker-compose.yml down"
echo ""
