import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    product: { findMany: vi.fn() },
    kit: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
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

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GET } from './route';
import { createMockRequest, mockAdminSession, mockDevSession, mockUserSession } from '@/test/api-helpers';
import { UserRole } from '@/lib/types/user';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserFindMany = vi.mocked(prisma.user.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/admin/users', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('GET', '/api/admin/users');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.USER } as never);

    const req = createMockRequest('GET', '/api/admin/users');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns 200 with users list for ADMIN', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.ADMIN } as never);
    const users = [{
      id: 'u1',
      name: 'User 1',
      email: 'u1@test.com',
      firstName: null,
      lastName: null,
      role: UserRole.USER,
      createdAt: new Date(),
      emailVerified: true,
      _count: { projects: 2, createdProducts: 1, createdKits: 0 },
    }];
    mockUserFindMany.mockResolvedValueOnce(users as never);

    const req = createMockRequest('GET', '/api/admin/users');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].stats).toBeDefined();
    expect(body[0].stats.projectsCount).toBe(2);
  });

  it('returns 200 with users list for DEV', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.DEV } as never);
    mockUserFindMany.mockResolvedValueOnce([] as never);

    const req = createMockRequest('GET', '/api/admin/users');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/admin/users');
    const res = await GET(req);
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
