# Client Happiness Dashboard ⚡

A real-time RAG (Red-Amber-Green) status tracker for Enterprise Client Management.
Replaces manual Excel sheets with an automated, auditable, and actionable dashboard.

## 🚀 Features

### Core
-   **RAG Dashboard:** Instant visibility into portfolio health.
-   **Audit Trail:** Every status change is logged with *Who*, *When*, and *Why*.
-   **Escalations:** Dedicated workflow for high-severity issues.
-   **Watchlist:** Flag "At Risk" accounts before they turn Red.
-   **Evidence:** Upload emails (`.msg`, `.eml`) or PDFs as proof.

### Analytics
-   **Trend Analysis:** Interactive charts showing health over time.
-   **Risk Leaderboard:** Identify which owners manage the most critical accounts.
-   **Department Breakdown:** Compare MIS vs. MSS vs. MEA performance.

## 🛠 Tech Stack

-   **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
-   **Backend:** Next.js Server Actions.
-   **Database:** PostgreSQL (via Prisma ORM).
-   **Auth:** NextAuth.js (Ready for Azure AD integration).
-   **Container:** Docker & Docker Compose.

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

## 📂 Project Structure

-   `app/dashboard` - Main RAG Dashboard.
-   `app/dashboard/analytics` - Charts & Trends.
-   `app/clients/[id]` - Client Detail (Updates, Files, Escalations).
-   `prisma/schema.prisma` - Database Schema.
-   `public/uploads` - Storage for evidence files.

---

**Built with ⚡ by Antigravity**
