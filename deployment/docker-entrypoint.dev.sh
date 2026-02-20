#!/bin/sh
# Dev entrypoint: run migrations then start Next.js in hot-reload mode
set -e

echo "🚀 Starting Client Happiness Dashboard (DEV)..."

cd /app/database

echo "⏳ Waiting for PostgreSQL to be ready..."
RETRIES=30
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "   Postgres not ready yet, retrying... ($RETRIES attempts left)"
    RETRIES=$((RETRIES - 1))
    sleep 2
done

if [ $RETRIES -eq 0 ]; then
    echo "❌ Could not connect to PostgreSQL. Exiting."
    exit 1
fi

echo "✅ PostgreSQL is ready."

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed

cd /app/frontend
echo "🔥 Starting Next.js dev server (hot reload)..."
exec npm run dev
