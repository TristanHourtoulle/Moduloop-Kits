import { test as setup, expect } from '@playwright/test'
import { seedTestUsers, TEST_USERS } from './helpers/seed'

setup('seed test users and save auth state', async ({ browser, request }) => {
  // Seed test users via Better Auth sign-up API (server is running)
  await seedTestUsers(request)

  // Login as admin and save storageState
  const adminUser = TEST_USERS.find((u) => u.role === 'ADMIN')
  const regularUser = TEST_USERS.find((u) => u.role === 'USER')

  if (!adminUser || !regularUser) {
    throw new Error('Missing test users in seed configuration')
  }

  // Admin login
  const adminContext = await browser.newContext()
  const adminResponse = await adminContext.request.post('/api/auth/sign-in/email', {
    data: { email: adminUser.email, password: adminUser.password },
  })
  expect(adminResponse.ok()).toBeTruthy()
  await adminContext.storageState({ path: 'e2e/.auth/admin.json' })
  await adminContext.close()

  // User login
  const userContext = await browser.newContext()
  const userResponse = await userContext.request.post('/api/auth/sign-in/email', {
    data: { email: regularUser.email, password: regularUser.password },
  })
  expect(userResponse.ok()).toBeTruthy()
  await userContext.storageState({ path: 'e2e/.auth/user.json' })
  await userContext.close()
})
