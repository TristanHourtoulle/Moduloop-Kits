import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    project: { count: vi.fn() },
    kit: { count: vi.fn() },
    product: { count: vi.fn() },
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
import { GET, PUT } from './route';
import { createMockRequest, mockUserSession } from '@/test/api-helpers';

const mockGetSession = vi.mocked(auth.api.getSession);
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
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found in DB', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockUserFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns user profile with statistics', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
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
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
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
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockUserFindUnique.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/profile');
    const res = await GET(req);
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe('PUT /api/profile', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('PUT', '/api/profile', { name: 'New Name' });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is empty', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const req = createMockRequest('PUT', '/api/profile', { name: '   ' });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with updated user', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const updatedUser = { id: 'user-123', name: 'New Name' };
    mockUserUpdate.mockResolvedValueOnce(updatedUser as never);

    const req = createMockRequest('PUT', '/api/profile', { name: 'New Name' });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.name).toBe('New Name');
  });

  it('returns 500 on DB error', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockUserUpdate.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PUT', '/api/profile', { name: 'New Name' });
    const res = await PUT(req);
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
