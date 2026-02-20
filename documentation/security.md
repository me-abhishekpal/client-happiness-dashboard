# Security Technical Documentation

## Overview

Security is implemented at multiple layers across authentication, authorization, data isolation, transport, and operational practices. This document covers how each security mechanism works and how to configure it.

---

## Security Architecture

```
Request arrives at Cloudflare edge (HTTPS/TLS 1.3)
     │
     ▼
Cloudflare Tunnel → app:3000 (internal Docker network, no inbound ports)
     │
     ▼
Next.js Middleware → Tenant resolution (no cross-tenant leakage possible)
     │
     ▼
NextAuth.js → Session validation (JWT in httpOnly cookie)
     │
     ├─ Not authenticated → redirect /login
     └─ Authenticated
          │
          ▼
     RBAC Check → hasPermission(route)
          │
          ├─ No permission → redirect /login?error=access_denied
          └─ Permitted → render page / execute server action
```

---

## 1. Transport Security

### Cloudflare Tunnel
- All production traffic passes through **Cloudflare's edge network** over HTTPS
- The server has **zero open inbound ports** — the `cloudflared` container maintains an outbound connection only
- TLS is terminated at Cloudflare edge; internal Docker traffic is HTTP on the private bridge network

### HTTPS Enforcement
- `NEXTAUTH_URL` must always be the `https://` production URL to ensure auth cookies are `Secure`
- In development, localhost is used (no HTTPS required)

---

## 2. Authentication

Handled by **NextAuth.js v4** with the `CredentialsProvider`.

### Login Flow

```
POST /api/auth/callback/credentials
   │
   ├─ Look up user by email + tenantId (tenant-scoped)
   ├─ bcrypt.compare(inputPassword, passwordHash)
   ├─ Check mfaEnabled → if true, require TOTP code
   ├─ Check allowedEmailDomain → if set, reject non-matching emails (unless isGuest)
   └─ Create session JWT with { userId, tenantId, email, role }
```

### Session
- Sessions are stored as **signed JWTs** in an **httpOnly cookie** (`next-auth.session-token`)
- `NEXTAUTH_SECRET` (min 32 bytes) is used to sign and encrypt the JWT
- Session expires per NextAuth's default policy

### Password Storage
- Passwords are hashed with **bcrypt** (cost factor: 10)
- Plain-text passwords are **never stored or logged**

### First-Login Flow
- Admin invites a user → system generates a `inviteToken` (unique UUID) stored in DB
- Security: token is single-use and has an `inviteTokenExpiry` timestamp
- User opens the invite link → sets password → token is cleared

### Password Reset
- Token-based reset link emailed via SMTP
- Reset tokens expire and are single-use

---

## 3. Multi-Factor Authentication (MFA)

Implemented using **TOTP** (Time-based One-Time Passwords) via the `speakeasy` library.

### Setup Flow
1. Admin enables MFA for a user
2. `speakeasy.generateSecret()` creates a secret stored encrypted in `User.mfaSecret`
3. QR code is generated and emailed to the user
4. User scans QR with Google Authenticator / Authy
5. Next login requires the 6-digit TOTP code

### Validation
```typescript
speakeasy.totp.verify({
  secret: user.mfaSecret,
  encoding: 'base32',
  token: inputCode,
  window: 1   // ±30 seconds tolerance
})
```

### MFA Bypass
- Platform `SuperAdmin` accounts created via script can have MFA disabled at creation (with `mfaEnabled: false`)
- Tenant `ADMIN` role users can manage MFA for users within their tenant

---

## 4. Multi-Tenant Data Isolation

Every row in every tenant-data table has a `tenantId` column. Tenant identity is resolved once per request in `middleware.ts` and propagated as an HTTP header.

### Isolation Mechanism

```
Request header: x-tenant-subdomain: acme
     │
     ▼
lib/tenant-context.ts: getTenantId()
→ SELECT id FROM Tenant WHERE subdomain = 'acme'
→ Returns tenantId = 'clx...'
     │
     ▼
All DB queries: WHERE tenantId = 'clx...'
```

> [!CAUTION]
> Using the raw `prismaBase` client (without tenant scoping) for tenant-data queries is a security anti-pattern. Always use `getTenantPrisma()` or include `tenantId` explicitly.

### Cross-Tenant Prevention
- `Tenant.slug`, `Tenant.subdomain`, `Tenant.customDomain` are all `@unique` — no request can accidentally resolve to the wrong tenant
- Prisma's `onDelete: Cascade` ensures that when a tenant is deleted, all related data (users, clients, etc.) is removed

---

## 5. Role-Based Access Control (RBAC)

### Permission Model

Permissions are stored as a JSON array on the `Role` model:

