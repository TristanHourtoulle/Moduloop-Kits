import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@/test/register-api-mocks';

vi.mock('@/lib/cache', async () => {
  const { createCacheMock } = await import('@/test/mocks/cache');
  return createCacheMock();
});

import { prisma, getKitById } from '@/lib/db';
import { GET, PUT, DELETE } from './route';
import {
  createMockRequest,
  mockAuthNone,
  mockAuthAsUser,
  mockAuthAsDev,
  mockAuthAsAdmin,
} from '@/test/api-helpers';

const mockGetKitById = vi.mocked(getKitById);
const mockKitFindUnique = vi.mocked(prisma.kit.findUnique);
const mockKitDelete = vi.mocked(prisma.kit.delete);
const mockProductFindMany = vi.mocked(prisma.product.findMany);
const mockTransaction = vi.mocked(prisma.$transaction);

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/kits/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuthNone();
    const req = createMockRequest('GET', '/api/kits/k1');
    const res = await GET(req, makeParams('k1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when kit not found', async () => {
    mockAuthAsUser();
    mockGetKitById.mockResolvedValueOnce(null as never);

    const req = createMockRequest('GET', '/api/kits/nonexistent');
    const res = await GET(req, makeParams('nonexistent'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with kit', async () => {
    mockAuthAsUser();
    const kit = { id: 'k1', nom: 'Kit 1' };
    mockGetKitById.mockResolvedValueOnce(kit as never);

    const req = createMockRequest('GET', '/api/kits/k1');
    const res = await GET(req, makeParams('k1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe('k1');
  });

  it('returns 500 when getKitById throws', async () => {
    mockAuthAsUser();
    mockGetKitById.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('GET', '/api/kits/k1');
    const res = await GET(req, makeParams('k1'));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});

describe('PUT /api/kits/[id]', () => {
  const updateData = {
    nom: 'Updated Kit',
    style: 'modern',
    products: [{ productId: 'p1', quantite: 3 }],
  };

  it('returns 401 when unauthenticated', async () => {
    mockAuthNone();
    const req = createMockRequest('PUT', '/api/kits/k1', updateData);
    const res = await PUT(req, makeParams('k1'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockAuthAsUser();
    const req = createMockRequest('PUT', '/api/kits/k1', updateData);
    const res = await PUT(req, makeParams('k1'));
    expect(res.status).toBe(403);
  });

  it('returns 404 when kit not found', async () => {
    mockAuthAsDev();
    mockKitFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('PUT', '/api/kits/k1', updateData);
    const res = await PUT(req, makeParams('k1'));
    expect(res.status).toBe(404);
  });

  it('returns 400 when product validation fails', async () => {
    mockAuthAsDev();
    mockKitFindUnique.mockResolvedValueOnce({ id: 'k1', kitProducts: [] } as never);
    mockProductFindMany.mockResolvedValueOnce([] as never);

    const req = createMockRequest('PUT', '/api/kits/k1', updateData);
    const res = await PUT(req, makeParams('k1'));
    expect(res.status).toBe(400);
  });

  it('returns 200 with updated kit via transaction', async () => {
    mockAuthAsDev();
    mockKitFindUnique.mockResolvedValueOnce({ id: 'k1', kitProducts: [] } as never);
    mockProductFindMany.mockResolvedValueOnce([{ id: 'p1' }] as never);
    const updatedKit = { id: 'k1', nom: 'Updated Kit' };
    mockTransaction.mockImplementationOnce(async (fn) => {
      if (typeof fn === 'function') {
        return fn({
          kitProduct: { deleteMany: vi.fn().mockResolvedValue({}) },
          kit: { update: vi.fn().mockResolvedValue(updatedKit) },
        } as never);
      }
      return updatedKit;
    });

    const req = createMockRequest('PUT', '/api/kits/k1', updateData);
    const res = await PUT(req, makeParams('k1'));

    expect(res.status).toBe(200);
  });

  it('returns 200 when ADMIN updates a kit', async () => {
    mockAuthAsAdmin();
    mockKitFindUnique.mockResolvedValueOnce({ id: 'k1', kitProducts: [] } as never);
    mockProductFindMany.mockResolvedValueOnce([{ id: 'p1' }] as never);
    const updatedKit = { id: 'k1', nom: 'Admin Updated Kit' };
    mockTransaction.mockImplementationOnce(async (fn) => {
      if (typeof fn === 'function') {
        return fn({
          kitProduct: { deleteMany: vi.fn().mockResolvedValue({}) },
          kit: { update: vi.fn().mockResolvedValue(updatedKit) },
        } as never);
      }
      return updatedKit;
    });

    const req = createMockRequest('PUT', '/api/kits/k1', updateData);
    const res = await PUT(req, makeParams('k1'));

    expect(res.status).toBe(200);
  });

  it('returns 400 on Zod failure', async () => {
    mockAuthAsDev();
    mockKitFindUnique.mockResolvedValueOnce({ id: 'k1', kitProducts: [] } as never);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('PUT', '/api/kits/k1', { nom: '', style: '', products: [] });
    const res = await PUT(req, makeParams('k1'));
    expect(res.status).toBe(400);
    consoleSpy.mockRestore();
  });
});

describe('DELETE /api/kits/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuthNone();
    const req = createMockRequest('DELETE', '/api/kits/k1');
    const res = await DELETE(req, makeParams('k1'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is USER', async () => {
    mockAuthAsUser();
    const req = createMockRequest('DELETE', '/api/kits/k1');
    const res = await DELETE(req, makeParams('k1'));
    expect(res.status).toBe(403);
  });

  it('returns 404 when kit not found', async () => {
    mockAuthAsDev();
    mockKitFindUnique.mockResolvedValueOnce(null as never);

    const req = createMockRequest('DELETE', '/api/kits/k1');
    const res = await DELETE(req, makeParams('k1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with success message', async () => {
    mockAuthAsDev();
    mockKitFindUnique.mockResolvedValueOnce({ id: 'k1' } as never);
    mockKitDelete.mockResolvedValueOnce({} as never);

    const req = createMockRequest('DELETE', '/api/kits/k1');
    const res = await DELETE(req, makeParams('k1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBeDefined();
  });

  it('returns 200 when ADMIN deletes a kit', async () => {
    mockAuthAsAdmin();
    mockKitFindUnique.mockResolvedValueOnce({ id: 'k1' } as never);
    mockKitDelete.mockResolvedValueOnce({} as never);

    const req = createMockRequest('DELETE', '/api/kits/k1');
    const res = await DELETE(req, makeParams('k1'));

    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    mockAuthAsDev();
    mockKitFindUnique.mockResolvedValueOnce({ id: 'k1' } as never);
    mockKitDelete.mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = createMockRequest('DELETE', '/api/kits/k1');
    const res = await DELETE(req, makeParams('k1'));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});
