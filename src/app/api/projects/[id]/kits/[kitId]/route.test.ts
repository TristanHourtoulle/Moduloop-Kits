import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue(new Headers()),
}));
vi.mock('@/lib/db', () => ({
  prisma: {
    project: { findFirst: vi.fn() },
    projectKit: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
  getProductById: vi.fn(),
  getKitById: vi.fn(),
  getKits: vi.fn(),
  getProducts: vi.fn(),
  getProjects: vi.fn(),
  createProject: vi.fn(),
  calculateProjectTotals: vi.fn(),
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

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PATCH, DELETE } from './route';
import { createMockRequest, mockUserSession } from '@/test/api-helpers';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockProjectFindFirst = vi.mocked(prisma.project.findFirst);
const mockProjectKitFindFirst = vi.mocked(prisma.projectKit.findFirst);
const mockProjectKitUpdate = vi.mocked(prisma.projectKit.update);
const mockProjectKitDelete = vi.mocked(prisma.projectKit.delete);

const makeParams = (id: string, kitId: string) => ({
  params: Promise.resolve({ id, kitId }),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PATCH /api/projects/[id]/kits/[kitId]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('PATCH', '/api/projects/proj-1/kits/pk1', { quantite: 5 });
    const res = await PATCH(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when quantite is less than 1', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const req = createMockRequest('PATCH', '/api/projects/proj-1/kits/pk1', { quantite: 0 });
    const res = await PATCH(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when project not owned', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce(null as never);

    const req = createMockRequest('PATCH', '/api/projects/proj-1/kits/pk1', { quantite: 5 });
    const res = await PATCH(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(404);
  });

  it('returns 404 when projectKit not found', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce({ id: 'proj-1', createdById: 'user-123' } as never);
    mockProjectKitFindFirst.mockResolvedValueOnce(null as never);

    const req = createMockRequest('PATCH', '/api/projects/proj-1/kits/pk1', { quantite: 5 });
    const res = await PATCH(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with updated project kit', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce({ id: 'proj-1', createdById: 'user-123' } as never);
    mockProjectKitFindFirst.mockResolvedValueOnce({
      id: 'pk1',
      quantite: 2,
      kit: { id: 'k1', nom: 'Kit 1' },
    } as never);
    mockProjectKitUpdate.mockResolvedValueOnce({ id: 'pk1', quantite: 5 } as never);

    const req = createMockRequest('PATCH', '/api/projects/proj-1/kits/pk1', { quantite: 5 });
    const res = await PATCH(req, makeParams('proj-1', 'pk1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.quantite).toBe(5);
  });

  it('returns 500 on error', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PATCH', '/api/projects/proj-1/kits/pk1', { quantite: 5 });
    const res = await PATCH(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe('DELETE /api/projects/[id]/kits/[kitId]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('DELETE', '/api/projects/proj-1/kits/pk1');
    const res = await DELETE(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when project not owned', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce(null as never);

    const req = createMockRequest('DELETE', '/api/projects/proj-1/kits/pk1');
    const res = await DELETE(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(404);
  });

  it('returns 404 when projectKit not found', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce({ id: 'proj-1', createdById: 'user-123' } as never);
    mockProjectKitFindFirst.mockResolvedValueOnce(null as never);

    const req = createMockRequest('DELETE', '/api/projects/proj-1/kits/pk1');
    const res = await DELETE(req, makeParams('proj-1', 'pk1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with success', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockProjectFindFirst.mockResolvedValueOnce({ id: 'proj-1', createdById: 'user-123' } as never);
    mockProjectKitFindFirst.mockResolvedValueOnce({
      id: 'pk1',
      quantite: 2,
      kit: { id: 'k1', nom: 'Kit 1' },
    } as never);
    mockProjectKitDelete.mockResolvedValueOnce({} as never);

    const req = createMockRequest('DELETE', '/api/projects/proj-1/kits/pk1');
    const res = await DELETE(req, makeParams('proj-1', 'pk1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