```json
{
  "name": "MANAGER",
  "permissions": "[\"dashboard\", \"clients_read\", \"clients_write\"]"
}
```

Special value `["*"]` grants full access (ADMIN only).

### Enforcement Points

**Server Components (page load):**
```typescript
await requirePermission('clients_write');
// → redirects to /login?error=access_denied if not authorized
```

**Server Actions (mutations):**
```typescript
const allowed = await hasPermission('clients_write');
if (!allowed) throw new Error('Unauthorized');
```

**Sidebar navigation** (`components/Sidebar.tsx`):
- Navigation items are filtered client-side based on session role
- This is UI-only — server-side checks are the authoritative gate

### Role Hierarchy

| Role | Inherits | Key Permissions |
|---|---|---|
| `ADMIN` | — | `["*"]` — everything |
| `EXECUTIVE` | — | Read dashboard, clients, reports |
| `MANAGER` | — | Read + write clients |
| `VIEWER` | — | Dashboard only |
| `SuperAdmin` | Platform-level | Cross-tenant access (not a tenant role) |

---

## 6. Email Domain Restriction

When `Tenant.allowedEmailDomain` is set (e.g., `abhee.org`):

- **Login**: Users with non-matching emails cannot log in (unless `isGuest: true`)
- **Invite**: Admin cannot invite users outside the allowed domain (validated server-side)
- **Bypass**: Guest users (`isGuest: true`) are excluded from domain checks — view-only access

Implemented in `lib/validate-email-domain.ts`.

---

## 7. Environment Secrets Management

### What Must Be Secret
| Variable | Sensitivity | Storage |
|---|---|---|
| `NEXTAUTH_SECRET` | 🔴 Critical | Server `.env` only. Never commit. |
| `POSTGRES_PASSWORD` | 🔴 Critical | Server `.env` + GitHub Secrets |
| `CLOUDFLARE_TUNNEL_TOKEN` | 🔴 Critical | Server `.env` + GitHub Secrets |
| `SMTP_PASS` | 🟡 High | Server `.env` only |
| `PROD_SSH_KEY` | 🔴 Critical | GitHub Secrets only |

### Rules
- `.env` files with real values are **gitignored** (`**/.env*` in `.gitignore`)
- Only `.env.dev` (placeholder template) is committed to the repo
- Production secrets are injected at runtime via environment variables in `docker-compose.yml`
- CI/CD secrets are stored in **GitHub Actions Secrets** (encrypted at rest)

---

## 8. Container Security

### Non-Root User
The production Dockerfile creates and runs as a non-root user:

```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

### Network Isolation
- All services communicate on an internal Docker bridge network (`app-network`)
- Only port `3000` is exposed on the host in dev
- In production, port `3000` is **not exposed** — Cloudflare Tunnel connects internally

### Image Traceability
Every production image is labeled with the Git SHA:

```dockerfile
LABEL org.opencontainers.image.revision="${VERSION_TAG}"
```

This allows you to trace any running container back to its exact source commit.

---

## 9. SuperAdmin Security

The `SuperAdmin` model is separate from tenant `User` records:

- SuperAdmins access the platform via `admin-rag.abhee.org` (detected in middleware)
- SuperAdmin accounts are created via script (not via UI invite flow)
- SuperAdmin sessions are distinct from tenant user sessions

SuperAdmins can:
- View and manage all tenants
- Create/suspend tenants
- Access all tenant data

> [!WARNING]
> SuperAdmin credentials must be changed from seed defaults immediately after first deployment. Default seed email: `abhee@example.com` / password: `password123`.

---

## 10. Audit Trail

All client status changes are logged in the `StatusUpdate` model:

```prisma
model StatusUpdate {
  clientId   String
  userId     String      // WHO made the change
  oldStatus  String      // FROM what status
  newStatus  String      // TO what status
  comments   String?     // WHY
  files      File[]      // Evidence attached
  createdAt  DateTime    // WHEN
  tenantId   String      // WHICH tenant
}
```

This provides a complete, immutable audit log of every client health change, visible in the client detail page.

---

## Security Checklist (Production Go-Live)

- [ ] Change SuperAdmin default password (`abhee@example.com`)
- [ ] Rotate `NEXTAUTH_SECRET` to a production-generated value: `openssl rand -base64 32`
- [ ] Set a strong `POSTGRES_PASSWORD` (not the development value)
- [ ] Confirm `NEXTAUTH_URL` is set to `https://` production URL
- [ ] Set `Tenant.allowedEmailDomain` to restrict login to your org's email domain
- [ ] Enable MFA for all ADMIN-role tenant users
- [ ] Verify Cloudflare Tunnel is the only inbound route (no open server ports)
- [ ] Confirm `.env` is in `.gitignore` and not committed to the repository
- [ ] Rotate SSH keys used in GitHub Secrets if compromised
