'use client'

import { useState, useEffect, useMemo } from 'react'
import { Control, useFieldArray, FieldErrors, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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
        console.error('Erreur:', error)
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
    const field = fields[index]
    if (!field) return
    const newQuantity = Math.max(1, (field.quantite || 1) + delta)
    update(index, { ...field, quantite: newQuantity })
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
    <AccordionItem value="products" className="rounded-lg border">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Package className="text-primary h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Produits du kit</h3>
            <p className="text-muted-foreground text-sm">
              Sélectionnez les produits et leurs quantités
            </p>
          </div>
          {fields.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {fields.length} produit{fields.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Selected Products List */}
          {fields.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium">Produits sélectionnés</h4>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {fields.map((field, index) => {
                  const selectedProduct = getSelectedProduct(field.productId)
                  if (!selectedProduct) return null

                  return (
                    <Card key={field.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="from-muted/30 to-muted/50 relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br">
                            {selectedProduct.image ? (
                              <img
                                src={selectedProduct.image}
                                alt={selectedProduct.nom}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="text-muted-foreground/40 h-6 w-6" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="min-w-0 flex-1 space-y-2">
                            <div>
                              <h5 className="truncate text-sm font-semibold">
                                {selectedProduct.nom}
                              </h5>
                              <Badge variant="secondary" className="text-xs">
                                {selectedProduct.reference}
                              </Badge>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Label className="text-muted-foreground text-xs">Quantité:</Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
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
                                    update(index, {
                                      ...field,
                                      quantite: Math.max(1, value),
                                    })
                                  }}
                                  className="h-6 w-12 p-0 text-center text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(index, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Price - Achat & Location */}
                            <div className="space-y-1.5">
                              {(() => {
                                const pricingAchat = getProductPricing(
                                  selectedProduct,
                                  'achat',
                                  '1an',
                                )
                                const pricingLocation1An = getProductPricing(
                                  selectedProduct,
                                  'location',
                                  '1an',
                                )
                                const pricingLocation2Ans = getProductPricing(
                                  selectedProduct,
                                  'location',
                                  '2ans',
                                )
                                const pricingLocation3Ans = getProductPricing(
                                  selectedProduct,
                                  'location',
                                  '3ans',
                                )

                                return (
                                  <>
                                    {/* Prix d'achat - toujours affiché */}
                                    <div className="flex items-center gap-1 text-xs">
                                      <ShoppingCart className="text-primary h-3 w-3" />
                                      <span className="text-muted-foreground">Achat:</span>
                                      {pricingAchat.prixVente && pricingAchat.prixVente > 0 ? (
                                        <span className="text-primary font-semibold">
                                          {formatPrice(pricingAchat.prixVente * field.quantite)}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-orange-600 italic">
                                          Non renseigné
                                        </span>
                                      )}
                                    </div>

                                    {/* Prix de location - 3 périodes */}
                                    <div className="border-primary/20 space-y-0.5 border-l-2 pl-4">
                                      <div className="flex items-center gap-1 text-xs">
                                        <Home className="text-primary h-3 w-3" />
                                        <span className="text-muted-foreground">Loc. 1an:</span>
                                        {pricingLocation1An.prixVente &&
                                        pricingLocation1An.prixVente > 0 ? (
                                          <span className="text-primary font-semibold">
                                            {formatPrice(
                                              pricingLocation1An.prixVente * field.quantite,
                                            )}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-orange-600 italic">
                                            Non renseigné
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 text-xs">
                                        <Home className="text-primary h-3 w-3" />
                                        <span className="text-muted-foreground">Loc. 2ans:</span>
                                        {pricingLocation2Ans.prixVente &&
                                        pricingLocation2Ans.prixVente > 0 ? (
                                          <span className="text-primary font-semibold">
                                            {formatPrice(
                                              pricingLocation2Ans.prixVente * field.quantite,
                                            )}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-orange-600 italic">
                                            Non renseigné
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 text-xs">
                                        <Home className="text-primary h-3 w-3" />
                                        <span className="text-muted-foreground">Loc. 3ans:</span>
                                        {pricingLocation3Ans.prixVente &&
                                        pricingLocation3Ans.prixVente > 0 ? (
                                          <span className="text-primary font-semibold">
                                            {formatPrice(
                                              pricingLocation3Ans.prixVente * field.quantite,
                                            )}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-orange-600 italic">
                                            Non renseigné
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              className="hover:border-primary hover:text-primary w-full border-2 border-dashed"
              disabled={isLoadingProducts}
            >
              <Plus className="mr-2 h-4 w-4" />
              {fields.length === 0 ? 'Ajouter des produits' : 'Ajouter un autre produit'}
            </Button>
          )}

          {errors.products && <p className="text-sm text-red-500">{errors.products.message}</p>}

          {/* Summary Card with Mode Selection */}
          {fields.length > 0 && (
            <div className="from-primary/5 to-primary/10 border-primary/20 rounded-xl border bg-gradient-to-br p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Calculator className="text-primary h-5 w-5" />
                </div>
                <h4 className="text-primary text-lg font-semibold">Récapitulatif du kit</h4>
              </div>

              <Tabs defaultValue="achat" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="achat" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Achat
                  </TabsTrigger>
                  <TabsTrigger value="location" className="gap-2">
                    <Home className="h-4 w-4" />
                    Location
                  </TabsTrigger>
                </TabsList>

                {/* Achat Tab */}
                <TabsContent value="achat" className="space-y-4">
                  {/* Prix Achat */}
                  <div className="border-primary/10 rounded-lg border bg-white/60 p-6">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-muted-foreground text-sm font-medium">
                        Prix d&apos;achat total
                      </p>
                      <p className="text-primary text-3xl font-bold">
                        {formatPrice(totals.totalAchat1An)}
                      </p>
                    </div>
                  </div>

                  {/* Surface totale */}
                  {totals.totalSurface > 0 && (
                    <div className="border-primary/10 rounded-lg border bg-white/60 p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Square className="text-primary h-5 w-5" />
                        <p className="text-muted-foreground text-sm font-medium">
                          Surface totale utilisée:
                        </p>
                        <p className="text-primary text-2xl font-bold">
                          {totals.totalSurface.toFixed(2)} m²
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Impact Environnemental - Achat : MASQUÉ (demande client) */}
                  {/* L'impact environnemental n'est affiché que pour la location */}
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="space-y-4">
                  {/* Prix Location */}
                  <div className="border-primary/10 rounded-lg border bg-white/60 p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-1 text-xs font-medium">Prix 1 an</p>
                        <p className="text-primary text-xl font-bold">
                          {formatPrice(totals.totalLocation1An)}
                        </p>
                      </div>
                      {totals.totalLocation2Ans > 0 && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Prix 2 ans
                          </p>
                          <p className="text-primary text-xl font-bold">
                            {formatPrice(totals.totalLocation2Ans)}
                          </p>
                        </div>
                      )}
                      {totals.totalLocation3Ans > 0 && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-1 text-xs font-medium">
                            Prix 3 ans
                          </p>
                          <p className="text-primary text-xl font-bold">
                            {formatPrice(totals.totalLocation3Ans)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Surface totale */}
                  {totals.totalSurface > 0 && (
                    <div className="border-primary/10 rounded-lg border bg-white/60 p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Square className="text-primary h-5 w-5" />
                        <p className="text-muted-foreground text-sm font-medium">
                          Surface totale utilisée:
                        </p>
                        <p className="text-primary text-2xl font-bold">
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
              </Tabs>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
