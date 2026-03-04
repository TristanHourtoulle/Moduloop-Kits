'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useZodForm } from '@/lib/forms'
import { kitSchema, type KitFormData } from '@/lib/schemas/kit'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSession } from '@/lib/auth-client'
import { logger } from '@/lib/logger'
import { Info, Package, Check } from 'lucide-react'

// Import des sections
import { KitGeneralInfoSection } from './form-sections/kit-general-info-section'
import { KitProductsSection } from './form-sections/kit-products-section'
import { KitFormActions } from './form-sections/kit-form-actions'

interface KitFormProps {
  readonly initialData?: Partial<KitFormData>
  readonly kitId?: string
}

const STEP_1_FIELDS = ['nom', 'style', 'surfaceM2'] as const

export function KitForm({ initialData, kitId }: KitFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    trigger,
  } = useZodForm(kitSchema, {
    defaultValues: {
      products: [],
    },
  })

  // Reinitialize form when data changes
  useEffect(() => {
    if (initialData) {
      reset({
        nom: initialData.nom || '',
        style: initialData.style || '',
        description: initialData.description,
        surfaceM2: initialData.surfaceM2,
        products: initialData.products || [],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitId])

  const handleNextStep = useCallback(async () => {
    const isValid = await trigger(STEP_1_FIELDS as unknown as (keyof KitFormData)[])
    if (isValid) {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [trigger])

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleReset = useCallback(() => {
    reset()
    setCurrentStep(1)
  }, [reset])

  const onSubmit = async (data: KitFormData) => {
    if (!session?.user) {
      setError('Vous devez être connecté pour créer un kit')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const groupedProducts = data.products.reduce(
        (acc, product) => {
          const existingProduct = acc.find((p) => p.productId === product.productId)
          if (existingProduct) {
            existingProduct.quantite += product.quantite
          } else {
            acc.push({ ...product })
          }
          return acc
        },
        [] as typeof data.products,
      )

      const url = kitId ? `/api/kits/${kitId}` : '/api/kits'
      const method = kitId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          products: groupedProducts,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      // Add delay to ensure cache invalidation completes on Vercel
      const isProduction =
        typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        !window.location.hostname.includes('127.0.0.1')

      if (isProduction) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      router.push('/kits?updated=' + Date.now())
    } catch (err) {
      logger.error('[KitForm] Error submitting form', { error: err })
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-0">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) handlePreviousStep()
          }}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md transition-colors ${
              currentStep >= 1
                ? 'bg-[#30C1BD] text-white shadow-[#30C1BD]/25'
                : 'bg-gray-200 text-gray-500 shadow-gray-200/25'
            }`}
          >
            {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <div className="flex items-center gap-1.5">
            <Info className={`h-4 w-4 ${currentStep >= 1 ? 'text-[#30C1BD]' : 'text-gray-400'}`} />
            <span
              className={`text-sm font-semibold ${currentStep >= 1 ? 'text-[#30C1BD]' : 'text-gray-400'}`}
            >
              Informations
            </span>
          </div>
        </button>

        {/* Connector */}
        <div
          className={`mx-4 h-px w-16 transition-colors ${
            currentStep >= 2 ? 'bg-[#30C1BD]' : 'bg-gradient-to-r from-[#30C1BD] to-gray-200'
          }`}
        />

        {/* Step 2 */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md transition-colors ${
              currentStep >= 2
                ? 'bg-[#30C1BD] text-white shadow-[#30C1BD]/25'
                : 'bg-gray-200 text-gray-500 shadow-gray-200/25'
            }`}
          >
            2
          </div>
          <div className="flex items-center gap-1.5">
            <Package
              className={`h-4 w-4 ${currentStep >= 2 ? 'text-[#30C1BD]' : 'text-gray-400'}`}
            />
            <span
              className={`text-sm font-semibold ${currentStep >= 2 ? 'text-[#30C1BD]' : 'text-gray-400'}`}
            >
              Produits
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: General Info */}
        {currentStep === 1 && <KitGeneralInfoSection control={control} errors={errors} />}

        {/* Step 2: Products */}
        {currentStep === 2 && (
          <KitProductsSection control={control} errors={errors} onError={handleError} />
        )}

        <KitFormActions
          isLoading={isLoading}
          kitId={kitId}
          onReset={handleReset}
          currentStep={currentStep}
          onNextStep={handleNextStep}
          onPreviousStep={handlePreviousStep}
        />
      </form>
    </div>
  )
}
