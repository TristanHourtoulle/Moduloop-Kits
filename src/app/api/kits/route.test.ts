import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/db', () => ({
  prisma: {
    product: { findMany: vi.fn() },
    kit: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  },
  getKits: vi.fn(),
  getKitById: vi.fn(),
  getProductById: vi.fn(),
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

import { auth } from '@/lib/auth';
import { prisma, getKits } from '@/lib/db';
import { GET, POST } from './route';
import { createMockRequest, mockDevSession, mockUserSession } from '@/test/api-helpers';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetKits = vi.mocked(getKits);
const mockProductFindMany = vi.mocked(prisma.product.findMany);
const mockKitCreate = vi.mocked(prisma.kit.create);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/kits', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('GET', '/api/kits');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns kits list', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const kits = [{ id: 'k1', nom: 'Kit 1' }];
    mockGetKits.mockResolvedValueOnce(kits as never);

    const req = createMockRequest('GET', '/api/kits');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(kits);
  });

  it('passes search and style params to getKits', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockGetKits.mockResolvedValueOnce([] as never);

    const req = createMockRequest('GET', '/api/kits?search=modern&style=bureau');
    await GET(req);

    expect(mockGetKits).toHaveBeenCalledWith({ search: 'modern', style: 'bureau' });
  });

  it('returns 500 when getKits throws', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockGetKits.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/kits');
    const res = await GET(req);
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe('POST /api/kits', () => {
  const validKit = {
    nom: 'New Kit',
    style: 'modern',
    products: [{ productId: 'p1', quantite: 2 }],
  };

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('POST', '/api/kits', validKit);
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const req = createMockRequest('POST', '/api/kits', validKit);
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 400 when product ids do not exist', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockProductFindMany.mockResolvedValueOnce([] as never);

    const req = createMockRequest('POST', '/api/kits', validKit);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('p1');
  });

  it('returns 201 when kit created by DEV', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockProductFindMany.mockResolvedValueOnce([{ id: 'p1' }] as never);
    const createdKit = { id: 'k1', nom: 'New Kit' };
    mockKitCreate.mockResolvedValueOnce(createdKit as never);

    const req = createMockRequest('POST', '/api/kits', validKit);
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('k1');
  });

  it('groups duplicate product ids and sums quantities', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockProductFindMany.mockResolvedValueOnce([{ id: 'p1' }] as never);
    mockKitCreate.mockResolvedValueOnce({ id: 'k1' } as never);

    const kitWithDupes = {
      nom: 'Kit Dupes',
      style: 'modern',
      products: [
        { productId: 'p1', quantite: 2 },
        { productId: 'p1', quantite: 3 },
      ],
    };
    const req = createMockRequest('POST', '/api/kits', kitWithDupes);
    await POST(req);

    expect(mockKitCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kitProducts: {
            create: [{ productId: 'p1', quantite: 5 }],
          },
        }),
      }),
    );
  });

  it('returns 400 on Zod schema failure', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('POST', '/api/kits', { nom: '', style: '', products: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    consoleSpy.mockRestore();
  });
});
