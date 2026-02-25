# Caching Implementation for Moduloop Kits

This document describes the caching strategy implemented for the Moduloop Kits application based on Next.js App Router best practices.

## Overview

The application implements a comprehensive caching strategy using:

- **React's `cache()` function** for server-side data fetching
- **Cache tags** for selective invalidation
- **HTTP cache headers** for CDN and browser caching
- **Suspense boundaries** for streaming and progressive loading

## Cache Architecture

### 1. Database Layer (`src/lib/db.ts`)

```typescript
import { cache } from 'react'
import 'server-only'

// Cached data fetching functions
export const getKits = cache(async () => {
  return await prisma.kit.findMany({
    include: {
      /* relations */
    },
  })
})

export const getKitById = cache(async (id: string) => {
  return await prisma.kit.findUnique({
    where: { id },
    include: {
      /* relations */
    },
  })
})

export const getProducts = cache(async () => {
  return await prisma.product.findMany({
    include: {
      /* relations */
    },
  })
})

export const getProductById = cache(async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      /* relations */
    },
  })
})
```

**Key Benefits:**

- Automatic deduplication of identical requests
- Server-side caching with React's built-in cache
- Type-safe database queries

### 2. Cache Management (`src/lib/cache.ts`)

```typescript
export const CACHE_TAGS = {
  KITS: 'kits',
  PRODUCTS: 'products',
  USERS: 'users',
} as const

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
```

**Cache Invalidation Functions:**

- `invalidateKits()` - Invalidates kit-related cache
- `invalidateProducts()` - Invalidates product-related cache
- `invalidateUsers()` - Invalidates user-related cache
- `invalidateAll()` - Invalidates all cache tags

### 3. API Routes with Caching

#### GET Requests (Read Operations)

```typescript
export async function GET(request: NextRequest) {
  // Use cached function
  const kits = await getKits()

  // Configure cache headers
  const response = NextResponse.json(kits)
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${CACHE_CONFIG.KITS.revalidate}, stale-while-revalidate=${
      CACHE_CONFIG.KITS.revalidate * 5
    }`,
  )

  return response
}
```

#### POST/PUT/DELETE Requests (Write Operations)

```typescript
export async function POST(request: NextRequest) {
  // Create/update/delete operation
  const kit = await prisma.kit.create({
    /* data */
  })

  // Invalidate related cache
  invalidateKits()

  return NextResponse.json(kit, { status: 201 })
}
```

## Page-Level Implementation

### 1. Server Components with Suspense

```typescript
// src/app/(dashboard)/kits/page.tsx
export default function KitsPage() {
  // Preload data for better performance
  preloadKits();

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-gray-50 p-6 w-full">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<KitsGridSkeleton />}>
            <KitsGrid />
          </Suspense>
        </div>
      </div>
    </RoleGuard>
  );
}
```

### 2. Loading States

```typescript
// src/app/(dashboard)/kits/loading.tsx
export default function KitsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      {/* Skeleton loading UI */}
    </div>
  );
}
```

## Cache Headers Strategy

### Browser Cache (s-maxage)

- **Kits**: 60 seconds (frequently updated)
- **Products**: 300 seconds (less frequently updated)
- **Users**: 600 seconds (rarely updated)

### Stale-While-Revalidate

- **Kits**: 300 seconds (5x s-maxage)
- **Products**: 600 seconds (2x s-maxage)
- **Users**: 3600 seconds (6x s-maxage)

## Performance Benefits

1. **Reduced Database Load**: Identical requests are served from cache
2. **Faster Page Loads**: Data is preloaded and cached
3. **Better UX**: Progressive loading with Suspense boundaries
4. **CDN Optimization**: Proper cache headers for edge caching
5. **Selective Invalidation**: Only relevant cache is cleared on updates

## Cache Invalidation Triggers

- **Kit Creation/Update/Deletion** → `invalidateKits()`
- **Product Creation/Update/Deletion** → `invalidateProducts()`
- **User Profile Updates** → `invalidateUsers()`

## Best Practices

1. **Always use cached functions** for read operations
2. **Invalidate cache immediately** after write operations
3. **Use appropriate cache durations** based on data volatility
4. **Implement loading states** with Suspense boundaries
5. **Preload critical data** when possible

## Monitoring and Debugging

### Cache Hit/Miss Monitoring

```typescript
// Add to your logging system
console.log(`Cache ${cacheHit ? 'HIT' : 'MISS'} for ${operation}`)
```

### Cache Invalidation Logging

```typescript
// Log cache invalidations
console.log(`Invalidating cache for: ${cacheTag}`)
```

## Future Enhancements

1. **Redis Integration**: For distributed caching across multiple instances
2. **Cache Warming**: Pre-populate cache with frequently accessed data
3. **Analytics**: Track cache performance and hit rates
4. **Adaptive TTL**: Dynamic cache duration based on access patterns

## Troubleshooting

### Common Issues

1. **Stale Data**: Ensure cache invalidation is called after mutations
2. **Memory Leaks**: Monitor cache size in development
3. **Cache Conflicts**: Use unique cache tags for different data types

### Debug Commands

```bash
# Clear all cache (development only)
npm run dev -- --clear-cache

# Monitor cache performance
npm run build && npm start
```

This caching implementation provides a robust foundation for scalable data management while maintaining excellent user experience through progressive loading and intelligent cache invalidation.
