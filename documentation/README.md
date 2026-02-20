# Documentation

Technical documentation for the **Client Happiness Dashboard** — a multi-tenant SaaS platform for client health tracking, team management, and executive reporting.

---

## Documents

| Document | Description |
|---|---|
| [frontend.md](./frontend.md) | Next.js 15 app structure, routing, auth, RBAC, Server Actions, email |
| [database.md](./database.md) | PostgreSQL schema, Prisma models, migrations, seeding, multi-tenancy |
| [deployment.md](./deployment.md) | Docker environments (dev + prod), Dockerfile stages, Cloudflare Tunnel, rollback |
| [cicd.md](./cicd.md) | GitHub Actions workflows, GHCR image registry, secrets, branch strategy |
| [security.md](./security.md) | Auth flows, MFA, tenant isolation, RBAC, secrets, container security, audit trail |

---

## Quick Reference

### Start Local Dev
```bash
cp .env.dev .env   # Fill in values
docker compose -f docker-compose.dev.yml up -d --build
```

### Deploy to Production
```bash
git checkout main && git merge dev && git push origin main
# ↑ CI auto-builds image and deploys to prod
```

### Roll Back Production
```bash
./deployment/rollback.sh sha-<commit>
```

### Run Database Migrations
```bash
cd database && npx prisma migrate dev --config prisma.config.ts --name <description>
```
