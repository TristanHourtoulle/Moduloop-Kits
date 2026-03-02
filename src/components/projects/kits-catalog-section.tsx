'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Package, Search, Filter, Plus, ShoppingBag } from 'lucide-react'
import { type PurchaseRentalMode } from '@/lib/schemas/product'
import { calculateKitPrice } from '@/lib/utils/kit/calculations'
import { formatPrice as formatPriceHelper, annualToMonthly } from '@/lib/utils/product-helpers'
import { AvailableKitCard, type AvailableKit } from './available-kit-card'

interface KitsCatalogSectionProps {
  availableKits: AvailableKit[]
  selectedMode: PurchaseRentalMode
  selectedKits: Record<string, number>
  loading: boolean
  searchTerm: string
  selectedStyle: string
  onSearchTermChange: (value: string) => void
  onStyleChange: (value: string) => void
  onQuantityChange: (kitId: string, change: number) => void
  onAddSelectedKits: () => Promise<void>
}

/**
 * Catalog section displaying available kits with search, filters, and selection controls.
 * @param props - Kit catalog configuration including available kits, filters, and event handlers
 * @returns A card-based catalog UI with search, style filtering, kit grid, and floating mobile add button
 */
export function KitsCatalogSection({
  availableKits,
  selectedMode,
  selectedKits,
  loading,
  searchTerm,
  selectedStyle,
  onSearchTermChange,
  onStyleChange,
  onQuantityChange,
  onAddSelectedKits,
}: KitsCatalogSectionProps) {
  const [expandedAvailableKit, setExpandedAvailableKit] = useState<string | null>(null)

  const selectedKitsCount = Object.values(selectedKits).reduce((sum, qty) => sum + qty, 0)

  const selectedKitsTotalPrice = Object.entries(selectedKits).reduce((sum, [kitId, quantity]) => {
    const kit = availableKits.find((k) => k.id === kitId)
    const period = selectedMode === 'location' ? ('3ans' as const) : ('1an' as const)
    return sum + (kit ? calculateKitPrice(kit.kitProducts, selectedMode, period) * quantity : 0)
  }, 0)

  const availableStyles = Array.from(new Set(availableKits.map((kit) => kit.style).filter(Boolean)))

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 pt-6 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-900">
            <div className="rounded-xl bg-blue-100 p-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xl">Catalogue des Kits</span>
              <p className="mt-1 text-sm font-normal text-blue-700">
                Sélectionnez les kits à ajouter à votre projet
              </p>
            </div>
          </div>

          {selectedKitsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-blue-300 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <ShoppingBag className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">
                    {selectedKitsCount} kit
                    {selectedKitsCount > 1 ? 's' : ''} sélectionné
                    {selectedKitsCount > 1 ? 's' : ''}
                  </div>
                  <div className="font-medium text-green-600">
                    {selectedMode === 'location'
                      ? `${formatPriceHelper(annualToMonthly(selectedKitsTotalPrice))}/mois (base 3 ans)`
                      : formatPriceHelper(selectedKitsTotalPrice)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={onAddSelectedKits}
                  className="bg-green-600 text-white shadow-sm hover:bg-green-700"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter
                </Button>
              </div>
            </motion.div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-blue-200 bg-white p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Rechercher par nom de kit..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="border-gray-300 bg-white pl-10 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedStyle}
              onChange={(e) => onStyleChange(e.target.value)}
              className="min-w-[140px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-[#30C1BD] focus:outline-none"
            >
              <option value="">Tous les styles</option>
              {availableStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-500">Chargement du catalogue...</p>
            </div>
          ) : availableKits.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto mb-4 h-20 w-20 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Aucun kit trouvé</h3>
              <p className="text-gray-500">
                {searchTerm || selectedStyle
                  ? 'Aucun kit ne correspond à vos critères de recherche'
                  : 'Le catalogue de kits est actuellement vide'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {availableKits.map((kit) => (
                <AvailableKitCard
                  key={kit.id}
                  kit={kit}
                  selectedMode={selectedMode}
                  selectedQuantity={selectedKits[kit.id] || 0}
                  isExpanded={expandedAvailableKit === kit.id}
                  onQuantityChange={onQuantityChange}
                  onToggleExpand={setExpandedAvailableKit}
                />
              ))}
            </div>
          )}
        </div>

        {selectedKitsCount > 0 && (
          <div className="fixed right-6 bottom-6 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onAddSelectedKits}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
