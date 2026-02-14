# Enterprise Client RAG Platform ⚡

Moving from "Spreadsheet Chaos" to a **Governance Platform** integrated with Office 365.

## 1. Core Architecture
-   **App:** Next.js 14 (App Router)
-   **Database:** PostgreSQL (via Prisma ORM) - Essential for relationships (Org Chart).
-   **Auth:** **NextAuth.js with Azure Active Directory (Office 365)**.
    -   Users log in with their existing work email.
    -   No new passwords to manage.
-   **Hosting:** Vercel (easiest) or Azure Static Web Apps (if you want to keep it in your tenant).

## 2. Role-Based Access Control (RBAC)
We will define strict roles:

| Role | Permissions | Who? |
| :--- | :--- | :--- |
| **Viewer** | Read-only access to dashboard. | General staff |
| **Manager** | Update status for *assigned* accounts. | CS, PMs (Rachit, Sourabh, etc.) |
| **Executive** | View "Executive Summary", Clear Red flags, Edit Org Chart. | Vipin, AJ, Jim, Abhijeet |
| **Admin** | Manage users, configure system. | You (Abhee) |

## 3. The Org Chart & Notifications
We need to model the hierarchy to route alerts correctly.

*   **Scenario A (Routine Update):** PM updates status to Green. -> No alert (or digest only).
*   **Scenario B (Escalation):** PM updates status to **RED**.
    *   **System Action:**
        *   Logs the change.
        *   Sends **Teams Notification** to their Manager.
        *   Sends **Email Alert** to the "Executive Watchlist" (Vipin/AJ/Jim).
    *   **Audit:** "Updated by Rachit at 10:00 AM."

## 4. Features
-   **Change Log:** Every edit is saved. No more "silent changes" in Excel.
-   **"My Action Items":** A view for Executives showing only RED/AMBER accounts needing attention.
-   **Export:** Generate PDF/Excel reports for weekly meetings.

## 5. Data Model (Draft)
```prisma
model User {
  id        String  @id @default(cuid())
  email     String  @unique
  name      String?
  role      Role    @default(VIEWER) // ADMIN, EXECUTIVE, MANAGER, VIEWER
  managerId String?
  manager   User?   @relation("Management", fields: [managerId], references: [id])
  reports   User[]  @relation("Management")
}

model Department {
  id          String   @id @default(cuid())
  name        String   // "MIS", "MSS", "MEA", "PMO", "CS", "AM"
  headId      String?  // Optional Head of Department
  head        User?    @relation("DeptHead", fields: [headId], references: [id])
  users       User[]
  clients     Client[]
}

model Client {
  id          String   @id @default(cuid())
  name        String
  status      RAGStatus
  departmentId String?
  department  Department? @relation(fields: [departmentId], references: [id])
  ownerId     String
  owner       User     @relation("ClientOwner", fields: [ownerId], references: [id])
  accountableId String? // The "Accountability" person from Excel
  accountable User?    @relation("ClientAccountable", fields: [accountableId], references: [id])
  updates     StatusUpdate[]
}
```
