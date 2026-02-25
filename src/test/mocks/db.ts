import { vi } from 'vitest';

/**
 * Creates a mock for `@/lib/db` module with all exported functions and prisma client.
 * Override specific prisma models by passing them in the prismaOverrides parameter.
 */
export function createDbMock(prismaOverrides: Record<string, unknown> = {}) {
  return {
    prisma: {
      user: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
      product: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      kit: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      kitProduct: { deleteMany: vi.fn() },
      project: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      projectKit: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
      ...prismaOverrides,
    },
    getProductById: vi.fn(),
    getKitById: vi.fn(),
    getKits: vi.fn(),
    getProducts: vi.fn(),
    getProjects: vi.fn(),
    createProject: vi.fn(),
  };
}
