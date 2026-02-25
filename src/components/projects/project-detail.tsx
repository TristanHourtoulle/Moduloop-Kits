'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Package,
  Leaf,
  Euro,
  MoreHorizontal,
  BarChart3,
  Clock,
} from 'lucide-react'
import { type PurchaseRentalMode, type ProductPeriod } from '@/lib/schemas/product'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { calculateProjectPriceTotals } from '@/lib/utils/project/calculations'
import { getStatusColor, getStatusIcon } from '@/lib/utils/project/status'
import { useProjectActions } from '@/hooks/use-project-actions'
import { useDialog } from '@/components/providers/dialog-provider'
import { ProjectOverviewTab } from './project-overview-tab'
import { EnvironmentalMetrics } from './environmental-metrics'
import { PricingBreakdown } from './pricing-breakdown'
import { KitsTab } from './kits-tab'
import { EditProjectDialog } from './edit-project-dialog'
import { ProjectHistory } from './project-history'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Project } from '@/lib/types/project'
import { ProjectPdfDownloadButton } from '@/features/pdf/project-pdf-download-button'

interface ProjectDetailProps {
  project: Project
  onProjectUpdate?: (updatedProject: Project) => void
  refreshProject?: () => Promise<void>
}

const TAB_TRIGGER_CLASS =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80 hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'

/**
 * Project detail page shell managing tab routing, state, and composition of sub-views.
 * @param props - Project data and update callbacks
 * @returns Full project detail page with tabs for overview, kits, pricing, environment, and history
 */
export function ProjectDetail({ project, onProjectUpdate, refreshProject }: ProjectDetailProps) {
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false)
  const [pricingMode, setPricingMode] = useState<PurchaseRentalMode>('achat')
  const [pricingPeriod, setPricingPeriod] = useState<ProductPeriod>('1an')
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { showError, showSuccess } = useDialog()

  const {
    handleDeleteProject,
    handleAddKits,
    handleUpdateKitQuantity,
    handleRemoveKit,
    handleProjectUpdated,
  } = useProjectActions({ project, onProjectUpdate, refreshProject })

  const activeTab = searchParams.get('tab') || 'overview'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const totalPrices = useMemo(() => calculateProjectPriceTotals(project), [project])

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                router.refresh()
                router.push('/projects')
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Button>

            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(project.status)} px-3 py-1 text-sm font-medium`}>
                {getStatusIcon(project.status)} {project.status}
              </Badge>

              <ProjectPdfDownloadButton project={project} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditProjectDialogOpen(true)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteProject}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold">{project.nom}</h1>
            {project.description && (
              <p className="text-muted-foreground max-w-3xl text-lg">{project.description}</p>
            )}
            <p className="text-muted-foreground text-sm">
              Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="scrollbar-hide overflow-x-auto">
              <TabsList className="inline-flex h-12 min-w-full items-center justify-center rounded-2xl border border-gray-200/50 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 text-gray-500 shadow-lg backdrop-blur-sm lg:min-w-0">
                <div className="flex w-full space-x-1 lg:w-auto">
                  <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-5"></div>
                    <BarChart3 className="mr-2 h-4 w-4 transition-colors duration-200 group-data-[state=active]:text-[#30C1BD]" />
                    <span className="hidden text-sm font-medium sm:inline">
                      Vue d&apos;ensemble
                    </span>
                    <span className="text-sm font-medium sm:hidden">Vue</span>
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-[#30C1BD] to-blue-500 transition-all duration-300 group-data-[state=active]:w-8"></div>
                  </TabsTrigger>

                  <TabsTrigger value="kits" className={TAB_TRIGGER_CLASS}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-5"></div>
                    <Package className="mr-2 h-4 w-4 transition-colors duration-200 group-data-[state=active]:text-[#30C1BD]" />
                    <span className="hidden text-sm font-medium sm:inline">Kits</span>
                    <span className="text-sm font-medium sm:hidden">Kits</span>
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-[#30C1BD] to-blue-500 transition-all duration-300 group-data-[state=active]:w-8"></div>
                  </TabsTrigger>

                  <TabsTrigger value="pricing" className={TAB_TRIGGER_CLASS}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-5"></div>
                    <Euro className="mr-2 h-4 w-4 transition-colors duration-200 group-data-[state=active]:text-[#30C1BD]" />
                    <span className="hidden text-sm font-medium sm:inline">Tarification</span>
                    <span className="text-sm font-medium sm:hidden">Prix</span>
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-[#30C1BD] to-blue-500 transition-all duration-300 group-data-[state=active]:w-8"></div>
                  </TabsTrigger>

                  <TabsTrigger value="environmental" className={TAB_TRIGGER_CLASS}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-5"></div>
                    <Leaf className="mr-2 h-4 w-4 transition-colors duration-200 group-data-[state=active]:text-[#30C1BD]" />
                    <span className="hidden text-sm font-medium sm:inline">Impact</span>
                    <span className="text-sm font-medium sm:hidden">Impact</span>
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-[#30C1BD] to-blue-500 transition-all duration-300 group-data-[state=active]:w-8"></div>
                  </TabsTrigger>

                  <TabsTrigger value="timeline" className={TAB_TRIGGER_CLASS}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-5"></div>
                    <Clock className="mr-2 h-4 w-4 transition-colors duration-200 group-data-[state=active]:text-[#30C1BD]" />
                    <span className="hidden text-sm font-medium sm:inline">Historique</span>
                    <span className="text-sm font-medium sm:hidden">Temps</span>
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-[#30C1BD] to-blue-500 transition-all duration-300 group-data-[state=active]:w-8"></div>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>
          </motion.div>

          <TabsContent value="overview" className="space-y-6">
            <ProjectOverviewTab
              project={project}
              pricingMode={pricingMode}
              pricingPeriod={pricingPeriod}
              totalPrices={totalPrices}
              onPricingModeChange={setPricingMode}
              onPricingPeriodChange={setPricingPeriod}
              onEditProject={() => setIsEditProjectDialogOpen(true)}
              onRefreshProject={refreshProject}
            />
          </TabsContent>

          <TabsContent value="kits" className="space-y-6">
            <KitsTab
              projectKits={project.projectKits || []}
              onAddKits={handleAddKits}
              onUpdateQuantity={handleUpdateKitQuantity}
              onRemoveKit={handleRemoveKit}
            />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3">
                  <Euro className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analyse financière</h2>
                  <p className="text-gray-600">Détail des coûts et marges par mode et période</p>
                </div>
              </div>
              <PricingBreakdown project={project} />
            </motion.div>
          </TabsContent>

          <TabsContent value="environmental" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Impact environnemental</h2>
                  <p className="text-gray-600">
                    Analyse de l&apos;empreinte carbone et des économies
                  </p>
                </div>
              </div>
              <EnvironmentalMetrics project={project} />
            </motion.div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 p-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Historique du projet</h2>
                  <p className="text-gray-600">Chronologie et événements importants</p>
                </div>
              </div>
              <ProjectHistory projectId={project.id} projectCreatedAt={project.createdAt} />
            </motion.div>
          </TabsContent>
        </Tabs>

        <AnimatePresence>
          {isEditProjectDialogOpen && (
            <EditProjectDialog
              isOpen={isEditProjectDialogOpen}
              project={project}
              onClose={() => setIsEditProjectDialogOpen(false)}
              onProjectUpdated={handleProjectUpdated}
              onError={(message) => showError('Erreur', message)}
              onSuccess={(message) => showSuccess('Succès', message)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
