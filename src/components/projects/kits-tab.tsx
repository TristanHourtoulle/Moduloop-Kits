'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Package, Plus, XCircle, BarChart3, Euro, ShoppingBag } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { ProjectKit } from '@/lib/types/project'
import { type PurchaseRentalMode } from '@/lib/schemas/product'
import { calculateKitPrice } from '@/lib/utils/kit/calculations'
import { formatPrice as formatPriceHelper, annualToMonthly } from '@/lib/utils/product-helpers'
import { PurchaseRentalModeSelector } from './shared/purchase-rental-mode-selector'
import { KitsCatalogSection } from './kits-catalog-section'
import { ProjectKitCard } from './project-kit-card'
import type { AvailableKit } from './available-kit-card'

interface KitsTabProps {
  projectKits: ProjectKit[]
  onAddKits: (kits: { kitId: string; quantite: number }[]) => Promise<void>
  onUpdateQuantity?: (projectKitId: string, newQuantity: number) => Promise<void>
  onRemoveKit?: (projectKitId: string) => Promise<void>
}

/**
 * Kit management tab for a project.
 * @param props - Project kits and CRUD handlers
 * @returns Tab with catalog browsing and project kit management
 */
export function KitsTab({ projectKits, onAddKits, onUpdateQuantity, onRemoveKit }: KitsTabProps) {
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat')
  const [showAddSection, setShowAddSection] = useState(false)
  const [availableKits, setAvailableKits] = useState<AvailableKit[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [selectedKits, setSelectedKits] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [expandedProjectKit, setExpandedProjectKit] = useState<string | null>(null)
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [tempQuantity, setTempQuantity] = useState<number>(0)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (showAddSection) {
      fetchAvailableKits()
    }
  }, [showAddSection, debouncedSearchTerm, selectedStyle])

  const fetchAvailableKits = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
      if (selectedStyle) params.append('style', selectedStyle)

      const response = await fetch(`/api/kits?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableKits(data)
      }
    } catch {
      // Silently fail - loading state is reset in finally
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (kitId: string, change: number) => {
    const currentQuantity = selectedKits[kitId] || 0
    const newQuantity = Math.max(0, currentQuantity + change)

    if (newQuantity === 0) {
      const { [kitId]: _removed, ...rest } = selectedKits
      setSelectedKits(rest)
    } else {
      setSelectedKits((prev) => ({ ...prev, [kitId]: newQuantity }))
    }
  }

  const handleAddSelectedKits = async () => {
    const kitsToAdd = Object.entries(selectedKits)
      .filter(([, quantity]) => quantity > 0)
      .map(([kitId, quantity]) => ({ kitId, quantite: quantity }))

    if (kitsToAdd.length > 0) {
      await onAddKits(kitsToAdd)
      setSelectedKits({})
      setShowAddSection(false)
    }
  }

  const startEditingQuantity = (projectKitId: string, currentQuantity: number) => {
    setEditingQuantity(projectKitId)
    setTempQuantity(currentQuantity)
  }

  const saveQuantity = async (projectKitId: string) => {
    if (onUpdateQuantity && tempQuantity > 0) {
      await onUpdateQuantity(projectKitId, tempQuantity)
      setEditingQuantity(null)
      setTempQuantity(0)
    }
  }

  const cancelEditingQuantity = () => {
    setEditingQuantity(null)
    setTempQuantity(0)
  }

  const totalUnits = projectKits.reduce((sum, pk) => sum + pk.quantite, 0)
  const totalValue = projectKits.reduce((sum, pk) => {
    if (!pk.kit?.kitProducts) return sum
    const period = selectedMode === 'location' ? ('3ans' as const) : ('1an' as const)
    return sum + calculateKitPrice(pk.kit.kitProducts, selectedMode, period) * pk.quantite
  }, 0)

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 p-3">
              <Package className="h-6 w-6 text-[#30C1BD]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestion des Kits</h2>
              <p className="text-gray-600">
                {projectKits.length} kit{projectKits.length > 1 ? 's' : ''} configuré
                {projectKits.length > 1 ? 's' : ''} dans ce projet
              </p>
            </div>
          </div>

          <PurchaseRentalModeSelector mode={selectedMode} onModeChange={setSelectedMode} />
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={() => setShowAddSection(!showAddSection)}
            className={`flex items-center gap-2 ${
              showAddSection
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-[#30C1BD] text-white hover:bg-[#30C1BD]/90'
            }`}
          >
            {showAddSection ? (
              <>
                <XCircle className="h-4 w-4" />
                Fermer le catalogue
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Parcourir le catalogue
              </>
            )}
          </Button>

          {projectKits.length > 0 && (
            <div className="flex flex-col items-start gap-3 text-sm text-gray-600 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Total: {totalUnits} unités</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                <span>
                  Valeur:{' '}
                  {selectedMode === 'location'
                    ? `${formatPriceHelper(annualToMonthly(totalValue))}/mois (base 3 ans)`
                    : formatPriceHelper(totalValue)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <KitsCatalogSection
              availableKits={availableKits}
              selectedMode={selectedMode}
              selectedKits={selectedKits}
              loading={loading}
              searchTerm={searchTerm}
              selectedStyle={selectedStyle}
              onSearchTermChange={setSearchTerm}
              onStyleChange={setSelectedStyle}
              onQuantityChange={handleQuantityChange}
              onAddSelectedKits={handleAddSelectedKits}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {projectKits.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 pt-6">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Aucun kit dans ce projet</h3>
              <p className="mb-6 max-w-md text-center text-gray-500">
                Commencez par parcourir notre catalogue pour ajouter des kits à votre projet et voir
                leurs métriques détaillées.
              </p>
              <Button
                onClick={() => setShowAddSection(true)}
                className="bg-[#30C1BD] text-white hover:bg-[#30C1BD]/90"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Parcourir le catalogue
              </Button>
            </CardContent>
          </Card>
        ) : (
          projectKits.map((projectKit, index) => (
            <ProjectKitCard
              key={projectKit.id}
              projectKit={projectKit}
              index={index}
              selectedMode={selectedMode}
              isExpanded={expandedProjectKit === projectKit.id}
              editingQuantity={editingQuantity}
              tempQuantity={tempQuantity}
              onToggleExpand={setExpandedProjectKit}
              onStartEditing={startEditingQuantity}
              onSaveQuantity={saveQuantity}
              onCancelEditing={cancelEditingQuantity}
              onTempQuantityChange={setTempQuantity}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveKit={onRemoveKit}
            />
          ))
        )}
      </div>
    </div>
  )
}
