import { PrismaClient } from '@prisma/client';
import { env } from '@/lib/env';

/**
 * One client per process. Next's dev server re-evaluates modules on every hot
 * reload, so without the global cache each reload would open a new pool and
 * exhaust the database's connection limit.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
