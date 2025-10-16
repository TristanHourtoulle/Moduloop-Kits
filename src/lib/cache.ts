import { revalidateTag, revalidatePath } from "next/cache";

// Cache tags for different data types
export const CACHE_TAGS = {
  KITS: "kits",
  PRODUCTS: "products",
  USERS: "users",
} as const;

// Cache invalidation functions
export function invalidateKits() {
  console.log("[Cache] Invalidating all kits cache");
  revalidateTag(CACHE_TAGS.KITS);
  // Also revalidate all kit-related paths
  revalidatePath("/kits", "page");
  revalidatePath("/kits/[id]/modifier", "page");
  console.log("[Cache] Kits cache invalidated successfully");
}

export function invalidateKit(kitId: string) {
  console.log("[Cache] Invalidating cache for kit:", kitId);
  revalidateTag(CACHE_TAGS.KITS);
  // Revalidate specific kit pages
  revalidatePath("/kits", "page");
  revalidatePath(`/kits/${kitId}/modifier`, "page");
  console.log("[Cache] Kit cache invalidated successfully:", kitId);
}

export function invalidateProducts() {
  revalidateTag(CACHE_TAGS.PRODUCTS);
  // Also revalidate all product-related paths
  revalidatePath("/products", "page");
}

export function invalidateProduct(productId: string) {
  revalidateTag(CACHE_TAGS.PRODUCTS);
  // Revalidate specific product pages
  revalidatePath("/products", "page");
  revalidatePath(`/products/${productId}/modifier`, "page");
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
