# Multi-stage build for Client Happiness Dashboard
# Uses SQLite database with volume mounts for persistence

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files from root and frontend
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Copy database schema BEFORE npm install (needed for Prisma generate in postinstall)
COPY database ./database

# Install all dependencies with legacy peer deps to handle ESLint conflicts
RUN npm install --legacy-peer-deps
RUN cd frontend && npm install --legacy-peer-deps

# Stage 3: Builder
FROM deps AS builder
WORKDIR /app

# Copy the entire project
COPY . .

# Generate Prisma Client with final schema from host
WORKDIR /app/database
RUN npx prisma generate

# Build Next.js frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Stage 4: Runner
FROM node:20-alpine AS runner
ENV DATABASE_URL="file:/app/database/dev.db"
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies only
RUN apk add --no-cache sqlite openssl

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary directories with proper permissions
RUN mkdir -p /app/database/prisma /app/database/uploads
RUN chown -R nextjs:nodejs /app/database

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Copy root node_modules and package.json for migrations and seeding
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy database schema and Prisma client
COPY --from=builder --chown=nextjs:nodejs /app/database/prisma ./database/prisma
COPY --from=builder --chown=nextjs:nodejs /app/frontend/node_modules/.prisma ./frontend/node_modules/.prisma

# Copy startup script
COPY --chown=nextjs:nodejs deployment/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start server
CMD ["./docker-entrypoint.sh"]
