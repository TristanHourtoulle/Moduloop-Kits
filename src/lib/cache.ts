import { revalidateTag, revalidatePath } from 'next/cache'

// Cache tags for different data types
export const CACHE_TAGS = {
  KITS: 'kits',
  PRODUCTS: 'products',
  USERS: 'users',
} as const

// Cache invalidation functions
export function invalidateKits() {
  revalidateTag(CACHE_TAGS.KITS, 'max')
  revalidatePath('/kits', 'page')
  revalidatePath('/kits', 'layout')
  revalidatePath('/kits/[id]/modifier', 'page')
  revalidatePath('/kits/[id]/modifier', 'layout')
}

export function invalidateKit(kitId: string) {
  revalidateTag(CACHE_TAGS.KITS, 'max')
  revalidatePath('/kits', 'page')
  revalidatePath('/kits', 'layout')
  revalidatePath(`/kits/${kitId}/modifier`, 'page')
  revalidatePath(`/kits/${kitId}/modifier`, 'layout')

  if (process.env.NODE_ENV === 'production') {
    revalidatePath(`/kits/${kitId}/modifier`)
  }
}

export function invalidateProducts() {
  revalidateTag(CACHE_TAGS.PRODUCTS, 'max')
  revalidatePath('/products', 'page')
  revalidatePath('/products', 'layout')
  revalidatePath('/products/[id]/modifier', 'page')
  revalidatePath('/products/[id]/modifier', 'layout')
}

export function invalidateProduct(productId: string) {
  revalidateTag(CACHE_TAGS.PRODUCTS, 'max')
  revalidatePath('/products', 'page')
  revalidatePath('/products', 'layout')
  revalidatePath(`/products/${productId}/modifier`, 'page')
  revalidatePath(`/products/${productId}/modifier`, 'layout')

  if (process.env.NODE_ENV === 'production') {
    revalidatePath(`/products/${productId}/modifier`)
  }
}

export function invalidateUsers() {
  revalidateTag(CACHE_TAGS.USERS, 'max')
}

export function invalidateAll() {
  Object.values(CACHE_TAGS).forEach((tag) => revalidateTag(tag, 'max'))
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
} as const
