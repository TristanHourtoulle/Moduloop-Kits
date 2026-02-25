import { execSync } from 'node:child_process'

const TEST_DATABASE_URL = 'postgresql://test:test@localhost:5433/moduloop_kits_test'

async function globalSetup(): Promise<void> {
  // Push Prisma schema to test database (no server needed)
  execSync('pnpm db:push --skip-generate', {
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      DIRECT_URL: TEST_DATABASE_URL,
    },
    stdio: 'pipe',
  })
}

export default globalSetup
