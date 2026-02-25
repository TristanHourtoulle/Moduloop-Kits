import type { APIRequestContext } from '@playwright/test'
import { createTestPrismaClient } from './db'

interface TestUser {
  email: string
  password: string
  name: string
  role: 'USER' | 'ADMIN'
}

const TEST_USERS: TestUser[] = [
  {
    email: 'e2e-admin@test.com',
    password: 'TestAdmin123!',
    name: 'E2E Admin',
    role: 'ADMIN',
  },
  {
    email: 'e2e-user@test.com',
    password: 'TestUser123!',
    name: 'E2E User',
    role: 'USER',
  },
]

export { TEST_USERS }

async function signUpUser(
  request: APIRequestContext,
  email: string,
  password: string,
  name: string,
): Promise<boolean> {
  const response = await request.post('/api/auth/sign-up/email', {
    data: { email, password, name },
  })

  if (response.ok()) return true

  // User might already exist from a previous run
  const status = response.status()
  if (status === 422 || status === 409) return false

  try {
    const body = await response.json()
    if (body.code === 'USER_ALREADY_EXISTS') return false
  } catch {
    // Response might not be JSON
  }

  throw new Error(`Failed to sign up ${email}: ${status} ${response.statusText()}`)
}

export async function seedTestUsers(request: APIRequestContext): Promise<void> {
  const prisma = createTestPrismaClient()

  try {
    for (const user of TEST_USERS) {
      await signUpUser(request, user.email, user.password, user.name)

      // Update role if needed (Better Auth defaults to USER)
      if (user.role !== 'USER') {
        await prisma.user.updateMany({
          where: { email: user.email },
          data: { role: user.role },
        })
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

export async function cleanEntityData(): Promise<void> {
  const prisma = createTestPrismaClient()

  try {
    // Order matters due to foreign keys
    await prisma.projectHistory.deleteMany({})
    await prisma.projectKit.deleteMany({})
    await prisma.project.deleteMany({})
    await prisma.kitProduct.deleteMany({})
    await prisma.kit.deleteMany({})
    await prisma.product.deleteMany({})
  } finally {
    await prisma.$disconnect()
  }
}
