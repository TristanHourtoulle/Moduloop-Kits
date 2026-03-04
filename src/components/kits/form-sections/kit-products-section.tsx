'use client'

import { useState, useEffect, useMemo } from 'react'
import { Control, useFieldArray, FieldErrors, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  Trash2,
  Calculator,
  Plus,
  Minus,
  ShoppingCart,
  Home,
  Leaf,
  Square,
} from 'lucide-react'
import { logger } from '@/lib/logger'
import { KitFormData } from '@/lib/schemas/kit'
import { ProductSelectionGrid } from '../product-selection/ProductSelectionGrid'
import { Product } from '@/lib/types/project'
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice,
} from '@/lib/utils/product-helpers'

interface KitProductsSectionProps {
  control: Control<KitFormData>
  errors: FieldErrors<KitFormData>
  onError: (error: string) => void
}

export function KitProductsSection({ control, errors, onError }: KitProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [showProductSelection, setShowProductSelection] = useState(false)

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'products',
  })

  // Watch product values for real-time calculations
  const watchedProducts = useWatch({
    control,
    name: 'products',
  })

  // Load all products (no pagination for product selection)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?all=true')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des produits')
        }
        const data = await response.json()
        const productsArray = data.products || data
        setProducts(productsArray)
      } catch (error) {
        logger.error('Error loading products', { error })
        onError('Impossible de charger la liste des produits')
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [onError])

  const handleQuantityChange = (productId: string, quantity: number) => {
    // Find existing product in fields
    const existingIndex = fields.findIndex((field) => field.productId === productId)

    if (quantity === 0) {
      // Remove product if quantity is 0
      if (existingIndex >= 0) {
        remove(existingIndex)
      }
    } else {
      // Update or add product
      if (existingIndex >= 0) {
        update(existingIndex, { productId, quantite: quantity })
      } else {
        append({ productId, quantite: quantity })
      }
    }
  }

  // Build product quantities map for ProductSelectionGrid
  const productQuantities: Record<string, number> = {}
  fields.forEach((field) => {
    productQuantities[field.productId] = field.quantite
  })

  const getSelectedProduct = (productId: string) => {
    return products.find((p) => p.id === productId)
  }

  const updateQuantity = (index: number, delta: number) => {
    const current = watchedProducts?.[index]
    if (!current) return
    const newQuantity = Math.max(1, (current.quantite || 1) + delta)
    update(index, { ...current, quantite: newQuantity })
  }

  // Calculate totals with useMemo for performance optimization
  // Updates in real-time when products or quantities change
  const totals = useMemo(() => {
    // Calculs pour le mode ACHAT (un seul prix, pas de périodes)
    let totalAchat = 0

    // Calculs pour le mode LOCATION (avec périodes 1an, 2ans, 3ans)
    let totalLocation1An = 0
    let totalLocation2Ans = 0
    let totalLocation3Ans = 0

    // Impact environnemental ACHAT (CO₂ émis)
    let totalCO2 = 0
    let totalRessources = 0
    let totalAcidification = 0
    let totalEutrophisation = 0

    // Impact environnemental LOCATION (CO₂ économisé)
    let totalCO2Location = 0
    let totalRessourcesLocation = 0
    let totalAcidificationLocation = 0
    let totalEutrophisationLocation = 0

    // Surface totale utilisée par les produits
    let totalSurface = 0

    const productsToCalculate = Array.isArray(watchedProducts) ? watchedProducts : []

    productsToCalculate.forEach((productData) => {
      if (productData && productData.productId && productData.quantite) {
        const product = getSelectedProduct(productData.productId)
        if (product) {
          const quantite = Number(productData.quantite) || 0

          // ACHAT : un seul prix
          const pricingAchat = getProductPricing(product, 'achat', '1an')
          totalAchat += (pricingAchat.prixVente || 0) * quantite

          // LOCATION : 3 périodes
          const pricingLocation1An = getProductPricing(product, 'location', '1an')
          const pricingLocation2Ans = getProductPricing(product, 'location', '2ans')
          const pricingLocation3Ans = getProductPricing(product, 'location', '3ans')

          totalLocation1An += (pricingLocation1An.prixVente || 0) * quantite
          totalLocation2Ans += (pricingLocation2Ans.prixVente || 0) * quantite
          totalLocation3Ans += (pricingLocation3Ans.prixVente || 0) * quantite

          // Impact environnemental ACHAT (CO₂ émis)
          const environmentalImpactAchat = getProductEnvironmentalImpact(product, 'achat')
          totalCO2 += (environmentalImpactAchat.rechauffementClimatique || 0) * quantite
          totalRessources += (environmentalImpactAchat.epuisementRessources || 0) * quantite
          totalAcidification += (environmentalImpactAchat.acidification || 0) * quantite
          totalEutrophisation += (environmentalImpactAchat.eutrophisation || 0) * quantite

          // Impact environnemental LOCATION (CO₂ économisé - valeurs négatives dans la DB)
          const environmentalImpactLocation = getProductEnvironmentalImpact(product, 'location')
          totalCO2Location += (environmentalImpactLocation.rechauffementClimatique || 0) * quantite
          totalRessourcesLocation +=
            (environmentalImpactLocation.epuisementRessources || 0) * quantite
          totalAcidificationLocation += (environmentalImpactLocation.acidification || 0) * quantite
          totalEutrophisationLocation +=
            (environmentalImpactLocation.eutrophisation || 0) * quantite

          // Surface totale (surfaceM2 du produit × quantité)
          if (product.surfaceM2) {
            totalSurface += product.surfaceM2 * quantite
          }
        }
      }
    })

    return {
      // Pour compatibilité avec le code legacy
      total1An: totalAchat,
      total2Ans: 0,
      total3Ans: 0,
      // Prix ACHAT (un seul prix)
      totalAchat,
      totalAchat1An: totalAchat, // Alias pour cohérence
      // Prix LOCATION (avec périodes)
      totalLocation1An,
      totalLocation2Ans,
      totalLocation3Ans,
      // Impact environnemental ACHAT
      totalCO2,
      totalRessources,
      totalAcidification,
      totalEutrophisation,
      // Impact environnemental LOCATION
      totalCO2Location,
      totalRessourcesLocation,
      totalAcidificationLocation,
      totalEutrophisationLocation,
      // Surface totale
      totalSurface,
    }
  }, [watchedProducts, products])

  return (
    <div className="overflow-hidden rounded-xl border border-[#30C1BD]/20 bg-white shadow-sm">
      {/* Header bar with gradient */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#30C1BD]/10 to-[#30C1BD]/5 px-6 py-4">
        <div className="rounded-lg bg-[#30C1BD]/15 p-2">
          <Package className="h-5 w-5 text-[#30C1BD]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Produits du kit</h3>
          <p className="text-sm text-gray-500">Sélectionnez les produits et leurs quantités</p>
        </div>
        {fields.length > 0 && (
          <Badge variant="secondary" className="bg-[#30C1BD]/10 text-[#30C1BD]">
            {fields.length} produit{fields.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6 px-6 py-6">
        {/* Selected Products List */}
        {fields.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Produits sélectionnés</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field, index) => {
                const selectedProduct = getSelectedProduct(field.productId)
                if (!selectedProduct) return null

                const pricingAchat = getProductPricing(selectedProduct, 'achat', '1an')
                const pricingLocation1An = getProductPricing(selectedProduct, 'location', '1an')

                return (
                  <Card
                    key={field.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-md"
                  >
                    {/* Delete Button - top right */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/80 text-red-500 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    {/* Product Image */}
                    <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {selectedProduct.image ? (
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.nom}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <h5 className="truncate text-sm font-semibold text-gray-900">
                          {selectedProduct.nom}
                        </h5>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {selectedProduct.reference}
                        </Badge>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Home className="h-3 w-3 text-[#30C1BD]" />
                            Location /mois
                          </span>
                          {pricingLocation1An.prixVente && pricingLocation1An.prixVente > 0 ? (
                            <span className="font-semibold text-[#30C1BD]">
                              {formatPrice(pricingLocation1An.prixVente * field.quantite)}
                            </span>
                          ) : (
                            <span className="text-orange-500 italic">N/A</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-500">
                            <ShoppingCart className="h-3 w-3 text-[#30C1BD]" />
                            Achat
                          </span>
                          {pricingAchat.prixVente && pricingAchat.prixVente > 0 ? (
                            <span className="font-semibold text-[#30C1BD]">
                              {formatPrice(pricingAchat.prixVente * field.quantite)}
                            </span>
                          ) : (
                            <span className="text-orange-500 italic">N/A</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <Label className="text-xs font-medium text-gray-500">Quantité</Label>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(index, -1)}
                            disabled={field.quantite <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={field.quantite}
                            onChange={(e) => {
                              const value = Number(e.target.value) || 1
                              const current = watchedProducts?.[index]
                              if (!current) return
                              update(index, {
                                ...current,
                                quantite: Math.max(1, value),
                              })
                            }}
                            className="h-7 w-12 rounded-lg p-0 text-center text-sm font-semibold"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Product Selection Grid */}
        {showProductSelection && !isLoadingProducts && (
          <div className="border-t pt-6">
            <ProductSelectionGrid
              products={products}
              productQuantities={productQuantities}
              onQuantityChange={handleQuantityChange}
            />
          </div>
        )}

        {/* Add Product Button */}
        {!showProductSelection && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowProductSelection(true)}
            className="w-full border-2 border-dashed border-[#30C1BD]/40 text-[#30C1BD] hover:border-[#30C1BD] hover:bg-[#30C1BD]/5 hover:text-[#30C1BD]"
            disabled={isLoadingProducts}
          >
            <Plus className="mr-2 h-4 w-4" />
            {fields.length === 0 ? 'Ajouter des produits' : 'Ajouter un autre produit'}
          </Button>
        )}

        {errors.products && <p className="text-sm text-red-500">{errors.products.message}</p>}

        {/* Summary Card with Mode Selection */}
        {fields.length > 0 && (
          <div className="rounded-xl border border-[#30C1BD]/20 bg-gradient-to-br from-[#30C1BD]/5 to-[#30C1BD]/10 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[#30C1BD]/15 p-2">
                <Calculator className="h-5 w-5 text-[#30C1BD]" />
              </div>
              <h4 className="text-lg font-semibold text-[#30C1BD]">Récapitulatif du kit</h4>
            </div>

            <Tabs defaultValue="location" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="location" className="gap-2">
                  <Home className="h-4 w-4" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="achat" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Achat
                </TabsTrigger>
              </TabsList>

              {/* Location Tab */}
              <TabsContent value="location" className="space-y-4">
                {/* Prix Location */}
                <div className="rounded-lg border border-[#30C1BD]/10 bg-white/60 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Prix 1 an /mois
                      </p>
                      <p className="text-xl font-bold text-[#30C1BD]">
                        {formatPrice(totals.totalLocation1An)}
                      </p>
                    </div>
                    {totals.totalLocation2Ans > 0 && (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          Prix 2 ans /mois
                        </p>
                        <p className="text-xl font-bold text-[#30C1BD]">
                          {formatPrice(totals.totalLocation2Ans)}
                        </p>
                      </div>
                    )}
                    {totals.totalLocation3Ans > 0 && (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          Prix 3 ans /mois
                        </p>
                        <p className="text-xl font-bold text-[#30C1BD]">
                          {formatPrice(totals.totalLocation3Ans)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Surface totale */}
                {totals.totalSurface > 0 && (
                  <div className="rounded-lg border border-[#30C1BD]/10 bg-white/60 p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Square className="h-5 w-5 text-[#30C1BD]" />
                      <p className="text-muted-foreground text-sm font-medium">
                        Surface totale utilisée:
                      </p>
                      <p className="text-2xl font-bold text-[#30C1BD]">
                        {totals.totalSurface.toFixed(2)} m²
                      </p>
                    </div>
                  </div>
                )}

                {/* Impact Environnemental - Location */}
                <div className="rounded-lg border border-emerald-200/50 bg-emerald-50/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-900">
                      Impact environnemental (CO₂ économisé)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div className="rounded bg-white/60 p-2">
                      <span className="text-muted-foreground block text-xs">CO₂:</span>
                      <p className="font-bold" style={{ color: '#FE9E58' }}>
                        {totals.totalCO2Location.toFixed(2)} kg
                      </p>
                    </div>
                    <div className="rounded bg-white/60 p-2">
                      <span className="text-muted-foreground block text-xs">Ressources:</span>
                      <p className="font-bold" style={{ color: '#FE5858' }}>
                        {totals.totalRessourcesLocation.toFixed(2)} MJ
                      </p>
                    </div>
                    <div className="rounded bg-white/60 p-2">
                      <span className="text-muted-foreground block text-xs">Acidification:</span>
                      <p className="font-bold" style={{ color: '#55D789' }}>
                        {totals.totalAcidificationLocation.toFixed(4)} MOL
                      </p>
                    </div>
                    <div className="rounded bg-white/60 p-2">
                      <span className="text-muted-foreground block text-xs">Eutrophisation:</span>
                      <p className="font-bold" style={{ color: '#55D789' }}>
                        {totals.totalEutrophisationLocation.toFixed(4)} kg P
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Achat Tab */}
              <TabsContent value="achat" className="space-y-4">
                {/* Prix Achat */}
                <div className="rounded-lg border border-[#30C1BD]/10 bg-white/60 p-6">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground text-sm font-medium">
                      Prix d&apos;achat total
                    </p>
                    <p className="text-3xl font-bold text-[#30C1BD]">
                      {formatPrice(totals.totalAchat1An)}
                    </p>
                  </div>
                </div>

                {/* Surface totale */}
                {totals.totalSurface > 0 && (
                  <div className="rounded-lg border border-[#30C1BD]/10 bg-white/60 p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Square className="h-5 w-5 text-[#30C1BD]" />
                      <p className="text-muted-foreground text-sm font-medium">
                        Surface totale utilisée:
                      </p>
                      <p className="text-2xl font-bold text-[#30C1BD]">
                        {totals.totalSurface.toFixed(2)} m²
                      </p>
                    </div>
                  </div>
                )}

                {/* Impact Environnemental - Achat : MASQUÉ (demande client) */}
                {/* L'impact environnemental n'est affiché que pour la location */}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
