import { revalidateTag } from "next/cache";

// Cache tags for different data types
export const CACHE_TAGS = {
  KITS: "kits",
  PRODUCTS: "products",
  USERS: "users",
} as const;

// Cache invalidation functions
export function invalidateKits() {
  revalidateTag(CACHE_TAGS.KITS);
}

export function invalidateProducts() {
  revalidateTag(CACHE_TAGS.PRODUCTS);
}

export function invalidateUsers() {
  revalidateTag(CACHE_TAGS.USERS);
}

export function invalidateAll() {
  Object.values(CACHE_TAGS).forEach(revalidateTag);
}

// Cache configuration
export const CACHE_CONFIG = {
  KITS: {
    revalidate: 60, // 1 minute
    tags: [CACHE_TAGS.KITS],
  },
  PRODUCTS: {
    revalidate: 300, // 5 minutes
    tags: [CACHE_TAGS.PRODUCTS],
  },
  USERS: {
    revalidate: 600, // 10 minutes
    tags: [CACHE_TAGS.USERS],
  },
} as const;
