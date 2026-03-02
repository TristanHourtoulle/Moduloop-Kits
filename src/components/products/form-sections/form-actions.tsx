'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface FormActionsProps {
  isLoading: boolean
  productId?: string
  onReset: () => void
}

export function FormActions({ isLoading, productId, onReset }: FormActionsProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col justify-end gap-4 border-t pt-6 sm:flex-row">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={isLoading}
        className="order-3 sm:order-1"
      >
        Annuler
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isLoading}
        className="order-2"
      >
        Réinitialiser
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        data-testid="product-submit"
        className="order-1 cursor-pointer bg-[#30C1BD] text-white hover:bg-[#30C1BD]/80 sm:order-3"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {productId ? 'Mettre à jour' : 'Créer le produit'}
      </Button>
    </div>
  )
}
