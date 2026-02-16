# Client Happiness Dashboard ⚡

A real-time RAG (Red-Amber-Green) status tracker for Enterprise Client Management.
Replaces manual Excel sheets with an automated, auditable, and actionable dashboard.

## 🚀 Features

### Core
-   **RAG Dashboard:** Instant visibility into portfolio health with standardized RED/AMBER/GREEN status indicators.
-   **Standardized Status System:** Unified RAG values (RED/AMBER/GREEN) with semantic display text (CRITICAL/AT RISK/HEALTHY).
-   **User Management:** Complete personnel database with 46+ users (CSMs, PMs, AMs, vCISOs) linked to client records.
-   **Client Ownership:** All clients connected to actual User records for enhanced accountability tracking.
-   **Audit Trail:** Every status change is logged with *Who*, *When*, and *Why*.
-   **Escalations:** Dedicated workflow for high-severity issues.
-   **Watchlist:** Flag "At Risk" accounts before they turn Red.
-   **Evidence:** Upload emails (`.msg`, `.eml`) or PDFs as proof.

### Admin UI
-   **Sticky Columns:** Client names remain visible during horizontal scrolling in admin lists.
-   **Enhanced Forms:** RAG Status selection with descriptive labels (GREEN (Healthy), AMBER (At Risk), RED (Critical)).
-   **User-Based Selection:** Assign clients to actual users from the migrated personnel database.

### Analytics
-   **Trend Analysis:** Interactive charts showing health over time.
-   **Risk Leaderboard:** Identify which owners manage the most critical accounts.
-   **Department Breakdown:** Compare MIS vs. MSS vs. MEA performance.

## 🛠 Tech Stack

-   **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
-   **Backend:** Next.js Server Actions.
-   **Database:** SQLite (via Prisma ORM) for local/production, PostgreSQL ready for enterprise scale.
-   **Auth:** NextAuth.js with MFA support (Ready for Azure AD integration).
-   **Container:** Docker & Docker Compose with Cloudflare Tunnel.
-   **Deployment:** Production at https://rag.abhee.org

## 📦 Deployment

### Option A: Docker (Recommended)
The easiest way to run the full stack (App + Database).

```bash
# 1. Start the containers
docker-compose up -d

# 2. Access the app
# Open http://localhost:3000
```

### Option B: Local Development
If you want to modify the code.

```bash
# 1. Install dependencies
npm install

# 2. Set up Database (SQLite for local dev, or update .env for Postgres)
npx prisma generate
npx prisma db push

# 3. Seed Data (Optional)
npx prisma db seed

# 4. Run the app
npm run dev
```

## 🔐 Environment Variables
Create a `.env` file (or use `docker-compose.yml` defaults):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/client_happiness"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email Settings (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📊 Data Management

### Migration Scripts
Located in `database/` directory:

#### User Migration
```bash
# Migrate all personnel from CSV to User table
DATABASE_URL="file:./database/prisma/dev.db" \
  npx ts-node --compiler-options '{"module":"CommonJS"}' \
  database/migrate-users.ts
```

#### Client-User Linking
```bash
# Link existing clients to migrated users
DATABASE_URL="file:./database/prisma/dev.db" \
  npx ts-node --compiler-options '{"module":"CommonJS"}' \
  database/link-clients-to-users.ts
```

#### Status Standardization
```bash
# Migrate legacy status values to standard RAG format
sqlite3 database/prisma/dev.db < database/cleanup-status.sql
```

#### Client Import
```bash
# Import clients from data.csv
DATABASE_URL="file:./database/prisma/dev.db" \
  npx ts-node --compiler-options '{"module":"CommonJS"}' \
  database/import-clients.ts
```

## 📂 Project Structure

-   `app/dashboard` - Main RAG Dashboard.
-   `app/dashboard/analytics` - Charts & Trends.
-   `app/clients/[id]` - Client Detail (Updates, Files, Escalations).
-   `prisma/schema.prisma` - Database Schema.
-   `public/uploads` - Storage for evidence files.

---

**Built with ⚡ by Antigravity**
