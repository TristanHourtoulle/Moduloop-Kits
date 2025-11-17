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
  revalidateTag(CACHE_TAGS.KITS, 'max');
  // Also revalidate all kit-related paths
  revalidatePath("/kits", "page");
  revalidatePath("/kits", "layout");
  revalidatePath("/kits/[id]/modifier", "page");
  revalidatePath("/kits/[id]/modifier", "layout");

  console.log("[Cache] Kits cache invalidated successfully");
}

export function invalidateKit(kitId: string) {
  console.log("[Cache] Invalidating cache for kit:", kitId);

  // Revalidate tag first
  revalidateTag(CACHE_TAGS.KITS, 'max');

  // Revalidate all possible paths for this kit
  revalidatePath("/kits", "page");
  revalidatePath("/kits", "layout");
  revalidatePath(`/kits/${kitId}/modifier`, "page");
  revalidatePath(`/kits/${kitId}/modifier`, "layout");

  // On Vercel, also try with the exact path (not template)
  if (process.env.NODE_ENV === "production") {
    revalidatePath(`/kits/${kitId}/modifier`);
  }

  console.log("[Cache] Kit cache invalidated successfully:", kitId);
}

export function invalidateProducts() {
  console.log("[Cache] Invalidating all products cache");
  revalidateTag(CACHE_TAGS.PRODUCTS, 'max');
  // Also revalidate all product-related paths
  revalidatePath("/products", "page");
  revalidatePath("/products", "layout");
  revalidatePath("/products/[id]/modifier", "page");
  revalidatePath("/products/[id]/modifier", "layout");

  console.log("[Cache] Products cache invalidated successfully");
}

export function invalidateProduct(productId: string) {
  console.log("[Cache] Invalidating cache for product:", productId);

  // Revalidate tag first
  revalidateTag(CACHE_TAGS.PRODUCTS, 'max');

  // Revalidate all possible paths for this product
  revalidatePath("/products", "page");
  revalidatePath("/products", "layout");
  revalidatePath(`/products/${productId}/modifier`, "page");
  revalidatePath(`/products/${productId}/modifier`, "layout");

  // On Vercel, also try with the exact path (not template)
  if (process.env.NODE_ENV === "production") {
    revalidatePath(`/products/${productId}/modifier`);
  }

  console.log("[Cache] Product cache invalidated successfully:", productId);
}

export function invalidateUsers() {
  revalidateTag(CACHE_TAGS.USERS, 'max');
}

export function invalidateAll() {
  Object.values(CACHE_TAGS).forEach(tag => revalidateTag(tag, 'max'));
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
