import { test, expect } from './fixtures'
import { cleanEntityData } from './helpers/seed'

test.describe('Product CRUD', () => {
  test.beforeAll(async () => {
    await cleanEntityData()
  })

  test('should display products list page', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible()
    await expect(page.getByTestId('products-create-btn')).toBeVisible()
  })

  test('should create a new product', async ({ page }) => {
    await page.goto('/products/nouveau')

    // Open the general info accordion (may already be open)
    const nomInput = page.locator('#nom')
    if (!(await nomInput.isVisible())) {
      await page.getByText('Informations générales').click()
    }

    const productName = `E2E Product ${Date.now()}`
    await nomInput.fill(productName)
    await page.locator('#reference').fill(`E2E-REF-${Date.now()}`)

    // Submit the form (defaults for pricing fields are 0, which is valid)
    await page.getByTestId('product-submit').click()

    // Should redirect to products list
    await page.waitForURL('**/products?updated=**', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/products/)

    // Verify product appears in the list
    await expect(page.getByText(productName)).toBeVisible({ timeout: 10_000 })
  })

  test('should edit an existing product', async ({ page }) => {
    // Seed a product via API
    const response = await page.request.post('/api/products', {
      data: {
        nom: 'Product To Edit',
        reference: `EDIT-REF-${Date.now()}`,
        description: '',
      },
    })
    if (!response.ok()) {
      const body = await response.text()
      throw new Error(`API POST /api/products failed: ${response.status()} ${body}`)
    }
    const product = await response.json()

    // Navigate to edit page
    await page.goto(`/products/${product.id}/modifier`)

    // Open the general info accordion if needed
    const nomInput = page.locator('#nom')
    if (!(await nomInput.isVisible())) {
      await page.getByText('Informations générales').click()
    }

    // Change the name
    const updatedName = `Updated Product ${Date.now()}`
    await nomInput.clear()
    await nomInput.fill(updatedName)

    // Submit
    await page.getByTestId('product-submit').click()

    // Should redirect to products list
    await page.waitForURL('**/products?updated=**', { timeout: 15_000 })

    // Verify updated name appears
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10_000 })
  })
})
