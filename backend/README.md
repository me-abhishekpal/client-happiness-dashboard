# Backend

The backend logic for this application is implemented using **Next.js Server Actions**, which are located in the `frontend` directory.

- **Server Actions**: `frontend/app/actions`
- **API Routes**: `frontend/app/api` (if applicable)
- **Database Access**: `frontend/lib/prisma.ts` (using Prisma Client)

This architecture (Serverless/Full-stack Next.js) does not require a separate backend service/folder for execution, as the server-side code is bundled with the frontend application.
