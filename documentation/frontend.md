# Frontend Technical Documentation

## Overview

The frontend is a **Next.js 15** application using the **App Router** with React Server Components. It serves as the primary UI layer for the Client Happiness Dashboard — a multi-tenant SaaS platform for tracking client health, managing teams, and surfacing escalations.

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.2.x | Framework (App Router + SSR) |
| React | 18.3.x | UI rendering |
| TypeScript | 5.8.x | Type safety |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Prisma Client | 7.4.x | Database ORM (used in Server Actions) |
| NextAuth.js | 4.24.x | Authentication & session management |
| Recharts | 2.15.x | Charts and data visualization |
| React Hook Form | 7.54.x | Form state management |
| Zod | 3.24.x | Schema validation |
| Lucide React | 0.475.x | Icon set |
| Nodemailer | 7.x | Email sending (invite/reset flows) |
| Speakeasy | 2.x | TOTP-based MFA |
| bcryptjs | 2.x | Password hashing |

---

## Directory Structure

```
frontend/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx          # Root layout (providers, font loading)
│   ├── page.tsx            # Root redirect (→ /dashboard)
│   ├── globals.css         # Global TailwindCSS base styles
│   ├── login/              # Auth pages
│   ├── setup-password/     # First-login password setup
│   ├── dashboard/          # Main KPI + client status overview
│   ├── clients/            # Client list, detail, edit pages
│   ├── contracts/          # Contract management
│   ├── performance/        # Team performance views
│   ├── reports/            # Reports section
│   ├── strategy/           # Strategy/planning section
│   ├── admin/              # Tenant admin panel (users, roles, titles, departments)
│   ├── super-admin/        # Platform-level admin (manage all tenants)
│   ├── actions/            # Next.js Server Actions (database mutations)
│   ├── api/                # API route handlers
│   │   └── auth/           # NextAuth.js endpoint
│   ├── debug/              # Dev-only debug utilities
│   └── tenant-not-found/   # 404-style tenant error page
│
├── components/             # Reusable React components
│   ├── AppShell.tsx        # Layout shell (sidebar + topnav wrapper)
│   ├── Sidebar.tsx         # Navigation sidebar with RBAC-aware links
│   ├── TopNav.tsx          # Header with user menu
│   ├── DashboardStats.tsx  # KPI cards (total clients, RED/AMBER/GREEN counts)
│   ├── DashboardCharts.tsx # Recharts-based status distribution charts
│   ├── ClientTable.tsx     # Paginated client list
│   ├── ClientForm.tsx      # Add/Edit client form
│   ├── ClientForms.tsx     # Extended client form variants
│   ├── ContractsManager.tsx# Contract CRUD UI
│   ├── AdminUserList.tsx   # Admin: user management
│   ├── AdminClientList.tsx # Admin: client management table
│   ├── RoleForm.tsx        # Admin: role CRUD with permission checkboxes
│   ├── UserForm.tsx        # Admin: create/edit user
│   ├── OrgChart/           # Org chart visualization component
│   ├── ActionableInsights.tsx # AI-generated insight cards
│   └── ui/                 # Base UI primitives (buttons, modals)
│
├── lib/                    # Server-side utilities and business logic
│   ├── prisma.ts           # Prisma client singleton (tenant-aware)
│   ├── prisma-base.ts      # Base Prisma client (non-tenant queries)
│   ├── prisma-tenant.ts    # getTenantPrisma() helper
│   ├── tenant-context.ts   # Tenant resolution from request headers
│   ├── session.ts          # getCurrentUser() and session helpers
│   ├── rbac.ts             # hasPermission() / requirePermission()
│   ├── rbac-logic.ts       # Permission string evaluation logic
│   ├── email.ts            # Nodemailer transport configuration
│   ├── email-templates.ts  # Invite, password reset, MFA email templates
│   ├── notifications.ts    # Notification dispatch utilities
│   ├── validate-email-domain.ts  # Tenant email domain enforcement
│   └── utils.ts            # Miscellaneous utility functions
│
├── middleware.ts            # Tenant resolution edge middleware
├── next.config.js           # Next.js configuration (standalone output)
├── tailwind.config.js       # Tailwind theme configuration
└── tsconfig.json            # TypeScript configuration
```

---

## Routing & Pages

All routes use the **Next.js App Router** (`/app` directory). Each directory creates a URL segment.

