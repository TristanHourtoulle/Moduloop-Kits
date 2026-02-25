import { PrismaClient } from '@prisma/client'

const TEST_DATABASE_URL = 'postgresql://test:test@localhost:5433/moduloop_kits_test'

export function createTestPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: TEST_DATABASE_URL } },
  })
}
