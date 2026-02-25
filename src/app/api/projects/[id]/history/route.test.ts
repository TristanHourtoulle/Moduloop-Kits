import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test/register-api-mocks'

vi.mock('@/lib/services/project-history', async () => {
  const { createProjectHistoryMock } =
    await import('@/test/mocks/project-history')
  return createProjectHistoryMock()
})

import { prisma } from '@/lib/db'
import { getProjectHistory } from '@/lib/services/project-history'
import { GET } from './route'
import {
  createMockRequest,
  mockAuthNone,
  mockAuthSession,
  makeMockSession,
} from '@/test/api-helpers'
import { UserRole } from '@/lib/types/user'

const mockProjectFindUnique = vi.mocked(prisma.project.findUnique)
const mockGetProjectHistory = vi.mocked(getProjectHistory)

const makeContext = (id: string) => ({ params: Promise.resolve({ id }) })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/projects/[id]/history', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuthNone()
    const req = createMockRequest('GET', '/api/projects/proj-1/history')
    const res = await GET(req, makeContext('proj-1'))
    expect(res.status).toBe(401)
  })

  it('returns 404 when project not found', async () => {
    mockAuthSession(makeMockSession({ id: 'user-123' }))
    mockProjectFindUnique.mockResolvedValueOnce(null as never)

    const req = createMockRequest('GET', '/api/projects/proj-1/history')
    const res = await GET(req, makeContext('proj-1'))
    expect(res.status).toBe(404)
  })

  it('returns 403 when user does not own project and is not admin', async () => {
    mockAuthSession(makeMockSession({ id: 'other-user', role: UserRole.USER }))
    mockProjectFindUnique.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'owner-user',
    } as never)

    const req = createMockRequest('GET', '/api/projects/proj-1/history')
    const res = await GET(req, makeContext('proj-1'))
    expect(res.status).toBe(403)
  })

  it('returns history for project owner', async () => {
    mockAuthSession(makeMockSession({ id: 'owner-user', role: UserRole.USER }))
    mockProjectFindUnique.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'owner-user',
    } as never)
    const history = [{ id: 'h1', changeType: 'CREATED' }]
    mockGetProjectHistory.mockResolvedValueOnce(history as never)

    const req = createMockRequest('GET', '/api/projects/proj-1/history')
    const res = await GET(req, makeContext('proj-1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(history)
  })

  it('returns history for ADMIN regardless of ownership', async () => {
    mockAuthSession(makeMockSession({ id: 'admin-user', role: UserRole.ADMIN }))
    mockProjectFindUnique.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'other-user',
    } as never)
    mockGetProjectHistory.mockResolvedValueOnce([] as never)

    const req = createMockRequest('GET', '/api/projects/proj-1/history')
    const res = await GET(req, makeContext('proj-1'))
    expect(res.status).toBe(200)
  })

  it('returns history for DEV regardless of ownership', async () => {
    mockAuthSession(makeMockSession({ id: 'dev-user', role: UserRole.DEV }))
    mockProjectFindUnique.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'other-user',
    } as never)
    mockGetProjectHistory.mockResolvedValueOnce([] as never)

    const req = createMockRequest('GET', '/api/projects/proj-1/history')
    const res = await GET(req, makeContext('proj-1'))
    expect(res.status).toBe(200)
  })

  it('returns 500 on DB error', async () => {
    mockAuthSession(makeMockSession({ id: 'user-123' }))
    mockProjectFindUnique.mockRejectedValueOnce(new Error('DB error'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const req = createMockRequest('GET', '/api/projects/proj-1/history')
    const res = await GET(req, makeContext('proj-1'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeDefined()
    consoleSpy.mockRestore()
  })
})
