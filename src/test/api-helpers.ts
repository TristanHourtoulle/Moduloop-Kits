import { NextRequest } from 'next/server';
import { UserRole } from '@/lib/types/user';

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
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  // Cast needed: NextRequest constructor expects NextRequestInit which extends
  // RequestInit with Next.js-specific fields (geo, ip, nextUrl). Standard
  // RequestInit is sufficient for testing but the types don't overlap exactly.
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as ConstructorParameters<typeof NextRequest>[1]);
}

interface MockSessionOverrides {
  id?: string;
  email?: string;
  name?: string;
  role?: UserRole;
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
  };
}

export function mockAdminSession() {
  return makeMockSession({ id: 'admin-123', role: UserRole.ADMIN });
}

export function mockDevSession() {
  return makeMockSession({ id: 'dev-123', role: UserRole.DEV });
}

export function mockUserSession() {
  return makeMockSession({ id: 'user-123', role: UserRole.USER });
}
