'use client'

import { useRole } from '@/hooks/use-role'
import { UserRole, type RolePermissions } from '@/lib/types/user'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: string
  resource?: 'admin' | 'kits' | 'products' | 'users'
  fallback?: React.ReactNode
  showAlert?: boolean
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  resource,
  fallback,
  showAlert = true,
}: RoleGuardProps) {
  const { hasRole, hasPermission, canAccessResource } = useRole()

  let hasAccess = true

  // Vérifier le rôle requis
  if (requiredRole) {
    hasAccess = hasRole(requiredRole)
  }

  // Vérifier la permission requise
  if (requiredPermission && hasAccess) {
    hasAccess = hasPermission(requiredPermission as keyof RolePermissions)
  }

  // Vérifier l'accès à la ressource
  if (resource && hasAccess) {
    hasAccess = canAccessResource(resource)
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showAlert) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette section.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}
