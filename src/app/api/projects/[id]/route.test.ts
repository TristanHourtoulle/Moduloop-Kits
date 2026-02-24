import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/db', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
  calculateProjectTotals: vi.fn().mockReturnValue({
    totalPrix: 0,
    totalImpact: { rechauffementClimatique: 0, epuisementRessources: 0, acidification: 0, eutrophisation: 0 },
    totalSurface: 0,
  }),
  getProductById: vi.fn(),
  getKitById: vi.fn(),
  getKits: vi.fn(),
  getProducts: vi.fn(),
  getProjects: vi.fn(),
  createProject: vi.fn(),
}));
vi.mock('@/lib/cache', () => ({
  invalidateProducts: vi.fn(),
  invalidateProduct: vi.fn(),
  invalidateKits: vi.fn(),
  invalidateKit: vi.fn(),
  CACHE_CONFIG: { PRODUCTS: { revalidate: 300 }, KITS: { revalidate: 60 } },
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock('@/lib/utils/project/access', () => ({
  verifyProjectAccess: vi.fn(),
}));
vi.mock('@/lib/services/project-history', () => ({
  createProjectCreatedHistory: vi.fn().mockResolvedValue(undefined),
  createProjectUpdatedHistory: vi.fn().mockResolvedValue(undefined),
  createProjectDeletedHistory: vi.fn().mockResolvedValue(undefined),
  createKitAddedHistory: vi.fn().mockResolvedValue(undefined),
  createKitRemovedHistory: vi.fn().mockResolvedValue(undefined),
  createKitQuantityUpdatedHistory: vi.fn().mockResolvedValue(undefined),
  getProjectHistory: vi.fn(),
  recordProjectHistory: vi.fn(),
}));

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma, calculateProjectTotals } from '@/lib/db';
import { verifyProjectAccess } from '@/lib/utils/project/access';
import { GET, PATCH, PUT, DELETE } from './route';
import { createMockRequest, mockUserSession } from '@/test/api-helpers';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockVerifyAccess = vi.mocked(verifyProjectAccess);
const mockProjectFindUnique = vi.mocked(prisma.project.findUnique);
const mockProjectFindFirst = vi.mocked(prisma.project.findFirst);
const mockProjectUpdate = vi.mocked(prisma.project.update);
const mockProjectDelete = vi.mocked(prisma.project.delete);
const mockTransaction = vi.mocked(prisma.$transaction);
const mockCalculateTotals = vi.mocked(calculateProjectTotals);

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  mockCalculateTotals.mockReturnValue({
    totalPrix: 0,
    totalImpact: { rechauffementClimatique: 0, epuisementRessources: 0, acidification: 0, eutrophisation: 0 },
    totalSurface: 0,
  } as never);
});

describe('GET /api/projects/[id]', () => {
  it('returns access denied when verifyProjectAccess fails', async () => {
    mockVerifyAccess.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const req = createMockRequest('GET', '/api/projects/proj-1');
    const res = await GET(req, makeParams('proj-1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when project not found', async () => {
    mockVerifyAccess.mockResolvedValueOnce({
      ok: true,
      data: { userId: 'user-123', isAdmin: false },
    });
    mockProjectFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('GET', '/api/projects/proj-1');
    const res = await GET(req, makeParams('proj-1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with project and totals', async () => {
    mockVerifyAccess.mockResolvedValueOnce({
      ok: true,
      data: { userId: 'user-123', isAdmin: false },
    });
    const project = { id: 'proj-1', nom: 'Test Project', projectKits: [] };
    mockProjectFindUnique.mockResolvedValueOnce(project as never);

    const req = createMockRequest('GET', '/api/projects/proj-1');
    const res = await GET(req, makeParams('proj-1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.nom).toBe('Test Project');
  });
});

describe('PATCH /api/projects/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('PATCH', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PATCH(req, makeParams('proj-1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when project not owned', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce(null as never);

    const req = createMockRequest('PATCH', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PATCH(req, makeParams('proj-1'));
    expect(res.status).toBe(404);
  });

  it('returns 400 when surfaceManual is negative', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);

    const req = createMockRequest('PATCH', '/api/projects/proj-1', { surfaceManual: -5 });
    const res = await PATCH(req, makeParams('proj-1'));
    expect(res.status).toBe(400);
  });

  it('returns 200 with updated project', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce({ id: 'proj-1', nom: 'Old', createdById: 'user-123' } as never);
    const updatedProject = { id: 'proj-1', nom: 'Updated', projectKits: [] };
    mockTransaction.mockImplementationOnce(async (fn) => {
      if (typeof fn === 'function') {
        return fn({
          project: { update: vi.fn().mockResolvedValue(updatedProject) },
        } as never);
      }
      return updatedProject;
    });

    const req = createMockRequest('PATCH', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PATCH(req, makeParams('proj-1'));

    expect(res.status).toBe(200);
  });

  it('returns 500 on error', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PATCH', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PATCH(req, makeParams('proj-1'));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe('PUT /api/projects/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('PUT', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PUT(req, makeParams('proj-1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when not owned', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce(null as never);

    const req = createMockRequest('PUT', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PUT(req, makeParams('proj-1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with updated project', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce({ id: 'proj-1', createdById: 'user-123' } as never);
    const updated = { id: 'proj-1', nom: 'Updated' };
    mockProjectUpdate.mockResolvedValueOnce(updated as never);

    const req = createMockRequest('PUT', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PUT(req, makeParams('proj-1'));

    expect(res.status).toBe(200);
  });

  it('returns 500 on error', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PUT', '/api/projects/proj-1', { nom: 'Updated' });
    const res = await PUT(req, makeParams('proj-1'));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe('DELETE /api/projects/[id]', () => {
  // BUG TRI-54: unauthenticated DELETE returns 500, should be 401
  it('returns 500 when unauthenticated (known bug: should be 401)', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('DELETE', '/api/projects/proj-1');
    const res = await DELETE(req, makeParams('proj-1'));
    expect(res.status).toBe(500);
  });

  it('returns 404 when project not owned', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce(null as never);

    const req = createMockRequest('DELETE', '/api/projects/proj-1');
    const res = await DELETE(req, makeParams('proj-1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 when project deleted', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const project = { id: 'proj-1', nom: 'To Delete', createdById: 'user-123' };
    mockProjectFindFirst.mockResolvedValueOnce(project as never);
    mockProjectDelete.mockResolvedValueOnce({} as never);

    const req = createMockRequest('DELETE', '/api/projects/proj-1');
    const res = await DELETE(req, makeParams('proj-1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBeDefined();
  });

  it('returns 500 on DB error', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce({ id: 'proj-1', createdById: 'user-123' } as never);
    mockProjectDelete.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('DELETE', '/api/projects/proj-1');
    const res = await DELETE(req, makeParams('proj-1'));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
