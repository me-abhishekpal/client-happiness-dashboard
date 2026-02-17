// lib/prisma-base.ts
import { PrismaClient } from '@prisma/client';

/**
 * Base Prisma client without tenant extensions.
 * Used by the tenant context resolution to avoid circular dependencies.
 */
export const prismaBase = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export default prismaBase;
