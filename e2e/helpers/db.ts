import { PrismaClient } from '@prisma/client'

/** Test database connection URL — single source of truth for all E2E helpers. */
export const TEST_DATABASE_URL = 'postgresql://test:test@localhost:5433/moduloop_kits_test'

/**
 * Creates a Prisma client connected to the isolated E2E test database.
 * @returns A PrismaClient instance targeting the test database.
 */
export function createTestPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: TEST_DATABASE_URL } },
  })
}
