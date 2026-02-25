import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test/register-api-mocks'

import { prisma } from '@/lib/db'
import { GET } from './route'
import {
  createMockRequest,
  mockAuthNone,
  mockAuthAsUser,
  mockAuthAsAdmin,
  mockAuthAsDev,
} from '@/test/api-helpers'
import { UserRole } from '@/lib/types/user'

const mockUserFindMany = vi.mocked(prisma.user.findMany)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/admin/users', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuthNone()
    const req = createMockRequest('GET', '/api/admin/users')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when role is USER', async () => {
    mockAuthAsUser()

    const req = createMockRequest('GET', '/api/admin/users')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns 200 with users list for ADMIN', async () => {
    mockAuthAsAdmin()
    const users = [
      {
        id: 'u1',
        name: 'User 1',
        email: 'u1@test.com',
        firstName: null,
        lastName: null,
        role: UserRole.USER,
        createdAt: new Date(),
        emailVerified: true,
        _count: { projects: 2, createdProducts: 1, createdKits: 0 },
      },
    ]
    mockUserFindMany.mockResolvedValueOnce(users as never)

    const req = createMockRequest('GET', '/api/admin/users')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].stats).toBeDefined()
    expect(body[0].stats.projectsCount).toBe(2)
  })

  it('returns 200 with users list for DEV', async () => {
    mockAuthAsDev()
    mockUserFindMany.mockResolvedValueOnce([] as never)

    const req = createMockRequest('GET', '/api/admin/users')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('returns 500 on DB error', async () => {
    mockAuthAsAdmin()
    mockUserFindMany.mockRejectedValueOnce(new Error('DB error'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const req = createMockRequest('GET', '/api/admin/users')
    const res = await GET(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeDefined()
    consoleSpy.mockRestore()
  })
})
