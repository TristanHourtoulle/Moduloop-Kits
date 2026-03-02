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
      <div className={cn('border-border/50 flex justify-end gap-2 border-t pt-4', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary h-8 bg-white/80 px-3 transition-all"
          title="Modifier le produit"
        >
          <Edit className="mr-1.5 h-3.5 w-3.5" />
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
            className="h-8 border-red-200 bg-white/80 px-3 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            title="Supprimer le produit"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Supprimer
          </Button>
        </DeleteConfirmDialog>
      </div>
    </RoleGuard>
  )
}
