import { NextRequest } from 'next/server'
import { vi } from 'vitest'
import { UserRole } from '@/lib/types/user'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * Builds a NextRequest suitable for route handler integration tests.
 *
 * @param method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param url - Request URL path (e.g., '/api/products')
 * @param body - Optional JSON body for non-GET requests
 * @param headers - Optional additional headers
 * @returns NextRequest instance ready for route handler invocation
 */
export function createMockRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }
  // Cast needed: NextRequest constructor expects NextRequestInit which extends
  // RequestInit with Next.js-specific fields (geo, ip, nextUrl). Standard
  // RequestInit is sufficient for testing but the types don't overlap exactly.
  return new NextRequest(
    new URL(url, 'http://localhost:3000'),
    init as ConstructorParameters<typeof NextRequest>[1],
  )
}

interface MockSessionOverrides {
  id?: string
  email?: string
  name?: string
  role?: UserRole
}

/**
 * Returns a mock Better Auth session object matching the shape
 * expected by all API route handlers.
 */
export function makeMockSession(overrides: MockSessionOverrides = {}) {
  return {
    user: {
      id: overrides.id ?? 'user-123',
      email: overrides.email ?? 'user@example.com',
      name: overrides.name ?? 'Test User',
      role: overrides.role ?? UserRole.USER,
    },
    session: { id: 'session-123' },
  }
}

export function mockAdminSession() {
  return makeMockSession({ id: 'admin-123', role: UserRole.ADMIN })
}

export function mockDevSession() {
  return makeMockSession({ id: 'dev-123', role: UserRole.DEV })
}

export function mockUserSession() {
  return makeMockSession({ id: 'user-123', role: UserRole.USER })
}

/**
 * Mocks both auth.api.getSession and prisma.user.findUnique (role lookup)
 * to simulate the full requireAuth / requireRole middleware flow.
 *
 * Pass `null` to simulate an unauthenticated request.
 */
export function mockAuthSession(
  session: ReturnType<typeof makeMockSession> | null,
) {
  const mockGetSession = vi.mocked(auth.api.getSession)
  if (!session) {
    mockGetSession.mockResolvedValueOnce(null as never)
    return
  }
  mockGetSession.mockResolvedValueOnce(session as never)
  vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
    role: session.user.role,
  } as never)
}

export function mockAuthAsAdmin() {
  mockAuthSession(mockAdminSession())
}

export function mockAuthAsDev() {
  mockAuthSession(mockDevSession())
}

export function mockAuthAsUser() {
  mockAuthSession(mockUserSession())
}

export function mockAuthNone() {
  mockAuthSession(null)
}
