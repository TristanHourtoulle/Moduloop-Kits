import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should redirect unauthenticated user to login page', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/auth/connexion**')
    await expect(page).toHaveURL(/\/auth\/connexion/)
  })

  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/auth/connexion')

    await page.getByLabel('Adresse e-mail').fill('e2e-admin@test.com')
    await page.getByLabel('Mot de passe').fill('TestAdmin123!')
    await page.getByTestId('login-submit').click()

    await page.waitForURL('**/dashboard**', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
