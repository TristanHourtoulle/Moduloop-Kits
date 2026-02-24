import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/db', async () => {
  const { createDbMock } = await import('@/test/mocks/db');
  return createDbMock();
});
vi.mock('next/cache', async () => {
  const { createNextCacheMock } = await import('@/test/mocks/cache');
  return createNextCacheMock();
});

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

describe('GET /api/users', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.USER } as never);

    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns 200 with simplified users list for ADMIN', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.ADMIN } as never);
    const users = [
      { id: 'u1', name: 'User One', email: 'u1@test.com', firstName: null, lastName: null },
    ];
    mockUserFindMany.mockResolvedValueOnce(users as never);

    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe('User One');
  });

  it('returns 200 with users list for DEV', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.DEV } as never);
    mockUserFindMany.mockResolvedValueOnce([] as never);

    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});
