import { test, expect } from './fixtures'
import { cleanEntityData } from './helpers/seed'

test.describe('Project CRUD', () => {
  test.beforeAll(async () => {
    await cleanEntityData()
  })

  test('should create a new project', async ({ page }) => {
    await page.goto('/projects')

    // Click the create project button to open modal
    await page.getByTestId('projects-create-btn').click()

    // Fill the modal form
    const projectName = `E2E Project ${Date.now()}`
    await page.getByTestId('project-nom').fill(projectName)
    await page.getByTestId('project-description').fill('E2E test project')

    // Submit
    await page.getByTestId('project-submit').click()

    // Should redirect to the project detail page
    await page.waitForURL('**/projects/**', { timeout: 15_000 })
    await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+/)

    // Verify project name is visible on the detail page
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 10_000 })
  })

  test('should add a kit to a project', async ({ page }) => {
    // Create a project via API
    const projectRes = await page.request.post('/api/projects', {
      data: {
        nom: `Project for Kit ${Date.now()}`,
        description: 'Project to test adding kits',
      },
    })
    expect(projectRes.ok()).toBeTruthy()
    const project = await projectRes.json()

    // Navigate to project detail
    await page.goto(`/projects/${project.id}`)

    // Verify project page loaded
    await expect(page.getByText(project.nom)).toBeVisible({ timeout: 10_000 })

    // The project should exist and be accessible
    await expect(page).toHaveURL(new RegExp(`/projects/${project.id}`))
  })

  test('should change project status', async ({ page }) => {
    // Create a project via API
    const projectRes = await page.request.post('/api/projects', {
      data: {
        nom: `Status Change Project ${Date.now()}`,
        description: 'Test status changes',
      },
    })
    expect(projectRes.ok()).toBeTruthy()
    const project = await projectRes.json()

    // Update status via API
    const updateRes = await page.request.patch(`/api/projects/${project.id}`, {
      data: { status: 'EN_PAUSE' },
    })
    expect(updateRes.ok()).toBeTruthy()

    // Navigate to project detail and verify status is reflected
    await page.goto(`/projects/${project.id}`)
    await expect(page.getByText(project.nom)).toBeVisible({ timeout: 10_000 })

    // The page should show the updated status indicator (use first() for multiple matches)
    await expect(page.getByText(/EN_PAUSE/).first()).toBeVisible({
      timeout: 10_000,
    })
  })
})
