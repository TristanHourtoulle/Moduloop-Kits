import { test, expect } from './fixtures'
import { cleanEntityData } from './helpers/seed'

test.describe('Kit CRUD', () => {
  test.beforeAll(async () => {
    await cleanEntityData()
  })

  test('should display kits list page', async ({ page }) => {
    await page.goto('/kits')
    await expect(page.getByRole('heading', { name: 'Kits' })).toBeVisible()
    await expect(page.getByTestId('kits-create-btn')).toBeVisible()
  })

  test('should create a kit via API and display in list', async ({ page }) => {
    // Seed a product first (kits require at least 1 product)
    const productRes = await page.request.post('/api/products', {
      data: {
        nom: 'Kit Test Product',
        reference: `KIT-PROD-${Date.now()}`,
        description: '',
      },
    })
    if (!productRes.ok()) {
      const body = await productRes.text()
      throw new Error(`API POST /api/products failed: ${productRes.status()} ${body}`)
    }
    const product = await productRes.json()

    // Create a kit via API with the product
    const kitName = `E2E Kit ${Date.now()}`
    const kitRes = await page.request.post('/api/kits', {
      data: {
        nom: kitName,
        style: 'Moderne',
        description: 'E2E test kit',
        surfaceM2: 25,
        products: [{ productId: product.id, quantite: 2 }],
      },
    })
    if (!kitRes.ok()) {
      const body = await kitRes.text()
      throw new Error(`API POST /api/kits failed: ${kitRes.status()} ${body}`)
    }

    // Navigate to kits list and verify kit appears
    await page.goto('/kits')
    await expect(page.getByText(kitName)).toBeVisible({ timeout: 10_000 })
  })

  test('should navigate to kit form page', async ({ page }) => {
    await page.goto('/kits/nouveau')

    // Step 1: Verify general info section is visible
    await expect(page.getByRole('heading', { name: 'Nouveau kit' })).toBeVisible()
    await expect(page.getByText('Informations générales')).toBeVisible()

    // Fill required step 1 fields to pass validation
    await page.locator('#nom').fill('Test Kit')
    await page.locator('#style').fill('Moderne')
    await page.locator('#surfaceM2').fill('25')

    // Navigate to step 2 by clicking "Suivant"
    await page.getByRole('button', { name: /Suivant/ }).click()

    // Step 2: Verify products section and submit button
    await expect(page.getByText('Produits du kit')).toBeVisible()
    await expect(page.getByTestId('kit-submit')).toBeVisible()
  })

  test('should edit a kit', async ({ page }) => {
    // Seed a product first
    const productRes = await page.request.post('/api/products', {
      data: {
        nom: 'Product For Kit Edit',
        reference: `KIT-EDIT-PROD-${Date.now()}`,
        description: '',
      },
    })
    if (!productRes.ok()) {
      const body = await productRes.text()
      throw new Error(`API POST /api/products failed: ${productRes.status()} ${body}`)
    }
    const product = await productRes.json()

    // Seed a kit via API
    const kitRes = await page.request.post('/api/kits', {
      data: {
        nom: 'Kit To Edit',
        style: 'Classique',
        description: 'A kit to edit',
        surfaceM2: 25,
        products: [{ productId: product.id, quantite: 1 }],
      },
    })
    if (!kitRes.ok()) {
      const body = await kitRes.text()
      throw new Error(`API POST /api/kits failed: ${kitRes.status()} ${body}`)
    }
    const kit = await kitRes.json()

    // Navigate to edit page
    await page.goto(`/kits/${kit.id}/modifier`)

    // Step 1: Update the name in general info
    const nomInput = page.locator('#nom')
    await nomInput.waitFor({ state: 'visible', timeout: 10_000 })

    const updatedName = `Updated Kit ${Date.now()}`
    await nomInput.clear()
    await nomInput.fill(updatedName)

    // Navigate to step 2
    await page.getByRole('button', { name: /Suivant/ }).click()

    // Submit from step 2
    await page.getByTestId('kit-submit').click()

    // Should redirect to kits list
    await page.waitForURL('**/kits?updated=**', { timeout: 15_000 })

    // Verify updated name appears
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10_000 })
  })
})
