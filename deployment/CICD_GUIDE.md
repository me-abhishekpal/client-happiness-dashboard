# CI/CD Guide — Enterprise Docker Pipeline

## Overview

```
dev branch  ──push──► CI builds image ──► push ghcr.io/.../app:dev ──► deploy dev server
main branch ──push──► CI builds image ──► push ghcr.io/.../app:latest + :sha-XXX ──► deploy prod
```

Images are hosted at: `ghcr.io/me-abhishekpal/client-happiness-dashboard`

---

## Step 1: Set Up GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret | Value |
|---|---|
| `PROD_SSH_HOST` | IP or hostname of your production server |
| `PROD_SSH_USER` | SSH username (e.g. `ubuntu`) |
| `PROD_SSH_KEY` | Contents of your private SSH key (`~/.ssh/id_rsa`) |
| `DEV_SSH_HOST` | IP of dev server (can be same as prod if single server) |
| `DEV_SSH_USER` | SSH username for dev server |
| `DEV_SSH_KEY` | Private SSH key for dev server |

> Note: `GITHUB_TOKEN` is automatically provided by GitHub — no secret needed for GHCR auth.

---

## Step 2: Set Up GitHub Environments

Go to repo → **Settings → Environments** and create:
- `development` — linked to `ci-dev.yml`
- `production` — linked to `ci-prod.yml` (add required reviewers for extra safety)

---

## Step 3: Bootstrap Server

On EACH server (dev and prod), run once:

```bash
# 1. Clone the repo (only deployment configs are needed, not source code for prod)
git clone https://github.com/me-abhishekpal/client-happiness-dashboard.git ~/client-happiness
cd ~/client-happiness

# 2. Create .env with real values
cp .env.production .env
nano .env   # Fill in all required values

# 3. Make sure GHCR is public or the server can pull (see GHCR visibility settings)

# 4. First-time start (pulls image from GHCR)
export IMAGE_TAG=latest
docker compose -f deployment/docker-compose.yml up -d
```

---

## Day-to-Day Workflows

### Feature Development
```bash
git checkout dev
# ... make changes ...
git push origin dev        # ← triggers ci-dev.yml automatically
```

### Release to Production
```bash
git checkout main
git merge dev
git push origin main       # ← triggers ci-prod.yml automatically
```

### Manual Emergency Deploy
Go to GitHub → Actions → **CI — Production Deployment** → **Run workflow** button.

---

## Rollback

```bash
# On the prod server — roll back to a specific SHA
./deployment/rollback.sh sha-abc1234def

# Find available tags at:
# https://github.com/me-abhishekpal/client-happiness-dashboard/pkgs/container/client-happiness-dashboard
```

---

## Local Dev (Full Docker Stack)

```bash
# Copy and fill dev env
cp .env.dev .env

# Build and start (first time or after Dockerfile changes)
docker compose -f docker-compose.dev.yml up -d --build

# Start without rebuild
docker compose -f docker-compose.dev.yml up -d

# Watch logs
docker compose -f docker-compose.dev.yml logs -f app

# Stop
docker compose -f docker-compose.dev.yml down
```

Hot reload is active — changes to `frontend/src/` show instantly in the browser.

---

## Image Tags Reference

| Tag | Used for |
|---|---|
| `:dev` | Latest build from `dev` branch |
| `:dev-sha-XXXXXXX` | Specific dev commit (rollback) |
| `:latest` | Latest production build from `main` |
| `:sha-XXXXXXX` | Specific prod commit (rollback) |
