import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
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

import { auth } from '@/lib/auth';
import { prisma, getProductById } from '@/lib/db';
import { GET, PUT, DELETE } from './route';
import { createMockRequest, mockDevSession, mockUserSession } from '@/test/api-helpers';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetProductById = vi.mocked(getProductById);
const mockFindUnique = vi.mocked(prisma.product.findUnique);
const mockUpdate = vi.mocked(prisma.product.update);
const mockDelete = vi.mocked(prisma.product.delete);

// Valid CUID format required by productUpdateSchema
const VALID_ID = 'cm1234567890abcdef1234567';
const VALID_ID_2 = 'cm9876543210fedcba9876543';

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/products/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('GET', `/api/products/${VALID_ID}`);
    const res = await GET(req, makeParams(VALID_ID));
    expect(res.status).toBe(401);
  });

  it('returns product when found', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const product = { id: VALID_ID, nom: 'Product 1' };
    mockGetProductById.mockResolvedValueOnce(product as never);

    const req = createMockRequest('GET', `/api/products/${VALID_ID}`);
    const res = await GET(req, makeParams(VALID_ID));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe(VALID_ID);
  });

  it('returns 404 when product not found', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockGetProductById.mockResolvedValueOnce(null as never);

    const req = createMockRequest('GET', `/api/products/${VALID_ID}`);
    const res = await GET(req, makeParams(VALID_ID));
    expect(res.status).toBe(404);
  });

  it('returns 500 when db throws', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockGetProductById.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', `/api/products/${VALID_ID}`);
    const res = await GET(req, makeParams(VALID_ID));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe('PUT /api/products/[id]', () => {
  const updateData = { nom: 'Updated Product', reference: 'REF-002' };

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('PUT', `/api/products/${VALID_ID}`, updateData);
    const res = await PUT(req, makeParams(VALID_ID));
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const req = createMockRequest('PUT', `/api/products/${VALID_ID}`, updateData);
    const res = await PUT(req, makeParams(VALID_ID));
    expect(res.status).toBe(403);
  });

  it('returns 404 when product does not exist', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('PUT', `/api/products/${VALID_ID}`, updateData);
    const res = await PUT(req, makeParams(VALID_ID));
    expect(res.status).toBe(404);
  });

  it('returns 409 when reference already taken by another product', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique
      .mockResolvedValueOnce({ id: VALID_ID, reference: 'REF-001' } as never)
      .mockResolvedValueOnce({ id: VALID_ID_2, reference: 'REF-002' } as never);

    const req = createMockRequest('PUT', `/api/products/${VALID_ID}`, updateData);
    const res = await PUT(req, makeParams(VALID_ID));
    expect(res.status).toBe(409);
  });

  it('returns 200 with updated product', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce({ id: VALID_ID, reference: 'REF-001' } as never);
    const updatedProduct = { id: VALID_ID, nom: 'Updated Product' };
    mockUpdate.mockResolvedValueOnce(updatedProduct as never);

    const req = createMockRequest('PUT', `/api/products/${VALID_ID}`, { nom: 'Updated Product' });
    const res = await PUT(req, makeParams(VALID_ID));

    expect(res.status).toBe(200);
  });

  it('returns 400 on Zod validation failure', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce({ id: VALID_ID, reference: 'REF-001' } as never);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PUT', `/api/products/${VALID_ID}`, { prixAchat1An: -1 });
    const res = await PUT(req, makeParams(VALID_ID));
    expect(res.status).toBe(400);
    consoleSpy.mockRestore();
  });
});

describe('DELETE /api/products/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('DELETE', `/api/products/${VALID_ID}`);
    const res = await DELETE(req, makeParams(VALID_ID));
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const req = createMockRequest('DELETE', `/api/products/${VALID_ID}`);
    const res = await DELETE(req, makeParams(VALID_ID));
    expect(res.status).toBe(403);
  });

  it('returns 404 when product not found', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('DELETE', `/api/products/${VALID_ID}`);
    const res = await DELETE(req, makeParams(VALID_ID));
    expect(res.status).toBe(404);
  });

  it('returns 200 with success message', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce({ id: VALID_ID } as never);
    mockDelete.mockResolvedValueOnce({} as never);

    const req = createMockRequest('DELETE', `/api/products/${VALID_ID}`);
    const res = await DELETE(req, makeParams(VALID_ID));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBeDefined();
  });
});
