export enum UserRole {
  USER = 'USER',
  DEV = 'DEV',
  ADMIN = 'ADMIN',
}

export interface UserWithRole {
  id: string
  name?: string | null
  email: string
  emailVerified: boolean
  image?: string | null
  firstName?: string | null
  lastName?: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface RolePermissions {
  canAccessAdminPanel: boolean
  canManageUsers: boolean
  canManageKits: boolean
  canManageProducts: boolean
  canDeleteContent: boolean
  canModifySystem: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.USER]: {
    canAccessAdminPanel: false,
    canManageUsers: false,
    canManageKits: false,
    canManageProducts: false,
    canDeleteContent: false,
    canModifySystem: false,
  },
  [UserRole.DEV]: {
    canAccessAdminPanel: true,
    canManageUsers: true,
    canManageKits: true,
    canManageProducts: true,
    canDeleteContent: true,
    canModifySystem: true,
  },
  [UserRole.ADMIN]: {
    canAccessAdminPanel: true,
    canManageUsers: true,
    canManageKits: true,
    canManageProducts: true,
    canDeleteContent: true,
    canModifySystem: true,
  },
}
