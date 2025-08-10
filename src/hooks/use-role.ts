"use client";

import { useSession } from "@/lib/auth-client";
import { UserRole, type RolePermissions } from "@/lib/types/user";
import {
  hasRole,
  hasPermission,
  canAccessResource,
  getRolePermissions,
} from "@/lib/utils/roles";

export function useRole() {
  const { data: session } = useSession();

  const userRole =
    (session?.user as { role?: UserRole })?.role || UserRole.USER;

  // Debug logs
  console.log("🔵 useRole - Session:", session);
  console.log("🔵 useRole - User:", session?.user);
  console.log(
    "🔵 useRole - Raw role:",
    (session?.user as { role?: UserRole })?.role
  );
  console.log("🔵 useRole - Computed role:", userRole);

  return {
    role: userRole,
    permissions: getRolePermissions(userRole),
    hasRole: (requiredRole: UserRole) => hasRole(userRole, requiredRole),
    hasPermission: (permission: keyof RolePermissions) =>
      hasPermission(userRole, permission),
    canAccessResource: (resource: "admin" | "kits" | "products" | "users") =>
      canAccessResource(userRole, resource),
    isUser: userRole === UserRole.USER,
    isDev: userRole === UserRole.DEV,
    isAdmin: userRole === UserRole.ADMIN,
    isDevOrAdmin: userRole === UserRole.DEV || userRole === UserRole.ADMIN,
  };
}
