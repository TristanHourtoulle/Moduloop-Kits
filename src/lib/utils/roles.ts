import { UserRole, ROLE_PERMISSIONS, type RolePermissions } from '@/lib/types/user'

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.DEV]: 1,
    [UserRole.ADMIN]: 2,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Obtient les permissions pour un rôle donné
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role]
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(userRole)
  return permissions[permission]
}

/**
 * Vérifie si un utilisateur peut accéder à une ressource
 */
export function canAccessResource(
  userRole: UserRole,
  resource: 'admin' | 'kits' | 'products' | 'users',
): boolean {
  switch (resource) {
    case 'admin':
      return hasPermission(userRole, 'canAccessAdminPanel')
    case 'kits':
      return hasPermission(userRole, 'canManageKits')
    case 'products':
      return hasPermission(userRole, 'canManageProducts')
    case 'users':
      return hasPermission(userRole, 'canManageUsers')
    default:
      return false
  }
}

/**
 * Checks if the user has an elevated role (DEV or ADMIN).
 */
export function isAdminOrDev(role: UserRole): boolean {
  return hasRole(role, UserRole.DEV)
}

/**
 * Obtient le label français d'un rôle
 */
export function getRoleLabel(role: UserRole): string {
  const labels = {
    [UserRole.USER]: 'Utilisateur',
    [UserRole.DEV]: 'Développeur',
    [UserRole.ADMIN]: 'Administrateur',
  }

  return labels[role]
}

/**
 * Obtient la couleur d'un badge de rôle
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors = {
    [UserRole.USER]: 'bg-gray-100 text-gray-600',
    [UserRole.DEV]: 'bg-blue-100 text-blue-600',
    [UserRole.ADMIN]: 'bg-red-100 text-red-600',
  }

  return colors[role]
}
