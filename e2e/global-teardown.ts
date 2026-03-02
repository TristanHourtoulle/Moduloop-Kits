import { cleanEntityData } from './helpers/seed'

async function globalTeardown(): Promise<void> {
  await cleanEntityData()
}

export default globalTeardown
