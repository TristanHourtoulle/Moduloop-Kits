import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@/lib/types/user'
import { logger } from '@/lib/logger'

/**
 * Authenticated user returned by requireAuth / requireRole.
 * Contains the session user fields plus the authoritative role from the DB.
 */
export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  image?: string | null
  role: UserRole
}

type AuthSuccess = { user: AuthenticatedUser; response?: never }
type AuthFailure = { user?: never; response: NextResponse }
type AuthResult = AuthSuccess | AuthFailure

/**
 * Validates the session from the incoming request and resolves the user role
 * from the database to avoid stale session data.
 *
 * Standardises on `auth.api.getSession(request)` as the single calling
 * convention -- callers must always pass the raw Request object.
 */
export async function requireAuth(request: Request): Promise<AuthResult> {
  const session = await auth.api.getSession(request)

  if (!session?.user?.id) {
    return {
      response: NextResponse.json(
        { error: { code: 'AUTH_NOT_AUTHENTICATED', message: 'Not authenticated' } },
        { status: 401 },
      ),
    }
  }

  // Always resolve role from DB to avoid relying on stale session data
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const role = (dbUser?.role as UserRole | undefined) ?? UserRole.USER

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role,
    },
  }
}

/**
 * Combines authentication and role verification in a single call.
 * Returns the authenticated user when the role matches, or a 403 response.
 */
export async function requireRole(request: Request, roles: UserRole[]): Promise<AuthResult> {
  const result = await requireAuth(request)

  if (result.response) {
    return result
  }

  if (!roles.includes(result.user.role)) {
    return {
      response: NextResponse.json(
        { error: { code: 'AUTH_FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 },
      ),
    }
  }

  return result
}

/**
 * Centralised error handler for API route catch blocks.
 * Handles ZodError validation failures and generic errors with a consistent
 * JSON shape: `{ error: string, details?: unknown }`.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'VAL_INVALID_INPUT', message: 'Validation failed', details: error.issues } },
      { status: 400 },
    )
  }

  logger.error('Unhandled API error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })

  return NextResponse.json(
    { error: { code: 'SYS_INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 },
  )
}

interface CacheHeaderOptions {
  /** Cache strategy: "public" uses s-maxage + stale-while-revalidate, "none" disables cache. */
  strategy: 'public' | 'none'
  /**
   * Revalidation time in seconds (used with "public" strategy).
   * Defaults to 60.
   */
  revalidate?: number
  /**
   * Multiplier for stale-while-revalidate relative to revalidate.
   * Defaults to 2.
   */
  staleMultiplier?: number
}

/**
 * Sets cache-control headers on a NextResponse.
 *
 * In production with strategy "none", sets no-cache headers (Vercel edge
 * cache busting). In development, always uses the public strategy unless
 * explicitly set to "none".
 *
 * When called without options, applies the "noCache in production, public in
 * dev" pattern that was duplicated across routes.
 */
export function setCacheHeaders(
  response: NextResponse,
  options?: CacheHeaderOptions,
): NextResponse {
  const strategy = options?.strategy ?? 'none'
  const revalidate = options?.revalidate ?? 60
  const staleMultiplier = options?.staleMultiplier ?? 2

  if (strategy === 'none' || process.env.NODE_ENV === 'production') {
    if (strategy === 'none') {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }
  }

  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * staleMultiplier}`,
  )

  return response
}

/**
 * Convenience: sets the "no-cache in production, public cache in dev" pattern
 * used by individual resource endpoints (product/[id], kit/[id]).
 */
export function setResourceCacheHeaders(
  response: NextResponse,
  cacheConfig: { revalidate: number },
  staleMultiplier = 2,
): NextResponse {
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  } else {
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${cacheConfig.revalidate}, stale-while-revalidate=${cacheConfig.revalidate * staleMultiplier}`,
    )
  }

  return response
}

/**
 * Convenience: sets the public list cache headers used by collection endpoints
 * (GET /products, GET /kits).
 */
export function setListCacheHeaders(
  response: NextResponse,
  cacheConfig: { revalidate: number },
  staleMultiplier = 2,
): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${cacheConfig.revalidate}, stale-while-revalidate=${cacheConfig.revalidate * staleMultiplier}`,
  )
  return response
}
