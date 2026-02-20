# Deployment Technical Documentation

## Overview

The application is containerized using **Docker** and orchestrated with **Docker Compose**. There are two separate environments — **development** (hot-reload, full stack in Docker) and **production** (pre-built images pulled from GitHub Container Registry). Both environments run the same underlying services: a Next.js application server and a PostgreSQL database, with production additionally using a Cloudflare Tunnel for HTTPS ingress.

---

## Architecture

```
┌─────────────────────── HOST MACHINE ───────────────────────────┐
│                                                                  │
│  ┌─────────────────── app-network (bridge) ─────────────────┐   │
│  │                                                           │   │
│  │   ┌─────────────────┐     ┌──────────────────────┐       │   │
│  │   │   postgres:5432  │◄────│  app:3000            │       │   │
│  │   │  (data volume)  │     │  (Next.js + Prisma)  │       │   │
│  │   └─────────────────┘     └──────────┬───────────┘       │   │
│  │                                       │                   │   │
│  │                            ┌──────────▼───────────┐       │   │
│  │                            │  cloudflared tunnel  │       │   │
│  │                            │  (Cloudflare edge)   │       │   │
│  │                            └──────────────────────┘       │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  External: port 3000 only (dev) / Cloudflare edge only (prod)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Reference

| File | Purpose |
|---|---|
| `deployment/Dockerfile` | Production multi-stage build |
| `deployment/Dockerfile.dev` | Development hot-reload container |
| `deployment/docker-compose.yml` | Production stack (pulls from GHCR) |
| `docker-compose.dev.yml` | Development full stack (builds locally) |
| `deployment/docker-entrypoint.sh` | Prod startup: migrate → seed → server |
| `deployment/docker-entrypoint.dev.sh` | Dev startup: migrate → seed → `npm run dev` |
| `deployment/rollback.sh` | One-command production rollback |
| `deployment/.env` | Production env vars (never committed) |

---

## Development Environment

### What Runs in Docker

| Service | Container Name | Port |
|---|---|---|
| PostgreSQL 17 | `client-happiness-db-dev` | `5432` (host-exposed) |
| Next.js App | `client-happiness-app-dev` | `3000` |

### Hot Reload

Source code directories are **volume-mounted** from the host into the container:

```yaml
volumes:
  - ./frontend/src:/app/frontend/src           # ← hot reloads on save
  - ./frontend/public:/app/frontend/public     # ← static assets
  - ./database/prisma:/app/database/prisma     # ← schema changes
  - /app/node_modules                          # ← isolated from host
  - /app/frontend/node_modules                 # ← isolated from host
```

Next.js detects file changes via the volume mount and performs HMR — no container rebuild needed for code changes.

### Start Development

```bash
# First run (builds the image)
cp .env.dev .env         # Fill in your values
docker compose -f docker-compose.dev.yml up -d --build

# Subsequent runs (uses cached image layers)
docker compose -f docker-compose.dev.yml up -d

# Watch app logs
docker compose -f docker-compose.dev.yml logs -f app

# Open a shell in the app container
docker exec -it client-happiness-app-dev sh

# Stop everything
docker compose -f docker-compose.dev.yml down

# Stop and delete volumes (wipe DB)
docker compose -f docker-compose.dev.yml down -v
```

---

## Production Environment

### Services

| Service | Container Name | Image |
|---|---|---|
| PostgreSQL 17 | `client-happiness-db` | `postgres:17-alpine` |
| Next.js App | `client-happiness-app` | `ghcr.io/me-abhishekpal/client-happiness-dashboard:${IMAGE_TAG}` |
| Cloudflare Tunnel | `client-happiness-tunnel` | `cloudflare/cloudflared:latest` |

Production does **not** build images locally. It pulls pre-built, versioned images from GitHub Container Registry (GHCR). The CI/CD pipeline handles building and pushing.

### Production docker-compose.yml Key Points

```yaml
app:
  image: ghcr.io/me-abhishekpal/client-happiness-dashboard:${IMAGE_TAG:-latest}
  depends_on:
    postgres:
      condition: service_healthy     # Waits for Postgres to pass healthcheck
  healthcheck:
    test: wget --spider http://127.0.0.1:3000/api/health
    start_period: 60s                # Grace period for migrations to complete
```

### Start Production

```bash
# On the server, one-time bootstrap
git clone https://github.com/me-abhishekpal/client-happiness-dashboard.git ~/client-happiness
cd ~/client-happiness
cp .env.production .env
nano .env     # Fill in all real values

