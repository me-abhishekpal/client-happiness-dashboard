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
export DATABASE_URL="file:/Users/abheedevta/.openclaw/workspace/client_happiness/database/prisma/dev.db"
npm run prisma:push

# 4. Start Development Server
echo "✨ Starting development server..."
npm run dev
