import { test, expect } from '@playwright/test'
import path from 'node:path'

test.describe('Admin / Permissions', () => {
  test('should deny product creation for USER role', async ({ browser }) => {
    // Create a context with USER storageState
    const context = await browser.newContext({
      storageState: path.resolve('./e2e/.auth/user.json'),
    })
    const page = await context.newPage()

    await page.goto('/products')

    // RoleGuard should block access and show permission denied alert
    await expect(page.getByText(/permissions nécessaires/i).first()).toBeVisible({
      timeout: 10_000,
    })

    // The create button should NOT be visible
    await expect(page.getByTestId('products-create-btn')).not.toBeVisible()

    await context.close()
  })
})
