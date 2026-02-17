#!/bin/sh
set -e

echo "🚀 Starting Client Happiness Dashboard..."

# Run database migrations from root
echo "📦 Running database migrations..."
npx prisma migrate deploy --schema=database/prisma/schema.prisma

# Push schema changes (for development/MVP SQLite setups)
echo "🔄 Syncing database schema..."
npx prisma db push --schema=database/prisma/schema.prisma --accept-data-loss

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed --schema=database/prisma/schema.prisma

# Start the Next.js server
echo "✅ Starting server on port ${PORT}..."
# Use node to run the standalone server
exec node frontend/server.js
