import { test as base } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { createTestPrismaClient } from './helpers/db'

interface TestFixtures {
  testDb: PrismaClient
}

export const test = base.extend<TestFixtures>({
  testDb: async ({}, use) => {
    const prisma = createTestPrismaClient()
    await use(prisma)
    await prisma.$disconnect()
  },
})

export { expect } from '@playwright/test'
