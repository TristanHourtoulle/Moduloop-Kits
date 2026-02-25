'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { cn } from '@/lib/utils'

interface ProductCardActionsProps {
  productName: string
  onEdit: () => void
  onDelete: () => void | Promise<void>
  className?: string
}

export function ProductCardActions({
  productName,
  onEdit,
  onDelete,
  className,
}: ProductCardActionsProps) {
  return (
    <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
      <div
        className={cn(
          'flex justify-end gap-2 pt-4 border-t border-border/50',
          className,
        )}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="h-8 px-3 border-primary/30 bg-white/80 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
          title="Modifier le produit"
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Modifier
        </Button>
        <DeleteConfirmDialog
          title="Supprimer le produit ?"
          itemName={productName}
          description="Ce produit sera supprimé de tous les kits et projets associés."
          onConfirm={onDelete}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="h-8 px-3 border-red-200 bg-white/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
            title="Supprimer le produit"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Supprimer
          </Button>
        </DeleteConfirmDialog>
      </div>
    </RoleGuard>
  )
}
