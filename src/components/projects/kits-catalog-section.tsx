'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Package, Search, Filter, Plus, ShoppingBag } from 'lucide-react'
import { type PurchaseRentalMode } from '@/lib/schemas/product'
import { calculateKitPrice } from '@/lib/utils/kit/calculations'
import {
  formatPrice as formatPriceHelper,
  annualToMonthly,
} from '@/lib/utils/product-helpers'
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
  const [expandedAvailableKit, setExpandedAvailableKit] = useState<
    string | null
  >(null)

  const selectedKitsCount = Object.values(selectedKits).reduce(
    (sum, qty) => sum + qty,
    0,
  )

  const selectedKitsTotalPrice = Object.entries(selectedKits).reduce(
    (sum, [kitId, quantity]) => {
      const kit = availableKits.find((k) => k.id === kitId)
      const period =
        selectedMode === 'location' ? ('3ans' as const) : ('1an' as const)
      return (
        sum +
        (kit
          ? calculateKitPrice(kit.kitProducts, selectedMode, period) * quantity
          : 0)
      )
    },
    0,
  )

  const availableStyles = Array.from(
    new Set(availableKits.map((kit) => kit.style).filter(Boolean)),
  )

  return (
    <Card className="pt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-900">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xl">Catalogue des Kits</span>
              <p className="text-sm font-normal text-blue-700 mt-1">
                Sélectionnez les kits à ajouter à votre projet
              </p>
            </div>
          </div>

          {selectedKitsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-blue-300 rounded-xl p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">
                    {selectedKitsCount} kit
                    {selectedKitsCount > 1 ? 's' : ''} sélectionné
                    {selectedKitsCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-green-600 font-medium">
                    {selectedMode === 'location'
                      ? `${formatPriceHelper(annualToMonthly(selectedKitsTotalPrice))}/mois (base 3 ans)`
                      : formatPriceHelper(selectedKitsTotalPrice)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={onAddSelectedKits}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </div>
            </motion.div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 bg-white rounded-xl p-4 border border-blue-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom de kit..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedStyle}
              onChange={(e) => onStyleChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30C1BD] bg-white min-w-[140px]"
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

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement du catalogue...</p>
            </div>
          ) : availableKits.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun kit trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm || selectedStyle
                  ? 'Aucun kit ne correspond à vos critères de recherche'
                  : 'Le catalogue de kits est actuellement vide'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onAddSelectedKits}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
