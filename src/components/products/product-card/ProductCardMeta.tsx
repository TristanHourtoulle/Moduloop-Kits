'use client'

import { Calendar, Clock } from 'lucide-react'
import { SafeAvatar } from '@/components/ui/safe-avatar'
import { cn } from '@/lib/utils'
import { type User } from '@/lib/types/project'

interface ProductCardMetaProps {
  createdAt: string
  updatedAt: string
  createdBy?: User | null
  surfaceM2?: number | null
  className?: string
}

export function ProductCardMeta({
  createdAt,
  updatedAt,
  createdBy,
  className,
}: ProductCardMetaProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const isRecentlyUpdated = () => {
    const created = new Date(createdAt)
    const updated = new Date(updatedAt)
    const diffInHours =
      (updated.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffInHours > 1 // Considéré comme modifié si plus d'1h de différence
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Creator Info */}
      {createdBy && createdBy.name && (
        <div className="flex items-center gap-3">
          <SafeAvatar name={createdBy.name} className="w-8 h-8" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {createdBy.name}
            </p>
            <p className="text-xs text-muted-foreground">Créateur</p>
          </div>
        </div>
      )}

      {/* Dates and Surface */}
      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        {/* Creation Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <div>
            <p className="font-medium">Créé le</p>
            <p>{formatDate(createdAt)}</p>
          </div>
        </div>

        {/* Modified Date - only show if different from creation */}
        {isRecentlyUpdated() && (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <div>
              <p className="font-medium">Modifié le</p>
              <p>{formatDate(updatedAt)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
