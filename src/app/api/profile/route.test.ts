import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@/test/register-api-mocks';

import { prisma } from '@/lib/db';
import { GET, PUT } from './route';
import {
  createMockRequest,
  mockAuthNone,
  mockAuthAsUser,
} from '@/test/api-helpers';

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockUserUpdate = vi.mocked(prisma.user.update);
const mockProjectCount = vi.mocked(prisma.project.count);
const mockKitCount = vi.mocked(prisma.kit.count);
const mockProductCount = vi.mocked(prisma.product.count);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/profile', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuthNone();
    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found in DB', async () => {
    // First findUnique: middleware role lookup
    // Second findUnique: route profile lookup
    mockAuthAsUser();
    mockUserFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns user profile with statistics', async () => {
    mockAuthAsUser();
    // Route's own findUnique for profile data
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'user@example.com',
      image: null,
      role: 'USER',
      emailVerified: true,
      createdAt: new Date(),
      accounts: [],
    } as never);
    mockProjectCount.mockResolvedValueOnce(3);
    mockKitCount.mockResolvedValueOnce(1);
    mockProductCount.mockResolvedValueOnce(5);

    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.id).toBe('user-123');
    expect(body.statistics.projectsCount).toBe(3);
    expect(body.statistics.productsCount).toBe(5);
    expect(body.user.hasGoogleAccount).toBe(false);
  });

  it('detects Google account', async () => {
    mockAuthAsUser();
    // Route's own findUnique for profile data
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Test User',
      email: 'user@example.com',
      image: null,
      role: 'USER',
      emailVerified: true,
      createdAt: new Date(),
      accounts: [{ providerId: 'google' }],
    } as never);
    mockProjectCount.mockResolvedValueOnce(0);
    mockKitCount.mockResolvedValueOnce(0);
    mockProductCount.mockResolvedValueOnce(0);

    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    const body = await res.json();

    expect(body.user.hasGoogleAccount).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    mockAuthAsUser();
    // Route's findUnique throws
    mockUserFindUnique.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});

describe('PUT /api/profile', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuthNone();
    const req = createMockRequest('PUT', '/api/profile', { name: 'New Name' });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is empty', async () => {
    mockAuthAsUser();
    const req = createMockRequest('PUT', '/api/profile', { name: '   ' });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with updated user', async () => {
    mockAuthAsUser();
    const updatedUser = { id: 'user-123', name: 'New Name' };
    mockUserUpdate.mockResolvedValueOnce(updatedUser as never);

    const req = createMockRequest('PUT', '/api/profile', { name: 'New Name' });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.name).toBe('New Name');
  });

  it('returns 500 on DB error', async () => {
    mockAuthAsUser();
    mockUserUpdate.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PUT', '/api/profile', { name: 'New Name' });
    const res = await PUT(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});
