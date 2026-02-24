import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/db', () => ({
  prisma: {
    project: { findUnique: vi.fn() },
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
import { getProjectHistory } from '@/lib/services/project-history';
import { GET } from './route';
import { createMockRequest, makeMockSession } from '@/test/api-helpers';
import { UserRole } from '@/lib/types/user';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockProjectFindUnique = vi.mocked(prisma.project.findUnique);
const mockGetProjectHistory = vi.mocked(getProjectHistory);

const makeContext = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/projects/[id]/history', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('GET', '/api/projects/proj-1/history');
    const res = await GET(req, makeContext('proj-1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when project not found', async () => {
    mockGetSession.mockResolvedValueOnce(
      makeMockSession({ id: 'user-123' }) as never,
    );
    mockProjectFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('GET', '/api/projects/proj-1/history');
    const res = await GET(req, makeContext('proj-1'));
    expect(res.status).toBe(404);
  });

  it('returns 403 when user does not own project and is not admin', async () => {
    mockGetSession.mockResolvedValueOnce(
      makeMockSession({ id: 'other-user', role: UserRole.USER }) as never,
    );
    mockProjectFindUnique.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'owner-user',
    } as never);

    const req = createMockRequest('GET', '/api/projects/proj-1/history');
    const res = await GET(req, makeContext('proj-1'));
    expect(res.status).toBe(403);
  });

  it('returns history for project owner', async () => {
    mockGetSession.mockResolvedValueOnce(
      makeMockSession({ id: 'owner-user', role: UserRole.USER }) as never,
    );
    mockProjectFindUnique.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'owner-user',
    } as never);
    const history = [{ id: 'h1', changeType: 'CREATED' }];
    mockGetProjectHistory.mockResolvedValueOnce(history as never);

    const req = createMockRequest('GET', '/api/projects/proj-1/history');
    const res = await GET(req, makeContext('proj-1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(history);
  });

  it('returns history for ADMIN regardless of ownership', async () => {
    mockGetSession.mockResolvedValueOnce(
      makeMockSession({ id: 'admin-user', role: UserRole.ADMIN }) as never,
    );
    mockProjectFindUnique.mockResolvedValueOnce({
      id: 'proj-1',
      createdById: 'other-user',
    } as never);
    mockGetProjectHistory.mockResolvedValueOnce([] as never);

    const req = createMockRequest('GET', '/api/projects/proj-1/history');
    const res = await GET(req, makeContext('proj-1'));
    expect(res.status).toBe(200);
  });
});
