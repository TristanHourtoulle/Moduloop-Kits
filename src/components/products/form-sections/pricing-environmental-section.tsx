'use client'

import { useEffect, useState } from 'react'
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Euro, Calculator, TrendingUp, Info, ShoppingCart, Home, Leaf } from 'lucide-react'
import { ProductFormData, PurchaseRentalMode } from '@/lib/schemas/product'
import { ceilPrice } from '@/lib/utils/product-helpers'

interface PricingEnvironmentalSectionProps {
  register: UseFormRegister<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: UseFormSetValue<ProductFormData>
  errors: FieldErrors<ProductFormData>
}

export function PricingEnvironmentalSection({
  register,
  watch,
  setValue,
  errors,
}: PricingEnvironmentalSectionProps) {
  const [activeMode, setActiveMode] = useState<PurchaseRentalMode>('achat')

  // Watch des valeurs pour les calculs automatiques
  const watchedValues = {
    // Achat - prix unique
    prixAchatAchat1An: watch('prixAchatAchat1An'),
    prixUnitaireAchat1An: watch('prixUnitaireAchat1An'),
    margeCoefficientAchat: watch('margeCoefficientAchat'),

    // Location - 1, 2, 3 ans
    prixAchatLocation1An: watch('prixAchatLocation1An'),
    prixAchatLocation2Ans: watch('prixAchatLocation2Ans'),
    prixAchatLocation3Ans: watch('prixAchatLocation3Ans'),
    prixUnitaireLocation1An: watch('prixUnitaireLocation1An'),
    prixUnitaireLocation2Ans: watch('prixUnitaireLocation2Ans'),
    prixUnitaireLocation3Ans: watch('prixUnitaireLocation3Ans'),
    margeCoefficientLocation: watch('margeCoefficientLocation'),
  }

  // Calcul automatique du prix unitaire basé sur la marge pour ACHAT (prix unique)
  useEffect(() => {
    if (watchedValues.margeCoefficientAchat && watchedValues.margeCoefficientAchat > 0) {
      if (watchedValues.prixAchatAchat1An && watchedValues.prixAchatAchat1An > 0) {
        // Formule: Prix de Revient / (1 - % de marge) = Prix de vente
        // Le coefficient représente directement le multiplicateur (ex: 1.25 pour 20% de marge)
        const nouveauPrixUnitaire = ceilPrice(
          watchedValues.prixAchatAchat1An * watchedValues.margeCoefficientAchat,
        )
        setValue('prixUnitaireAchat1An', nouveauPrixUnitaire)
        setValue('prixVenteAchat1An', nouveauPrixUnitaire) // Prix total = prix unitaire car pas de quantité
      }
    }
  }, [watchedValues.margeCoefficientAchat, watchedValues.prixAchatAchat1An, setValue])

  // Calcul automatique du prix unitaire basé sur la marge pour LOCATION
  useEffect(() => {
    if (watchedValues.margeCoefficientLocation && watchedValues.margeCoefficientLocation > 0) {
      if (watchedValues.prixAchatLocation1An && watchedValues.prixAchatLocation1An > 0) {
        // Formule: Prix de Revient / (1 - % de marge) = Prix de vente
        const nouveauPrixUnitaire = ceilPrice(
          watchedValues.prixAchatLocation1An * watchedValues.margeCoefficientLocation,
        )
        setValue('prixUnitaireLocation1An', nouveauPrixUnitaire)
        setValue('prixVenteLocation1An', nouveauPrixUnitaire)
      }
      if (watchedValues.prixAchatLocation2Ans && watchedValues.prixAchatLocation2Ans > 0) {
        const nouveauPrixUnitaire = ceilPrice(
          watchedValues.prixAchatLocation2Ans * watchedValues.margeCoefficientLocation,
        )
        setValue('prixUnitaireLocation2Ans', nouveauPrixUnitaire)
        setValue('prixVenteLocation2Ans', nouveauPrixUnitaire)
      }
      if (watchedValues.prixAchatLocation3Ans && watchedValues.prixAchatLocation3Ans > 0) {
        const nouveauPrixUnitaire = ceilPrice(
          watchedValues.prixAchatLocation3Ans * watchedValues.margeCoefficientLocation,
        )
        setValue('prixUnitaireLocation3Ans', nouveauPrixUnitaire)
        setValue('prixVenteLocation3Ans', nouveauPrixUnitaire)
      }
    }
  }, [
    watchedValues.margeCoefficientLocation,
    watchedValues.prixAchatLocation1An,
    watchedValues.prixAchatLocation2Ans,
    watchedValues.prixAchatLocation3Ans,
    setValue,
  ])

  const handleCalculatePrix = (mode: PurchaseRentalMode) => {
    if (mode === 'achat') {
      const coefficient = watchedValues.margeCoefficientAchat
      if (watchedValues.prixAchatAchat1An && coefficient) {
        const nouveauPrixUnitaire = ceilPrice(watchedValues.prixAchatAchat1An * coefficient)
        setValue('prixUnitaireAchat1An', nouveauPrixUnitaire)
        setValue('prixVenteAchat1An', nouveauPrixUnitaire)
      }
    } else {
      const coefficient = watchedValues.margeCoefficientLocation
      if (watchedValues.prixAchatLocation1An && coefficient) {
        const nouveauPrixUnitaire = ceilPrice(watchedValues.prixAchatLocation1An * coefficient)
        setValue('prixUnitaireLocation1An', nouveauPrixUnitaire)
        setValue('prixVenteLocation1An', nouveauPrixUnitaire)
      }
      if (watchedValues.prixAchatLocation2Ans && coefficient) {
        const nouveauPrixUnitaire = ceilPrice(watchedValues.prixAchatLocation2Ans * coefficient)
        setValue('prixUnitaireLocation2Ans', nouveauPrixUnitaire)
        setValue('prixVenteLocation2Ans', nouveauPrixUnitaire)
      }
      if (watchedValues.prixAchatLocation3Ans && coefficient) {
        const nouveauPrixUnitaire = ceilPrice(watchedValues.prixAchatLocation3Ans * coefficient)
        setValue('prixUnitaireLocation3Ans', nouveauPrixUnitaire)
        setValue('prixVenteLocation3Ans', nouveauPrixUnitaire)
      }
    }
  }

  const getMarge = (prixAchat: number | undefined, prixUnitaire: number | undefined) => {
    if (!prixAchat || !prixUnitaire || prixAchat === 0) return 0
    // Calcul de la marge sur prix de vente : Marge% = (PV - PR) / PV * 100
    // Formule inverse du coefficient : si PV = PR * coeff, alors Marge% = (1 - 1/coeff) * 100
    const coefficient = prixUnitaire / prixAchat
    return Number(((1 - 1 / coefficient) * 100).toFixed(1))
  }

  const renderAchatContent = () => {
    return (
      <div className="mb-2 space-y-6">
        {/* Coefficient de marge */}
        <div className="rounded-lg border bg-gradient-to-r from-[#30C1BD]/5 to-green-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#30C1BD]" />
            <h4 className="font-semibold text-gray-900">Coefficient de marge - Achat</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id="margeCoefficientAchat"
                type="number"
                step="0.001"
                {...register('margeCoefficientAchat', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
                placeholder="Ex: 1.2"
                min="1"
                max="10"
                className={`transition-colors ${
                  errors.margeCoefficientAchat
                    ? 'border-red-500 focus:border-red-500'
                    : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                }`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCalculatePrix('achat')}
              className="flex cursor-pointer items-center gap-2 border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white"
            >
              <Calculator className="h-4 w-4" />
              Calculer les prix
            </Button>
          </div>
          {errors.margeCoefficientAchat && (
            <p className="mt-2 text-sm text-red-500">{errors.margeCoefficientAchat.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-600">
            Ex: 1.25 = 20% de marge • 1.43 = 30% de marge • 2.0 = 50% de marge
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Les prix unitaires Moduloop sont calculés automatiquement avec la marge
          </p>
        </div>

        {/* Tarification Achat - Prix unique */}
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-semibold text-gray-900">
              <div className="h-2 w-2 rounded-full bg-[#30C1BD]"></div>
              Tarification Achat *
            </h4>
            {watchedValues.prixAchatAchat1An && watchedValues.prixUnitaireAchat1An && (
              <span className="text-sm font-medium text-green-600">
                Marge:{' '}
                {getMarge(watchedValues.prixAchatAchat1An, watchedValues.prixUnitaireAchat1An)}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Prix d&apos;achat fournisseur
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  {...register('prixAchatAchat1An', {
                    setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  placeholder="250.00"
                  min="0"
                  className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                />
                <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                  €
                </span>
              </div>
              {errors.prixAchatAchat1An && (
                <p className="text-sm text-red-500">{errors.prixAchatAchat1An.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Prix unitaire Moduloop</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  {...register('prixUnitaireAchat1An', {
                    setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  placeholder="300.00"
                  min="0"
                  className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                />
                <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                  €
                </span>
              </div>
              {errors.prixUnitaireAchat1An && (
                <p className="text-sm text-red-500">{errors.prixUnitaireAchat1An.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Prix total</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  {...register('prixVenteAchat1An', {
                    setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  placeholder="300.00"
                  min="0"
                  className="bg-gray-50 pr-8 font-semibold focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  readOnly
                />
                <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm font-semibold text-gray-700">
                  €
                </span>
              </div>
              {errors.prixVenteAchat1An && (
                <p className="text-sm text-red-500">{errors.prixVenteAchat1An.message}</p>
              )}
              <p className="text-xs text-gray-500">Calculé automatiquement</p>
            </div>
          </div>
        </div>

        {/* Note pour l'achat - pas d'impact environnemental */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-800">Impact environnemental - Achat</h4>
          </div>
          <p className="text-xs text-blue-700">
            Pour les achats de produits neufs, l&apos;impact environnemental n&apos;est pas saisi
            ici. Il sera géré ailleurs dans le système.
          </p>
        </div>
      </div>
    )
  }

  const renderLocationContent = () => {
    return (
      <div className="space-y-6">
        {/* Coefficient de marge */}
        <div className="rounded-lg border bg-gradient-to-r from-[#30C1BD]/5 to-green-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#30C1BD]" />
            <h4 className="font-semibold text-gray-900">Coefficient de marge - Location</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id="margeCoefficientLocation"
                type="number"
                step="0.001"
                {...register('margeCoefficientLocation', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
                placeholder="Ex: 1.2"
                min="1"
                max="10"
                className={`transition-colors ${
                  errors.margeCoefficientLocation
                    ? 'border-red-500 focus:border-red-500'
                    : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                }`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCalculatePrix('location')}
              className="flex cursor-pointer items-center gap-2 border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white"
            >
              <Calculator className="h-4 w-4" />
              Calculer les prix
            </Button>
          </div>
          {errors.margeCoefficientLocation && (
            <p className="mt-2 text-sm text-red-500">{errors.margeCoefficientLocation.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-600">
            Ex: 1.25 = 20% de marge • 1.43 = 30% de marge • 2.0 = 50% de marge
          </p>
        </div>

        {/* Tarification par période */}
        <div className="space-y-6">
          {/* 1 an */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                <div className="h-2 w-2 rounded-full bg-[#30C1BD]"></div>
                Tarification 1 an * - Location
              </h4>
              {watchedValues.prixAchatLocation1An && watchedValues.prixUnitaireLocation1An && (
                <span className="text-sm font-medium text-green-600">
                  Marge:{' '}
                  {getMarge(
                    watchedValues.prixAchatLocation1An,
                    watchedValues.prixUnitaireLocation1An,
                  )}
                  %
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix d&apos;achat fournisseur
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixAchatLocation1An', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="250.00"
                    min="0"
                    className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                    €
                  </span>
                </div>
                {errors.prixAchatLocation1An && (
                  <p className="text-sm text-red-500">{errors.prixAchatLocation1An.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prix unitaire Moduloop</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixUnitaireLocation1An', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="300.00"
                    min="0"
                    className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                    €
                  </span>
                </div>
                {errors.prixUnitaireLocation1An && (
                  <p className="text-sm text-red-500">{errors.prixUnitaireLocation1An.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prix total</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixVenteLocation1An', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="300.00"
                    min="0"
                    className="bg-gray-50 pr-8 font-semibold focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                    readOnly
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm font-semibold text-gray-700">
                    €
                  </span>
                </div>
                {errors.prixVenteLocation1An && (
                  <p className="text-sm text-red-500">{errors.prixVenteLocation1An.message}</p>
                )}
                <p className="text-xs text-gray-500">Calculé automatiquement</p>
              </div>
            </div>
          </div>

          {/* 2 ans */}
          <div className="rounded-lg border bg-gray-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                Tarification 2 ans (optionnel) - Location
              </h4>
              {watchedValues.prixAchatLocation2Ans && watchedValues.prixUnitaireLocation2Ans && (
                <span className="text-sm font-medium text-green-600">
                  Marge:{' '}
                  {getMarge(
                    watchedValues.prixAchatLocation2Ans,
                    watchedValues.prixUnitaireLocation2Ans,
                  )}
                  %
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix d&apos;achat fournisseur
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixAchatLocation2Ans', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="450.00"
                    min="0"
                    className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                    €
                  </span>
                </div>
                {errors.prixAchatLocation2Ans && (
                  <p className="text-sm text-red-500">{errors.prixAchatLocation2Ans.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prix unitaire Moduloop</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixUnitaireLocation2Ans', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="540.00"
                    min="0"
                    className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                    €
                  </span>
                </div>
                {errors.prixUnitaireLocation2Ans && (
                  <p className="text-sm text-red-500">{errors.prixUnitaireLocation2Ans.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prix total</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixVenteLocation2Ans', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="540.00"
                    min="0"
                    className="bg-gray-50 pr-8 font-semibold focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                    readOnly
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm font-semibold text-gray-700">
                    €
                  </span>
                </div>
                {errors.prixVenteLocation2Ans && (
                  <p className="text-sm text-red-500">{errors.prixVenteLocation2Ans.message}</p>
                )}
                <p className="text-xs text-gray-500">Calculé automatiquement</p>
              </div>
            </div>
          </div>

          {/* 3 ans */}
          <div className="rounded-lg border bg-gray-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                Tarification 3 ans (optionnel) - Location
              </h4>
              {watchedValues.prixAchatLocation3Ans && watchedValues.prixUnitaireLocation3Ans && (
                <span className="text-sm font-medium text-green-600">
                  Marge:{' '}
                  {getMarge(
                    watchedValues.prixAchatLocation3Ans,
                    watchedValues.prixUnitaireLocation3Ans,
                  )}
                  %
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix d&apos;achat fournisseur
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixAchatLocation3Ans', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="650.00"
                    min="0"
                    className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                    €
                  </span>
                </div>
                {errors.prixAchatLocation3Ans && (
                  <p className="text-sm text-red-500">{errors.prixAchatLocation3Ans.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prix unitaire Moduloop</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixUnitaireLocation3Ans', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="780.00"
                    min="0"
                    className="pr-8 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm text-gray-500">
                    €
                  </span>
                </div>
                {errors.prixUnitaireLocation3Ans && (
                  <p className="text-sm text-red-500">{errors.prixUnitaireLocation3Ans.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prix total</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('prixVenteLocation3Ans', {
                      setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                    })}
                    placeholder="780.00"
                    min="0"
                    className="bg-gray-50 pr-8 font-semibold focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                    readOnly
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-sm font-semibold text-gray-700">
                    €
                  </span>
                </div>
                {errors.prixVenteLocation3Ans && (
                  <p className="text-sm text-red-500">{errors.prixVenteLocation3Ans.message}</p>
                )}
                <p className="text-xs text-gray-500">Calculé automatiquement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact environnemental - Location */}
        <div className="space-y-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Impact environnemental - Location</h4>
              <p className="text-sm text-gray-500">Différences par rapport au neuf</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                Réchauffement climatique (kg eq. CO₂) - Différence *
              </Label>
              <Input
                type="number"
                step="0.000001"
                {...register('rechauffementClimatiqueLocation', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
                placeholder="50.2"
                className={`transition-colors ${
                  errors.rechauffementClimatiqueLocation
                    ? 'border-red-500 focus:border-red-500'
                    : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                }`}
              />
              {errors.rechauffementClimatiqueLocation && (
                <p className="text-sm text-red-500">
                  {errors.rechauffementClimatiqueLocation.message}
                </p>
              )}
              <p className="text-xs text-gray-500">Différence entre location et achat neuf</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                Épuisement des ressources fossiles (MJ) - Différence *
              </Label>
              <Input
                type="number"
                step="0.000001"
                {...register('epuisementRessourcesLocation', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
                placeholder="800.0"
                className={`transition-colors ${
                  errors.epuisementRessourcesLocation
                    ? 'border-red-500 focus:border-red-500'
                    : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                }`}
              />
              {errors.epuisementRessourcesLocation && (
                <p className="text-sm text-red-500">
                  {errors.epuisementRessourcesLocation.message}
                </p>
              )}
              <p className="text-xs text-gray-500">Différence d&apos;énergie par réutilisation</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                Acidification des sols et des eaux (MOL H+) - Différence *
              </Label>
              <Input
                type="number"
                step="0.000001"
                {...register('acidificationLocation', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
                placeholder="0.15"
                className={`transition-colors ${
                  errors.acidificationLocation
                    ? 'border-red-500 focus:border-red-500'
                    : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                }`}
              />
              {errors.acidificationLocation && (
                <p className="text-sm text-red-500">{errors.acidificationLocation.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Différence d&apos;impact grâce à la réutilisation
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                Eutrophisation marine (kg P eq.) - Différence *
              </Label>
              <Input
                type="number"
                step="0.000001"
                {...register('eutrophisationLocation', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                })}
                placeholder="0.03"
                className={`transition-colors ${
                  errors.eutrophisationLocation
                    ? 'border-red-500 focus:border-red-500'
                    : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                }`}
              />
              {errors.eutrophisationLocation && (
                <p className="text-sm text-red-500">{errors.eutrophisationLocation.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Différence environnementale de la réutilisation
              </p>
            </div>
          </div>

          {/* Note explicative pour la location */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-semibold text-green-800">
                Impact environnemental - Location
              </h4>
            </div>
            <p className="text-xs text-green-700">
              Ces valeurs représentent la <strong>différence</strong> d&apos;impact environnemental
              entre la location (réutilisation d&apos;équipements existants) et l&apos;achat neuf.
              Vous saisissez directement la différence finale calculée.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AccordionItem value="pricing-environmental" className="rounded-lg border">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-green-100 to-blue-100 p-2">
            <Euro className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Tarification & Impact environnemental</h3>
            <p className="text-sm text-gray-500">
              Prix et empreinte carbone pour achat et location
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        {/* Note d'information */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="mb-1 font-semibold">Achat vs Location :</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • <strong>Achat</strong> : Prix unique pour l&apos;acquisition définitive
                  d&apos;équipements neufs
                </li>
                <li>
                  • <strong>Location</strong> : Prix sur 1, 2 ou 3 ans pour la location
                  d&apos;équipements existants
                </li>
                <li>
                  • <strong>Impact</strong> : Seulement en location (différence vs neuf), pas
                  d&apos;impact saisi pour l&apos;achat
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Tabs
          value={activeMode}
          onValueChange={(value) => setActiveMode(value as PurchaseRentalMode)}
        >
          <div className="relative mb-8">
            {/* Navigation d'onglets moderne */}
            <div className="scrollbar-hide overflow-x-auto">
              <TabsList className="inline-flex h-12 min-w-full items-center justify-center rounded-2xl border border-gray-200/50 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 text-gray-500 shadow-lg backdrop-blur-sm lg:min-w-0">
                <div className="flex w-full space-x-1 lg:w-auto">
                  <TabsTrigger
                    value="achat"
                    className="group relative inline-flex min-w-0 flex-1 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:bg-white/60 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200/80 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg lg:min-w-max lg:flex-initial"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 transition-opacity duration-300 data-[state=active]:opacity-5"></div>
                    <ShoppingCart
                      className={`mr-2 h-4 w-4 transition-colors duration-200 ${
                        activeMode === 'achat' ? 'text-[#30C1BD]' : ''
                      }`}
                    />
                    <span className="text-sm font-medium">Achat</span>
                    <div
                      className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-[#30C1BD] to-blue-500 transition-all duration-300 ${
                        activeMode === 'achat' ? 'w-8' : 'w-0'
                      }`}
                    ></div>
                  </TabsTrigger>

                  <TabsTrigger
                    value="location"
                    className="group relative inline-flex min-w-0 flex-1 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:bg-white/60 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border data-[state=active]:border-gray-200/80 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg lg:min-w-max lg:flex-initial"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 transition-opacity duration-300 data-[state=active]:opacity-5"></div>
                    <Home
                      className={`mr-2 h-4 w-4 transition-colors duration-200 ${
                        activeMode === 'location' ? 'text-[#30C1BD]' : ''
                      }`}
                    />
                    <span className="text-sm font-medium">Location</span>
                    <div
                      className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-[#30C1BD] to-blue-500 transition-all duration-300 ${
                        activeMode === 'location' ? 'w-8' : 'w-0'
                      }`}
                    ></div>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>
          </div>

          <TabsContent value="achat">{renderAchatContent()}</TabsContent>

          <TabsContent value="location">{renderLocationContent()}</TabsContent>
        </Tabs>
      </AccordionContent>
    </AccordionItem>
  )
}