| Route | Page | Auth Required | Notes |
|---|---|---|---|
| `/` | Root | No | Auto-redirects → `/dashboard` |
| `/login` | Login | No | Email + bcrypt password |
| `/setup-password` | First-Login Setup | Token | Token-gated via `inviteToken` |
| `/dashboard` | KPI Dashboard | Yes | Charts + status summary |
| `/clients` | Client List | Yes | Searchable, filterable, paginated |
| `/clients/[id]` | Client Detail | Yes | Full profile, history, docs |
| `/contracts` | Contracts | Yes | Service engagement tracker |
| `/performance` | Performance | Yes | Team metrics |
| `/reports` | Reports | Yes | Exportable summaries |
| `/strategy` | Strategy | Yes | Planning section |
| `/admin/*` | Admin Panel | Admin role | Users, roles, titles, departments |
| `/super-admin/*` | Super Admin | SuperAdmin | Multi-tenant management |
| `/api/auth/[...nextauth]` | NextAuth | — | Auth provider endpoint |
| `/api/health` | Health check | No | Returns `{ status: "ok" }` |

---

## Multi-Tenancy

Tenant resolution happens at the **middleware layer** (`middleware.ts`) before any request is processed:

```
Request arrives
     │
     ▼
middleware.ts
     │
     ├─ host = "admin-rag.abhee.org" → x-tenant-type: superadmin
     ├─ host = "acme-rag.abhee.org"  → x-tenant-subdomain: acme
     ├─ host = "happiness.acme.com"  → x-tenant-custom-domain: happiness.acme.com
     └─ host = "localhost"           → x-tenant-slug: default (DEV_TENANT_SLUG)
           │
           ▼
    lib/tenant-context.ts: getTenantId()
    → Looks up tenant from DB by subdomain / customDomain / slug
    → Returns tenant ID for all downstream queries
```

All database queries include `where: { tenantId }` for full data isolation between tenants.

---

## Authentication

Handled by **NextAuth.js v4** with the **Credentials** provider:

1. User submits email + password
2. NextAuth calls credentials handler in `/app/api/auth/[...nextauth].ts`
3. User is looked up by `email + tenantId` (tenant-scoped)
4. `bcryptjs.compare()` validates password
5. MFA check: if `mfaEnabled === true`, user must submit TOTP code (Speakeasy)
6. Session is created with `{ userId, tenantId, role, email }` in the JWT

Session is read in Server Components via `getServerSession()` or the `getCurrentUser()` helper.

---

## RBAC (Role-Based Access Control)

Permissions are stored as a JSON array on the `Role` model:

```json
["dashboard", "clients_read", "clients_write", "reports", "*"]
```

| Role | Default Permissions |
|---|---|
| `ADMIN` | `["*"]` (full access) |
| `EXECUTIVE` | `["dashboard", "clients_read", "reports"]` |
| `MANAGER` | `["dashboard", "clients_read", "clients_write"]` |
| `VIEWER` | `["dashboard"]` |

Checks happen in Server Components and Server Actions:

```typescript
// Redirect non-authorized users
await requirePermission('clients_write');

// Conditional UI rendering
const canEdit = await hasPermission('clients_write');
```

---

## Server Actions

All data mutations are implemented as **Next.js Server Actions** in `app/actions/`:

- **Client actions**: create, update, soft-delete, restore from recycle bin
- **User actions**: invite, update role, delete, wipe data (GDPR)
- **Admin actions**: CRUD for roles, titles, departments
- **Status updates**: log client health status changes with evidence uploads

Server Actions run on the server — no separate API layer is needed for mutations.

---

## Email System

Email is sent via **Nodemailer** using SMTP (configured via `SMTP_*` env vars).

Templates defined in `lib/email-templates.ts`:
- **Invite email**: Contains magic link with `inviteToken` for first-login
- **Password reset**: Token-based secure reset link
- **MFA setup**: QR code email for TOTP app setup
- **Notification emails**: Escalation and status change alerts

---

## Key Commands

```bash
# Install dependencies
cd frontend && npm install

# Run dev server (standalone, requires Postgres on port 5432)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Type-check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` | Postgres connection string |
| `NEXTAUTH_URL` | `https://app-rag.abhee.org` | Public URL for NextAuth callbacks |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Session encryption key |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `me@gmail.com` | SMTP sender address |
| `SMTP_PASS` | `app-password` | SMTP app password |
| `DEV_TENANT_SLUG` | `default` | Tenant slug for localhost dev |
