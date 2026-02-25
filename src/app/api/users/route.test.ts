import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@/test/register-api-mocks';

import { prisma } from '@/lib/db';
import { GET } from './route';
import {
  createMockRequest,
  mockAuthNone,
  mockAuthAsUser,
  mockAuthAsAdmin,
  mockAuthAsDev,
} from '@/test/api-helpers';

const mockUserFindMany = vi.mocked(prisma.user.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/users', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuthNone();
    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockAuthAsUser();

    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns 200 with simplified users list for ADMIN', async () => {
    mockAuthAsAdmin();
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
    mockAuthAsDev();
    mockUserFindMany.mockResolvedValueOnce([] as never);

    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    mockAuthAsAdmin();
    mockUserFindMany.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/users');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});
