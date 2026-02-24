import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@/test/register-api-mocks';

vi.mock('@/lib/cache', async () => {
  const { createCacheMock } = await import('@/test/mocks/cache');
  return createCacheMock();
});

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GET, POST } from './route';
import { createMockRequest, mockAdminSession, mockDevSession, mockUserSession } from '@/test/api-helpers';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockFindMany = vi.mocked(prisma.product.findMany);
const mockFindUnique = vi.mocked(prisma.product.findUnique);
const mockCreate = vi.mocked(prisma.product.create);
const mockCount = vi.mocked(prisma.product.count);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/products', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('GET', '/api/products');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns paginated products for authenticated user', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const products = [{ id: 'p1', nom: 'Product 1' }];
    mockFindMany.mockResolvedValueOnce(products as never);
    mockCount.mockResolvedValueOnce(1);

    const req = createMockRequest('GET', '/api/products');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.products).toEqual(products);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.total).toBe(1);
  });

  it('returns all products when ?all=true', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockFindMany.mockResolvedValueOnce([] as never);

    const req = createMockRequest('GET', '/api/products?all=true');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.hasNext).toBe(false);
    expect(body.pagination.hasPrev).toBe(false);
  });

  it('filters by search param', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockFindMany.mockResolvedValueOnce([] as never);
    mockCount.mockResolvedValueOnce(0);

    const req = createMockRequest('GET', '/api/products?search=test');
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ nom: expect.objectContaining({ contains: 'test' }) }),
          ]),
        }),
      }),
    );
  });

  it('applies pagination params', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockFindMany.mockResolvedValueOnce([] as never);
    mockCount.mockResolvedValueOnce(20);

    const req = createMockRequest('GET', '/api/products?page=2&limit=5');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      }),
    );
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(5);
  });

  it('returns 500 when prisma throws', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    mockFindMany.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/products');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});

describe('POST /api/products', () => {
  const validProduct = {
    nom: 'Test Product',
    reference: 'REF-001',
    description: null,
  };

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null as never);
    const req = createMockRequest('POST', '/api/products', validProduct);
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user role is USER', async () => {
    mockGetSession.mockResolvedValueOnce(mockUserSession() as never);
    const req = createMockRequest('POST', '/api/products', validProduct);
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 201 when DEV creates a product', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce(null as never);
    const createdProduct = { id: 'p1', ...validProduct };
    mockCreate.mockResolvedValueOnce(createdProduct as never);

    const req = createMockRequest('POST', '/api/products', validProduct);
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('p1');
  });

  it('returns 201 when ADMIN creates a product', async () => {
    mockGetSession.mockResolvedValueOnce(mockAdminSession() as never);
    mockFindUnique.mockResolvedValueOnce(null as never);
    const createdProduct = { id: 'p2', ...validProduct };
    mockCreate.mockResolvedValueOnce(createdProduct as never);

    const req = createMockRequest('POST', '/api/products', validProduct);
    const res = await POST(req);

    expect(res.status).toBe(201);
  });

  it('returns 409 when reference already exists', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce({ id: 'existing', reference: 'REF-001' } as never);

    const req = createMockRequest('POST', '/api/products', validProduct);
    const res = await POST(req);

    expect(res.status).toBe(409);
  });

  it('returns 400 on Zod validation failure', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('POST', '/api/products', { nom: '', reference: '' });
    const res = await POST(req);

    expect(res.status).toBe(400);
    consoleSpy.mockRestore();
  });

  it('returns 500 when prisma.create throws', async () => {
    mockGetSession.mockResolvedValueOnce(mockDevSession() as never);
    mockFindUnique.mockResolvedValueOnce(null as never);
    mockCreate.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('POST', '/api/products', validProduct);
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});
