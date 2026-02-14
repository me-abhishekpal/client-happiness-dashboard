# Deploying to Azure ☁️

This guide explains how to deploy the Client Happiness Dashboard to Azure Web Apps for Containers.

## Prerequisites
-   Azure CLI (`az login`)
-   Docker installed locally

## Step 1: Create a Resource Group
```bash
az group create --name ClientHappinessRG --location eastus
```

## Step 2: Create Azure Container Registry (ACR)
This is where your Docker image will live.

```bash
az acr create --resource-group ClientHappinessRG --name clienthappinessacr --sku Basic --admin-enabled true
```

*Note: The name `clienthappinessacr` must be globally unique. Change it if needed.*

## Step 3: Build & Push Image
Login to ACR:
```bash
az acr login --name clienthappinessacr
```

Build and tag the image:
```bash
# Build locally
docker build -t client-happiness .

# Tag for ACR
docker tag client-happiness clienthappinessacr.azurecr.io/client-happiness:latest

# Push to Azure
docker push clienthappinessacr.azurecr.io/client-happiness:latest
```

## Step 4: Create App Service Plan
This defines the compute power (B1 is cheap, P1v2 is production).

```bash
az appservice plan create --name ClientHappinessPlan --resource-group ClientHappinessRG --is-linux --sku B1
```

## Step 5: Create the Web App
```bash
az webapp create --resource-group ClientHappinessRG --plan ClientHappinessPlan --name client-happiness-dashboard --deployment-container-image-name clienthappinessacr.azurecr.io/client-happiness:latest
```

## Step 6: Configure Environment Variables
Go to the Azure Portal -> App Service -> Settings -> Environment Variables.

Add these:
-   `DATABASE_URL`: `postgresql://...` (See Database section below)
-   `NEXTAUTH_URL`: `https://client-happiness-dashboard.azurewebsites.net`
-   `NEXTAUTH_SECRET`: `(generate a random string)`
-   `SMTP_USER`: `your-email@gmail.com`
-   `SMTP_PASS`: `your-app-password`

## Database Options

### Option A: Azure Database for PostgreSQL (Recommended for Prod)
1.  Create a "Flexible Server" in Azure Portal.
2.  Get the Connection String.
3.  Update `DATABASE_URL` in the Web App settings.

### Option B: SQLite (Testing Only)
If you just want to test, you can use the SQLite file inside the container, BUT **data will be lost** on restart unless you mount Azure Storage.
1.  For persistent SQLite on Azure Web Apps, you must use the `/home` directory.
2.  Update `DATABASE_URL` to `file:/home/dev.db`.
3.  Add setting `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`.

---

**Done!** Your app is now live at `https://client-happiness-dashboard.azurewebsites.net`.
