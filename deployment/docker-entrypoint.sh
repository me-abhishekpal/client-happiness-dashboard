#!/bin/sh
set -e

echo "Starting Client Happiness Dashboard..."

# All prisma commands run from /app/database where prisma.config.ts lives
cd /app/database

# Wait for PostgreSQL to be ready (up to 60 seconds)
echo "Waiting for PostgreSQL to be ready..."
RETRIES=30
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "   Postgres not ready yet, retrying... ($RETRIES attempts left)"
    RETRIES=$((RETRIES - 1))
    sleep 2
done

if [ $RETRIES -eq 0 ]; then
    echo "Could not connect to PostgreSQL. Exiting."
    exit 1
fi

echo "PostgreSQL is ready."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed the database (upserts are idempotent — safe to run on each start)
echo "Seeding database..."
npx prisma db seed

# Return to app root and start the Next.js server
cd /app
echo "Starting server on port ${PORT:-3000}..."
exec node frontend/server.js
