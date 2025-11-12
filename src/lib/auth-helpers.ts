import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current user session in a Server Component
 * @returns The session object or null if not authenticated
 */
export async function getUserSession() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    return session;
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

/**
 * Get the current user ID from the session
 * @returns The user ID or null if not authenticated
 */
export async function getCurrentUserId() {
  const session = await getUserSession();
  return session?.user?.id || null;
}

/**
 * Require authentication - throws if not authenticated
 * Use this in Server Components that require auth
 */
export async function requireAuth() {
  const session = await getUserSession();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  return session;
}
