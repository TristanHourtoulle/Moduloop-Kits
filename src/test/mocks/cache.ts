import { vi } from 'vitest';

/**
 * Creates a mock for `@/lib/cache` module.
 */
export function createCacheMock() {
  return {
    invalidateProducts: vi.fn(),
    invalidateProduct: vi.fn(),
    invalidateKits: vi.fn(),
    invalidateKit: vi.fn(),
    CACHE_CONFIG: { PRODUCTS: { revalidate: 300 }, KITS: { revalidate: 60 } },
  };
}

/**
 * Creates a mock for `next/cache` module.
 */
export function createNextCacheMock() {
  return {
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
  };
}
