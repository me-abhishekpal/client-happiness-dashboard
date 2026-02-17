#!/bin/bash

# Client Happiness Dashboard - Run Script
# Works on Mac, Linux, and Windows (Git Bash/WSL)

echo "🚀 Starting Client Happiness Dashboard..."

# 1. Install dependencies if node_modules don't exist
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    cd frontend && npm install && cd ..
fi

# 2. Generate Prisma Client
echo "🏗️ Generating Prisma Client..."
npm run prisma:generate

# 3. Sync Database (SQLite)
echo "🗄️ Syncing database..."
# Use DATABASE_URL from .env if available, otherwise fallback
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi
npm run prisma:push

# 4. Start Development Server
echo "✨ Starting development server..."
echo "💡 To test subdomains locally, add them to your /etc/hosts file:"
echo "   127.0.0.1 app-rag.abhee.org admin-rag.abhee.org oculusit-rag.abhee.org"
echo ""
npm run dev
