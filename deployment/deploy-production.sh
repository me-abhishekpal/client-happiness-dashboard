#!/bin/bash
# Quick deployment script for rag.abhee.org

echo "🚀 Deploying to rag.abhee.org"
echo ""

# Navigate to deployment directory
cd "$(dirname "$0")"

# Run the deployment
./deploy.sh

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application is available at:"
echo "   - Local: http://localhost:3000"
echo "   - Production: https://rag.abhee.org"
echo ""
