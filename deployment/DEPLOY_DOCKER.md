# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Cloudflare account (for custom domain)
- Domain added to Cloudflare

### 1. Configure Environment

```bash
# Copy environment template
cp .env.production .env

# Edit .env and set:
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - CLOUDFLARE_TUNNEL_TOKEN (from Cloudflare dashboard - see below)
```

### 2. Set Up Cloudflare Tunnel

#### Option A: Using Cloudflare Dashboard (Recommended)
1. Go to https://one.dash.cloudflare.com/
2. Navigate to **Networks** → **Tunnels**
3. Click **Create a tunnel**
4. Name it (e.g., "client-happiness")
5. Copy the tunnel token
6. Add it to your `.env` file as `CLOUDFLARE_TUNNEL_TOKEN`
7. Configure a public hostname:
   - Public hostname: `dashboard.yourdomain.com`
   - Service: `http://app:3000`
8. Update `NEXTAUTH_URL` in `.env` to your custom domain

#### Option B: Using CLI
```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared  # macOS
# or
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb  # Linux

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create client-happiness

# Get tunnel ID
cloudflared tunnel list

# Create DNS record
cloudflared tunnel route dns client-happiness dashboard.yourdomain.com

# Get tunnel token
cloudflared tunnel token client-happiness
```

### 3. Deploy

```bash
cd deployment
chmod +x deploy.sh
./deploy.sh
```

### 4. Access Your Application

- **Local**: http://localhost:3000
- **Custom Domain**: https://dashboard.yourdomain.com (after Cloudflare setup)

## Management Commands

```bash
# View logs
docker compose -f deployment/docker-compose.yml logs -f

# View app logs only
docker compose -f deployment/docker-compose.yml logs -f app

# Stop services
docker compose -f deployment/docker-compose.yml stop

# Restart services
docker compose -f deployment/docker-compose.yml restart

# Remove containers (keeps data)
docker compose -f deployment/docker-compose.yml down

# Remove everything including volumes
docker compose -f deployment/docker-compose.yml down -v
```

## Data Persistence

The following data is persisted in Docker volumes:
- **Database**: `database/prisma/dev.db`
- **Uploaded Files**: `database/uploads/`

These directories are mounted as volumes, so your data persists even if containers are removed.

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose -f deployment/docker-compose.yml logs

# Rebuild from scratch
docker compose -f deployment/docker-compose.yml down
docker compose -f deployment/docker-compose.yml build --no-cache
docker compose -f deployment/docker-compose.yml up -d
```

### Database errors
```bash
# Access container
docker exec -it client-happiness-app sh

# Run migrations manually
cd /app/database
npx prisma migrate deploy
```

### Cloudflare Tunnel not working
1. Verify `CLOUDFLARE_TUNNEL_TOKEN` is set correctly in `.env`
2. Check tunnel status in Cloudflare dashboard
3. Ensure public hostname is configured
4. Check tunnel logs: `docker compose -f deployment/docker-compose.yml logs cloudflared`

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
cd deployment
docker compose build
docker compose up -d

# Run any new migrations
docker exec -it client-happiness-app sh -c "cd /app/database && npx prisma migrate deploy"
```

## Security Notes

- Never commit `.env` file to version control
- Use strong `NEXTAUTH_SECRET` (minimum 32 characters)
- Keep Cloudflare tunnel token secure
- Enable Cloudflare firewall rules if needed
- Consider adding rate limiting via Cloudflare

## Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure Cloudflare Tunnel with custom domain
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Set up regular database backups
- [ ] Configure Cloudflare firewall rules
- [ ] Enable HTTPS (automatic with Cloudflare)
- [ ] Set up monitoring/alerting
- [ ] Document admin credentials securely
