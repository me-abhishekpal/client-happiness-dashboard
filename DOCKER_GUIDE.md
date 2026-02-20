# Docker Guide

## Architecture

```
dev branch  →  CI builds →  ghcr.io/me-abhishekpal/client-happiness-dashboard:dev      →  dev server
main branch →  CI builds →  ghcr.io/me-abhishekpal/client-happiness-dashboard:latest   →  prod server
                             (also tagged :sha-XXXXXXX for rollback)
```

See [`deployment/CICD_GUIDE.md`](deployment/CICD_GUIDE.md) for the full CI/CD setup guide including GitHub Secrets configuration.

---

## Local Development (Full Docker Stack with Hot Reload)

```bash
# First time
cp .env.dev .env          # Then fill in your values
docker compose -f docker-compose.dev.yml up -d --build

# After first run (no rebuild needed unless Dockerfile changes)
docker compose -f docker-compose.dev.yml up -d

# Live logs
docker compose -f docker-compose.dev.yml logs -f app

# Stop
docker compose -f docker-compose.dev.yml down
```

**Hot reload is active** — changes to `frontend/src/` reflect instantly.
**Postgres** is exposed on `localhost:5432` for tools like TablePlus / psql.

---

## Prod: Start / Update

On your production server:

```bash
cd ~/client-happiness

# Pull latest and restart (done automatically by CI on `main` push)
export IMAGE_TAG=latest
docker compose -f deployment/docker-compose.yml pull app
docker compose -f deployment/docker-compose.yml up -d --no-deps app

# Check status
docker ps --filter "name=client-happiness"
```

---

## Rollback

```bash
# Roll back to a specific SHA
./deployment/rollback.sh sha-abc1234def

# Browse available tags:
# https://github.com/me-abhishekpal/client-happiness-dashboard/pkgs/container/client-happiness-dashboard
```

---

## Image Tags

| Tag | Description |
|---|---|
| `:dev` | Latest `dev` branch build |
| `:dev-sha-XXXXXXX` | Specific dev commit |
| `:latest` | Latest `main` branch production build |
| `:sha-XXXXXXX` | Specific prod commit (rollback target) |
