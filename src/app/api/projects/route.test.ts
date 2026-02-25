import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test/register-api-mocks'

vi.mock('@/lib/cache', async () => {
  const { createCacheMock } = await import('@/test/mocks/cache')
  return createCacheMock()
})
vi.mock('@/lib/services/project-history', async () => {
  const { createProjectHistoryMock } =
    await import('@/test/mocks/project-history')
  return createProjectHistoryMock()
})
vi.mock('@/lib/services/project.service', () => ({
  calculateProjectTotals: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { prisma, getProjects, createProject } from '@/lib/db'
import { calculateProjectTotals } from '@/lib/services/project.service'
import { GET, POST } from './route'
import {
  createMockRequest,
  mockAdminSession,
  mockUserSession,
} from '@/test/api-helpers'
import { UserRole } from '@/lib/types/user'

const mockGetSession = vi.mocked(auth.api.getSession)
const mockUserFindUnique = vi.mocked(prisma.user.findUnique)
const mockGetProjects = vi.mocked(getProjects)
const mockCreateProject = vi.mocked(createProject)
const mockCalculateProjectTotals = vi.mocked(calculateProjectTotals)

beforeEach(() => {
  vi.clearAllMocks()
  mockCalculateProjectTotals.mockReturnValue({
    totalPrix: 0,
    totalImpact: {
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
    },
    totalSurface: 0,
  } as never)
})

describe('GET /api/projects', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never)
    const req = createMockRequest('GET', '/api/projects')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns own projects for regular user', async () => {
    const session = mockUserSession()
    mockGetSession.mockResolvedValueOnce(session as never)
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.USER } as never)
    const projects = [{ id: 'proj-1', nom: 'My Project' }]
    mockGetProjects.mockResolvedValueOnce(projects as never)

    const req = createMockRequest('GET', '/api/projects')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(mockGetProjects).toHaveBeenCalledWith(session.user.id)
    expect(body).toHaveLength(1)
  })

  it('returns projects for target user when admin passes ?userId=', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never)
    mockUserFindUnique
      .mockResolvedValueOnce({ role: UserRole.ADMIN } as never)
      .mockResolvedValueOnce({
        id: 'target-user',
        name: 'Target',
        email: 't@t.com',
      } as never)
    mockGetProjects.mockResolvedValueOnce([] as never)

    const req = createMockRequest('GET', '/api/projects?userId=target-user')
    await GET(req)

    expect(mockGetProjects).toHaveBeenCalledWith('target-user')
  })

  it('ignores ?userId for non-admin users', async () => {
    const session = mockUserSession()
    mockGetSession.mockResolvedValueOnce(session as never)
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.USER } as never)
    mockGetProjects.mockResolvedValueOnce([] as never)

    const req = createMockRequest('GET', '/api/projects?userId=other-user')
    await GET(req)

    expect(mockGetProjects).toHaveBeenCalledWith(session.user.id)
  })

  it('returns 500 on error', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    mockUserFindUnique.mockRejectedValueOnce(new Error('DB error'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const req = createMockRequest('GET', '/api/projects')
    const res = await GET(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeDefined()
    consoleSpy.mockRestore()
  })
})

describe('POST /api/projects', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never)
    const req = createMockRequest('POST', '/api/projects', { nom: 'New' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when nom is missing', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    const req = createMockRequest('POST', '/api/projects', {})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 201 with created project', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    const project = {
      id: 'proj-1',
      nom: 'New Project',
      createdById: 'user-123',
    }
    mockCreateProject.mockResolvedValueOnce(project as never)

    const req = createMockRequest('POST', '/api/projects', {
      nom: 'New Project',
    })
    const res = await POST(req)

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.nom).toBe('New Project')
  })

  it('returns 500 on DB error', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never)
    mockCreateProject.mockRejectedValueOnce(new Error('DB error'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const req = createMockRequest('POST', '/api/projects', { nom: 'New' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeDefined()
    consoleSpy.mockRestore()
  })
})
