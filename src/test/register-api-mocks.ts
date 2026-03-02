/**
 * Shared vi.mock registrations for API route integration tests.
 *
 * Import this file as the FIRST import in every API route test file
 * to register the 4 common module mocks (server-only, auth, db, next/cache).
 *
 * Additional per-file mocks (@/lib/cache, @/lib/services/project-history,
 * @/lib/utils/project/access, next/headers) must still be declared
 * directly in each test file.
 */
import { vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', async () => {
  const { createDbMock } = await import('@/test/mocks/db')
  return createDbMock()
})
vi.mock('next/cache', async () => {
  const { createNextCacheMock } = await import('@/test/mocks/cache')
  return createNextCacheMock()
})
