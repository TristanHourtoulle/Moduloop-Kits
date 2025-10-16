import { revalidateTag, revalidatePath } from "next/cache";

// Cache tags for different data types
export const CACHE_TAGS = {
  KITS: "kits",
  PRODUCTS: "products",
  USERS: "users",
} as const;

// Cache invalidation functions
export async function invalidateKits() {
  console.log("[Cache] Invalidating all kits cache");
  revalidateTag(CACHE_TAGS.KITS);
  // Also revalidate all kit-related paths
  revalidatePath("/kits", "page");
  revalidatePath("/kits", "layout");
  revalidatePath("/kits/[id]/modifier", "page");
  revalidatePath("/kits/[id]/modifier", "layout");

  // On Vercel, add a delay to ensure cache propagation
  if (process.env.NODE_ENV === "production") {
    // Increased delay to ensure Vercel cache is fully invalidated
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("[Cache] Kits cache invalidated successfully");
}

export async function invalidateKit(kitId: string) {
  console.log("[Cache] Invalidating cache for kit:", kitId);

  // Revalidate tag first
  revalidateTag(CACHE_TAGS.KITS);

  // Revalidate all possible paths for this kit
  revalidatePath("/kits", "page");
  revalidatePath("/kits", "layout");
  revalidatePath(`/kits/${kitId}/modifier`, "page");
  revalidatePath(`/kits/${kitId}/modifier`, "layout");

  // On Vercel, also try with the exact path (not template)
  if (process.env.NODE_ENV === "production") {
    revalidatePath(`/kits/${kitId}/modifier`);
    // Increased delay to ensure Vercel propagates the invalidation
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

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
