# Multi-stage build for Client Happiness Dashboard
# Uses PostgreSQL — no SQLite or native addons required

# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
# libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files from root and frontend
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Copy database schema BEFORE npm install (needed for Prisma generate in postinstall)
COPY database ./database

# Install all dependencies
RUN npm install
RUN cd frontend && npm install

# Stage 3: Builder
FROM deps AS builder
WORKDIR /app

# Copy the entire project
COPY . .

# Generate Prisma Client (Prisma v7 — uses prisma.config.ts)
WORKDIR /app/database
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate --config prisma.config.ts

# Build Next.js frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Stage 4: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime dependencies: openssl for Prisma, no sqlite needed
RUN apk add --no-cache openssl

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create uploads directory
RUN mkdir -p /app/database/uploads
RUN chown -R nextjs:nodejs /app/database

# Copy built Next.js app
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Copy root node_modules and package.json (for prisma CLI at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy database schema, prisma config, and generated client
COPY --from=builder --chown=nextjs:nodejs /app/database/prisma ./database/prisma
COPY --from=builder --chown=nextjs:nodejs /app/database/prisma.config.ts ./database/prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/frontend/node_modules/.prisma ./frontend/node_modules/.prisma

# Copy startup script
COPY --chown=nextjs:nodejs deployment/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
