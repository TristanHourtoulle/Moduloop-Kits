import { execSync } from 'node:child_process'
import { TEST_DATABASE_URL } from './helpers/db'

async function globalSetup(): Promise<void> {
  execSync('pnpm db:push --skip-generate', {
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      DIRECT_URL: TEST_DATABASE_URL,
    },
    stdio: 'inherit',
  })
}

export default globalSetup
