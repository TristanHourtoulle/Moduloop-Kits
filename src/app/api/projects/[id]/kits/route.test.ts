import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test/register-api-mocks'
import { NextResponse } from 'next/server'

vi.mock('@/lib/cache', async () => {
  const { createCacheMock } = await import('@/test/mocks/cache')
  return createCacheMock()
})
vi.mock('@/lib/utils/project/access', () => ({
  verifyProjectAccess: vi.fn(),
}))
vi.mock('@/lib/services/project-history', async () => {
  const { createProjectHistoryMock } =
    await import('@/test/mocks/project-history')
  return createProjectHistoryMock()
})

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifyProjectAccess } from '@/lib/utils/project/access'
import { POST, GET } from './route'
import { createMockRequest, mockUserSession } from '@/test/api-helpers'

const mockGetSession = vi.mocked(auth.api.getSession)
const mockVerifyAccess = vi.mocked(verifyProjectAccess)
const mockProjectFindFirst = vi.mocked(prisma.project.findFirst)
const mockKitFindMany = vi.mocked(prisma.kit.findMany)
const mockProjectKitFindMany = vi.mocked(prisma.projectKit.findMany)
const mockProjectKitCreate = vi.mocked(prisma.projectKit.create)
const mockProjectKitUpdate = vi.mocked(prisma.projectKit.update)

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/projects/[id]/kits', () => {
  it('returns 401 when verifyProjectAccess fails', async () => {
    mockVerifyAccess.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const req = createMockRequest('GET', '/api/projects/proj-1/kits')
    const res = await GET(req, makeParams('proj-1'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with project kits', async () => {
    mockVerifyAccess.mockResolvedValueOnce({
      ok: true,
      data: { userId: 'user-123', isAdmin: false },
    })
    const kits = [{ id: 'pk1', kitId: 'k1', quantite: 2 }]
    mockProjectKitFindMany.mockResolvedValueOnce(kits as never)

    const req = createMockRequest('GET', '/api/projects/proj-1/kits')
    const res = await GET(req, makeParams('proj-1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
  })
})

describe('POST /api/projects/[id]/kits', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never)
    const req = createMockRequest('POST', '/api/projects/proj-1/kits', {
      kits: [{ kitId: 'k1', quantite: 1 }],
    })
    const res = await POST(req, makeParams('proj-1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when kits array is missing', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    const req = createMockRequest('POST', '/api/projects/proj-1/kits', {})
    const res = await POST(req, makeParams('proj-1'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when kits array is empty', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    const req = createMockRequest('POST', '/api/projects/proj-1/kits', {
      kits: [],
    })
    const res = await POST(req, makeParams('proj-1'))
    expect(res.status).toBe(400)
  })

  it('returns 404 when project not owned', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    mockProjectFindFirst.mockResolvedValueOnce(null as never)

    const req = createMockRequest('POST', '/api/projects/proj-1/kits', {
      kits: [{ kitId: 'k1', quantite: 1 }],
    })
    const res = await POST(req, makeParams('proj-1'))
    expect(res.status).toBe(404)
  })

  it('returns 400 when some kit ids do not exist', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    mockProjectFindFirst.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'user-123',
    } as never)
    mockKitFindMany.mockResolvedValueOnce([] as never)

    const req = createMockRequest('POST', '/api/projects/proj-1/kits', {
      kits: [{ kitId: 'k1', quantite: 1 }],
    })
    const res = await POST(req, makeParams('proj-1'))
    expect(res.status).toBe(400)
  })

  it('returns 201 and creates new project kits', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    mockProjectFindFirst.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'user-123',
    } as never)
    mockKitFindMany.mockResolvedValueOnce([{ id: 'k1', nom: 'Kit 1' }] as never)
    mockProjectKitFindMany.mockResolvedValueOnce([] as never)
    const created = { id: 'pk1', projectId: 'proj-1', kitId: 'k1', quantite: 2 }
    mockProjectKitCreate.mockResolvedValueOnce(created as never)

    const req = createMockRequest('POST', '/api/projects/proj-1/kits', {
      kits: [{ kitId: 'k1', quantite: 2 }],
    })
    const res = await POST(req, makeParams('proj-1'))

    expect(res.status).toBe(201)
  })

  it('returns 201 and accumulates quantity for existing kit', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    mockProjectFindFirst.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'user-123',
    } as never)
    mockKitFindMany.mockResolvedValueOnce([{ id: 'k1', nom: 'Kit 1' }] as never)
    mockProjectKitFindMany.mockResolvedValueOnce([
      { id: 'pk1', kitId: 'k1', quantite: 3 },
    ] as never)
    mockProjectKitUpdate.mockResolvedValueOnce({
      id: 'pk1',
      quantite: 5,
    } as never)

    const req = createMockRequest('POST', '/api/projects/proj-1/kits', {
      kits: [{ kitId: 'k1', quantite: 2 }],
    })
    const res = await POST(req, makeParams('proj-1'))

    expect(res.status).toBe(201)
    expect(mockProjectKitUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { quantite: 5 },
      }),
    )
  })
})
