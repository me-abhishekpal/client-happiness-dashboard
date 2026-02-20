// lib/prisma-base.ts
// Prisma v7 with PostgreSQL driver adapter (@prisma/adapter-pg)
// Prisma v7 uses a wasm-based client engine that always requires a driver adapter.
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
    // Prevent multiple PrismaClient instances in development (hot reload)
    // eslint-disable-next-line no-var
    var _prismaBase: PrismaClient | undefined;
}

function createPrismaClient() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
}

export const prismaBase: PrismaClient = global._prismaBase ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global._prismaBase = prismaBase;
}

export default prismaBase;
