import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

// Always use port 3001 for E2E tests to avoid conflict with dev server
const BASE_URL = 'http://localhost:3001'

const TEST_ENV = {
  DATABASE_URL: 'postgresql://test:test@localhost:5433/moduloop_kits_test',
  DIRECT_URL: 'postgresql://test:test@localhost:5433/moduloop_kits_test',
  AUTH_SECRET: 'e2e-test-secret-not-for-production',
  NEXTAUTH_SECRET: 'e2e-test-nextauth-secret',
  NEXT_PUBLIC_APP_URL: BASE_URL,
  GOOGLE_CLIENT_ID: 'fake-google-client-id',
  GOOGLE_CLIENT_SECRET: 'fake-google-client-secret',
}

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'e2e/playwright-report' }],
        ['json', { outputFile: 'e2e/playwright-report/results.json' }],
        ['github'],
      ]
    : [['html', { outputFolder: 'e2e/playwright-report' }]],

  globalSetup: path.resolve('./e2e/global-setup.ts'),
  globalTeardown: path.resolve('./e2e/global-teardown.ts'),

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup project: seeds users and saves auth state (runs first, after webServer)
    {
      name: 'setup',
      testMatch: /setup\.spec\.ts/,
    },
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'chromium',
      testMatch: /^(?!.*\.user\.spec\.ts)(?!.*auth\.spec\.ts)(?!.*setup\.spec\.ts).*\.spec\.ts$/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve('./e2e/.auth/admin.json'),
      },
    },
    {
      name: 'chromium-user',
      testMatch: /\.user\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve('./e2e/.auth/user.json'),
      },
    },
  ],

  webServer: {
    command: `pnpm dev --port 3001`,
    port: 3001,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: TEST_ENV,
  },
})
