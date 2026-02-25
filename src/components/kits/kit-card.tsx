'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Package2,
  Calendar,
  User,
  Calculator,
  Leaf,
  Edit,
  Trash2,
  ShoppingCart,
  Home,
  Square,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { type PurchaseRentalMode } from '@/lib/schemas/product'
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice,
  ceilPrice,
} from '@/lib/utils/product-helpers'

// Utiliser le type Kit complet du system
import { logger } from '@/lib/logger'
import { type Kit } from '@/lib/types/project'

interface KitCardProps {
  kit: Kit
  onDelete?: (kitId: string) => Promise<void>
}

export function KitCard({ kit, onDelete }: KitCardProps) {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat')

  // Calculate total price based on selected mode and period
  const totalPriceAchat = useMemo(() => {
    let total = 0
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct
      if (product) {
        const pricing = getProductPricing(product, 'achat', '1an')
        total += (pricing.prixVente || 0) * quantite
      }
    })
    return total
  }, [kit.kitProducts])

  const totalPriceLocation1An = useMemo(() => {
    let total = 0
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct
      if (product) {
        const pricing = getProductPricing(product, 'location', '1an')
        total += (pricing.prixVente || 0) * quantite
      }
    })
    return total
  }, [kit.kitProducts])

  const totalPriceLocation2Ans = useMemo(() => {
    let total = 0
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct
      if (product) {
        const pricing = getProductPricing(product, 'location', '2ans')
        total += (pricing.prixVente || 0) * quantite
      }
    })
    return total
  }, [kit.kitProducts])

  const totalPriceLocation3Ans = useMemo(() => {
    let total = 0
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct
      if (product) {
        const pricing = getProductPricing(product, 'location', '3ans')
        total += (pricing.prixVente || 0) * quantite
      }
    })
    return total
  }, [kit.kitProducts])

  // Calculate CO2 impact based on selected mode
  // Note: DB values for 'location' mode already represent savings/difference
  const totalCO2 = useMemo(() => {
    let total = 0

    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct
      if (product) {
        const environmentalImpact = getProductEnvironmentalImpact(product, selectedMode)
        total += (environmentalImpact.rechauffementClimatique || 0) * quantite
      }
    })

    return total
  }, [selectedMode, kit.kitProducts])

  // Calculate total surface area from products
  const totalProductsSurface = useMemo(() => {
    let total = 0
    kit.kitProducts?.forEach((kitProduct) => {
      const { product, quantite } = kitProduct
      if (product && product.surfaceM2) {
        total += product.surfaceM2 * quantite
      }
    })
    return total
  }, [kit.kitProducts])

  const handleDelete = async () => {
    if (!onDelete) {
      return
    }

    try {
      await onDelete(kit.id)
    } catch (err) {
      logger.error('Error deleting kit', { error: err })
    }
  }

  return (
    <Card className="group relative overflow-hidden" style={{ pointerEvents: 'auto' }}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 border-primary/10 flex h-12 w-12 items-center justify-center rounded-xl border">
                <Package2 className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-foreground text-xl font-semibold">{kit.nom}</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 mt-1"
                >
                  {kit.style}
                </Badge>
              </div>
            </div>
            {kit.description && (
              <CardDescription className="text-muted-foreground mt-3 line-clamp-2 max-w-sm text-sm">
                {kit.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Section produits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
            <span className="text-foreground text-sm font-medium">
              {kit.kitProducts?.length || 0} produit
              {(kit.kitProducts?.length || 0) > 1 ? 's' : ''}
              {' unique'}
              {(kit.kitProducts?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>
          {totalProductsSurface > 0 && (
            <div className="flex items-center gap-2">
              <Square className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-sm">
                Surface totale:{' '}
                <span className="text-foreground font-medium">
                  {totalProductsSurface.toFixed(2)} m²
                </span>
              </span>
            </div>
          )}
          <div className="[&::-webkit-scrollbar-thumb]:bg-border max-h-24 space-y-2 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent">
            {kit.kitProducts
              ?.map((kitProduct) => {
                const { product, quantite } = kitProduct
                if (!product) return null

                return (
                  <div
                    key={kitProduct.id}
                    className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-2 transition-colors"
                  >
                    <span className="text-foreground truncate pr-2 text-sm">{product.nom}</span>
                    <Badge variant="outline" className="bg-background text-xs">
                      ×{quantite}
                    </Badge>
                  </div>
                )
              })
              ?.filter(Boolean)}
          </div>
        </div>

        {/* Sélecteur de mode */}
        <div className="mb-4 flex gap-1">
          <Button
            variant={selectedMode === 'achat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMode('achat')}
            className={`h-7 flex-1 px-2 text-xs ${
              selectedMode === 'achat' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
            }`}
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            Achat
          </Button>
          <Button
            variant={selectedMode === 'location' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMode('location')}
            className={`h-7 flex-1 px-2 text-xs ${
              selectedMode === 'location' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
            }`}
          >
            <Home className="mr-1 h-3 w-3" />
            Location
          </Button>
        </div>

        {/* Section métriques */}
        {selectedMode === 'achat' ? (
          <div className="border-primary/10 rounded-lg border bg-white/60 p-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="text-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Prix d&apos;achat total
                </span>
              </div>
              <p className="text-primary text-3xl font-bold">{formatPrice(totalPriceAchat)}</p>
              {totalProductsSurface > 0 && (
                <div className="text-muted-foreground mt-2 text-xs">
                  {ceilPrice(totalPriceAchat / totalProductsSurface).toLocaleString('fr-FR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  €/m²
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-sm font-medium">Prix location</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="from-primary/5 to-primary/10 border-primary/20 rounded-lg border bg-gradient-to-br p-3">
                <div className="text-primary/70 mb-1 text-xs font-medium">1 an</div>
                <div className="text-primary text-sm font-bold">
                  {formatPrice(totalPriceLocation1An)}
                </div>
              </div>
              <div className="from-primary/5 to-primary/10 border-primary/20 rounded-lg border bg-gradient-to-br p-3">
                <div className="text-primary/70 mb-1 text-xs font-medium">2 ans</div>
                <div className="text-primary text-sm font-bold">
                  {formatPrice(totalPriceLocation2Ans)}
                </div>
              </div>
              <div className="from-primary/5 to-primary/10 border-primary/20 rounded-lg border bg-gradient-to-br p-3">
                <div className="text-primary/70 mb-1 text-xs font-medium">3 ans</div>
                <div className="text-primary text-sm font-bold">
                  {formatPrice(totalPriceLocation3Ans)}
                </div>
              </div>
            </div>
            {totalProductsSurface > 0 &&
              (() => {
                const annualPerM2 = ceilPrice(totalPriceLocation3Ans / totalProductsSurface)
                const monthlyPerM2 = ceilPrice(annualPerM2 / 12)
                return (
                  <div className="text-muted-foreground border-border/50 mt-2 border-t pt-2 text-xs">
                    <div>
                      Prix/m² :{' '}
                      {monthlyPerM2.toLocaleString('fr-FR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                      €/mois
                      <span className="text-muted-foreground/70 ml-1">(base 3 ans)</span>
                    </div>
                    <div className="text-muted-foreground/70">
                      {annualPerM2.toLocaleString('fr-FR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                      €/an
                    </div>
                  </div>
                )
              })()}
            <div className="flex items-center gap-2 pt-2">
              <Leaf className="h-4 w-4" style={{ color: '#FE9E58' }} />
              <span className="text-muted-foreground text-sm">CO₂ économisé</span>
              <span className="ml-auto text-xl font-bold" style={{ color: '#FE9E58' }}>
                {totalCO2.toFixed(1)} kg
              </span>
            </div>
          </div>
        )}

        {/* Section métadonnées */}
        <div className="border-border/50 space-y-2 border-t pt-4">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">
                {kit.createdBy?.name || kit.createdBy?.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(kit.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 pb-4">
        <div
          className="pointer-events-auto flex w-full gap-3"
          style={{ pointerEvents: 'auto' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <RoleGuard requiredRole={UserRole.DEV}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Add timestamp to URL to bypass Vercel cache
                router.push(`/kits/${kit.id}/modifier?t=${Date.now()}`)
              }}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary focus:ring-primary/20 relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 focus:ring-2 focus:outline-none"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              title="Modifier le kit"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </button>
          </RoleGuard>
          <RoleGuard requiredRole={UserRole.DEV}>
            {onDelete && (
              <DeleteConfirmDialog
                title="Supprimer le kit ?"
                itemName={kit.nom}
                description="Tous les produits associés à ce kit seront également supprimés."
                onConfirm={handleDelete}
                triggerVariant="outline"
                triggerSize="default"
                showIcon={false}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-red-400 hover:bg-red-50 hover:text-red-600 focus:ring-2 focus:ring-red-200 focus:outline-none"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  title="Supprimer le kit"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </button>
              </DeleteConfirmDialog>
            )}
          </RoleGuard>
        </div>
      </CardFooter>
    </Card>
  )
}
