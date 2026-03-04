'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Save, RotateCcw, X, ArrowRight, ArrowLeft } from 'lucide-react'

interface KitFormActionsProps {
  isLoading: boolean
  kitId?: string
  onReset: () => void
  currentStep: number
  onNextStep: () => void
  onPreviousStep: () => void
}

export function KitFormActions({
  isLoading,
  kitId,
  onReset,
  currentStep,
  onNextStep,
  onPreviousStep,
}: KitFormActionsProps) {
  const router = useRouter()

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isLoading}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
            Annuler
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {currentStep === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={onPreviousStep}
              disabled={isLoading}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>
          )}

          {currentStep === 1 && (
            <Button
              type="button"
              onClick={onNextStep}
              className="gap-2 bg-[#30C1BD] px-6 text-white shadow-lg shadow-[#30C1BD]/25 hover:bg-[#30C1BD]/80"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {currentStep === 2 && (
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="kit-submit"
              className="gap-2 bg-[#30C1BD] px-6 text-white shadow-lg shadow-[#30C1BD]/25 hover:bg-[#30C1BD]/80"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {kitId ? 'Mettre à jour le kit' : 'Créer le kit'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