# Pull and start (CI does this automatically on deploy)
export IMAGE_TAG=latest
docker compose -f deployment/docker-compose.yml up -d
```

---

## Production Dockerfile (Multi-Stage Build)

The `deployment/Dockerfile` uses a **4-stage build** to minimize the final image size:

```
Stage 1: base          node:22-alpine base
Stage 2: deps          Install root + frontend npm packages
Stage 3: builder       Copy all source, generate Prisma client, build Next.js
Stage 4: runner        Copy only the standalone Next.js output + runtime files
```

The final `runner` image contains:
- Next.js standalone bundle (no source code)
- Prisma client binary
- Uploads directory
- Startup entrypoint

Image size is minimized by using `next build --standalone`, which tree-shakes all unused node_modules from the output bundle.

### VERSION_TAG Build Arg

Every image is labeled with the Git SHA for traceability:

```dockerfile
ARG VERSION_TAG=local
LABEL org.opencontainers.image.revision="${VERSION_TAG}"
ENV VERSION_TAG=${VERSION_TAG}
```

CI passes `--build-arg VERSION_TAG=${{ github.sha }}` at build time.

---

## Container Startup Sequence

### Production (`docker-entrypoint.sh`)

```
Container starts
   │
   ├─ Poll PostgreSQL until healthy (max 60s)
   ├─ cd /app/database
   ├─ npx prisma migrate deploy     ← apply pending migration SQLs
   ├─ npx prisma db seed            ← upsert default data (idempotent)
   ├─ cd /app
   └─ exec node frontend/server.js  ← start Next.js standalone server
```

### Development (`docker-entrypoint.dev.sh`)

```
Container starts
   │
   ├─ Poll PostgreSQL until healthy
   ├─ npx prisma migrate deploy
   ├─ npx prisma db seed
   ├─ cd /app/frontend
   └─ exec npm run dev             ← start Next.js with hot reload
```

---

## Volumes

| Volume | Service | Mount | Purpose |
|---|---|---|---|
| `postgres_data` | postgres | `/var/lib/postgresql/data` | Persistent DB data |
| `uploads_data` | app | `/app/database/uploads` | Persistent user-uploaded files |
| `postgres_dev_data` | postgres (dev) | `/var/lib/postgresql/data` | Separate dev DB volume |

> [!CAUTION]
> Running `docker compose down -v` deletes volumes and all database data. Only do this on dev machines to fully reset.

---

## Healthchecks

**PostgreSQL:**
```yaml
test: pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}
interval: 5s | timeout: 5s | retries: 10
```

**App:**
```yaml
test: wget --spider http://127.0.0.1:3000/api/health
interval: 30s | timeout: 10s | retries: 3 | start_period: 60s
```

The `app` service declares `depends_on: postgres: condition: service_healthy`, so it only starts after Postgres passes its healthcheck.

---

## Rollback

```bash
# On the production server
./deployment/rollback.sh sha-abc1234def

# The script:
# 1. Sets IMAGE_TAG=sha-abc1234def
# 2. docker compose pull app
# 3. docker compose up -d --no-deps app
# 4. Polls /api/health to confirm success
```

Find all available SHA tags at: `https://github.com/me-abhishekpal/client-happiness-dashboard/pkgs/container/client-happiness-dashboard`

---

## Networking

All services communicate over an internal Docker bridge network (`app-network`). The database port (`5432`) is **not exposed** to the host in production. The app is accessed externally **only via the Cloudflare Tunnel** (no inbound port forwarding required).

In development, `5432` is exposed on localhost so you can connect with TablePlus, psql, or Prisma Studio.

---

## Cloudflare Tunnel

The `cloudflared` service runs a persistent outbound connection to Cloudflare's edge network. Traffic to `app-rag.abhee.org` is routed to `http://app:3000` inside the Docker network — no open inbound ports on the server.

```bash
# Generate a new token (one-time, in Cloudflare Dashboard)
# https://one.dash.cloudflare.com/ → Zero Trust → Networks → Tunnels

# Add to .env
CLOUDFLARE_TUNNEL_TOKEN=eyJ...
```

---

## Required Environment Variables

| Variable | Required For | Description |
|---|---|---|
| `POSTGRES_DB` | Both | Database name |
| `POSTGRES_USER` | Both | Database user |
| `POSTGRES_PASSWORD` | Both | Database password |
| `DATABASE_URL` | Both | Full Postgres connection string |
| `NEXTAUTH_URL` | Both | Public URL for auth callbacks |
| `NEXTAUTH_SECRET` | Both | Session encryption key |
| `APP_PORT` | Both | Host port for the app (default: 3000) |
| `SMTP_HOST/PORT/USER/PASS` | Both | Email sending |
| `CLOUDFLARE_TUNNEL_TOKEN` | Prod | Cloudflare Tunnel authentication |
| `IMAGE_TAG` | Prod | GHCR image tag to run (default: latest) |
