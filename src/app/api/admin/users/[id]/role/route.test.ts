import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@/test/register-api-mocks';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PATCH } from './route';
import { createMockRequest, mockAdminSession, mockDevSession, mockUserSession } from '@/test/api-helpers';
import { UserRole } from '@/lib/types/user';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserUpdate = vi.mocked(prisma.user.update);

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PATCH /api/admin/users/[id]/role', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('PATCH', '/api/admin/users/u1/role', { role: 'DEV' });
    const res = await PATCH(req, makeParams('u1'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when caller role is USER', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.USER } as never);

    const req = createMockRequest('PATCH', '/api/admin/users/u1/role', { role: 'DEV' });
    const res = await PATCH(req, makeParams('u1'));
    expect(res.status).toBe(403);
  });

  it('returns 404 when target user not found', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique
      .mockResolvedValueOnce({ role: UserRole.ADMIN } as never)
      .mockResolvedValueOnce(null as never);

    const req = createMockRequest('PATCH', '/api/admin/users/nonexistent/role', { role: 'DEV' });
    const res = await PATCH(req, makeParams('nonexistent'));
    expect(res.status).toBe(404);
  });

  it('returns 403 when trying to change own role', async () => {
    const session = mockAdminSession();
    mockGetSession.mockResolvedValueOnce(session as never);
    mockUserFindUnique
      .mockResolvedValueOnce({ role: UserRole.ADMIN } as never)
      .mockResolvedValueOnce({ id: session.user.id, email: 'admin@test.com', role: UserRole.ADMIN } as never);

    const req = createMockRequest('PATCH', `/api/admin/users/${session.user.id}/role`, { role: 'USER' });
    const res = await PATCH(req, makeParams(session.user.id));
    expect(res.status).toBe(403);
  });

  it('returns 200 when ADMIN changes another user role', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique
      .mockResolvedValueOnce({ role: UserRole.ADMIN } as never)
      .mockResolvedValueOnce({ id: 'u2', email: 'u2@test.com', role: UserRole.USER } as never);
    mockUserUpdate.mockResolvedValueOnce({ id: 'u2', role: UserRole.DEV } as never);

    const req = createMockRequest('PATCH', '/api/admin/users/u2/role', { role: 'DEV' });
    const res = await PATCH(req, makeParams('u2'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.role).toBe(UserRole.DEV);
  });

  it('returns 200 when DEV changes another user role', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockUserFindUnique
      .mockResolvedValueOnce({ role: UserRole.DEV } as never)
      .mockResolvedValueOnce({ id: 'u2', email: 'u2@test.com', role: UserRole.USER } as never);
    mockUserUpdate.mockResolvedValueOnce({ id: 'u2', role: UserRole.DEV } as never);

    const req = createMockRequest('PATCH', '/api/admin/users/u2/role', { role: 'DEV' });
    const res = await PATCH(req, makeParams('u2'));

    expect(res.status).toBe(200);
  });

  it('returns 400 on invalid role value', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique.mockResolvedValueOnce({ role: UserRole.ADMIN } as never);

    const req = createMockRequest('PATCH', '/api/admin/users/u2/role', { role: 'SUPERUSER' });
    const res = await PATCH(req, makeParams('u2'));
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockUserFindUnique.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PATCH', '/api/admin/users/u2/role', { role: 'DEV' });
    const res = await PATCH(req, makeParams('u2'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});
