import { UserRole } from '@/lib/types/user'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/utils/roles'
import { Badge } from '@/components/ui/badge'
import { Crown, Code } from 'lucide-react'

interface RoleBadgeProps {
  role: UserRole
  showIcon?: boolean
  className?: string
}

export function RoleBadge({ role, showIcon = true, className }: RoleBadgeProps) {
  // Ne pas afficher le badge pour le rôle USER (par défaut)
  if (role === UserRole.USER) {
    return null
  }

  const label = getRoleLabel(role)
  const colorClass = getRoleBadgeColor(role)

  const getIcon = () => {
    switch (role) {
      case UserRole.ADMIN:
        return <Crown className="mr-1 h-3 w-3" />
      case UserRole.DEV:
        return <Code className="mr-1 h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Badge className={`${colorClass} ${className}`} variant="secondary">
      {showIcon && getIcon()}
      {label}
    </Badge>
  )
}
