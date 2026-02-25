'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteConfirmDialogProps {
  title?: string
  description?: string
  itemName?: string
  onConfirm: () => void | Promise<void>
  children?: React.ReactNode
  triggerClassName?: string
  triggerVariant?: 'ghost' | 'outline' | 'destructive' | 'default'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
}

export function DeleteConfirmDialog({
  title = 'Êtes-vous sûr ?',
  description,
  itemName,
  onConfirm,
  children,
  triggerClassName,
  triggerVariant = 'ghost',
  triggerSize = 'icon',
  showIcon = true,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultDescription = itemName
    ? `Cette action est irréversible. Êtes-vous sûr de vouloir supprimer "${itemName}" ?`
    : 'Cette action est irréversible. Les données supprimées ne pourront pas être récupérées.'

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            type="button"
            variant={triggerVariant}
            size={triggerSize}
            className={cn(
              'text-red-600 hover:text-red-700 hover:bg-red-50',
              triggerClassName,
            )}
          >
            {showIcon && <Trash2 className="h-4 w-4" />}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={isDeleting} className="mt-0">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <span className="mr-2">Suppression...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
