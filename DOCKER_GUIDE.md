# Docker Registry & Versioned Deployment Guide

This guide explains how to create a private Docker registry for your production images and how to deploy specific versions of your application.

## 1. Setting Up a Private Registry

For a production environment, you have several options:

### Option A: Self-Hosted Registry (Easy for VPS)
You can run a local registry instance on your server using Docker.

```bash
# Start a local registry on port 5000
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

### Option B: Cloud-Managed Registry (Recommended)
Use a managed service like:
- **GitHub Container Registry (GHCR)**: Integrated with GitHub Actions.
- **Docker Hub**: Private repositories available.
- **Google Artifact Registry / AWS ECR**: Best for high-scale enterprise apps.

## 2. Pushing Versions to the Registry

To push a versioned image, you must tag it with the registry's address and a version (e.g., `v1.0.1` or a git commit hash).

```bash
# 1. Build the image
docker build -t happiness-prod .

# 2. Tag it for the registry (e.g., GHCR)
docker tag happiness-prod ghcr.io/your-username/happiness:v1.0.1

# 3. Push it
docker push ghcr.io/your-username/happiness:v1.0.1
```

## 3. Deploying a Specific Version

To deploy a particular version, update your `docker-compose.yml` or use the following command structure:

### Via Docker Compose (Recommended)
Update the `image` field in your `docker-compose.yml`:

```yaml
services:
  app:
    image: ghcr.io/your-username/happiness:v1.0.1
    # ... rest of config
```

Then run:
```bash
docker compose pull
docker compose up -d
```

### Via CLI Override
You can also override the image tag directly in the command:

```bash
# Pull a specific version
docker pull ghcr.io/your-username/happiness:v1.2.0

# Start it manually (less recommended than compose)
docker run -d --name happiness-app ghcr.io/your-username/happiness:v1.2.0
```

## 4. Rollback Strategy
If a deployment fails, you can quickly revert to a previous known-good version:

```bash
# Revert to last stable version
docker tag ghcr.io/your-username/happiness:v1.1.9 ghcr.io/your-username/happiness:latest
docker compose up -d
```

> [!TIP]
> **Automation**: Use a CI/CD pipeline (like GitHub Actions) to automatically build, tag with the commit hash, and push to your registry on every merge to `main`.
