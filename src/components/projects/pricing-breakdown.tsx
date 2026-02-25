'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitCompare, FileText } from 'lucide-react'
import type { Project } from '@/lib/types/project'
import { PurchaseRentalComparison } from './purchase-rental-comparison'
import { PricingDetailedAnalysis } from './pricing-detailed-analysis'

interface PricingBreakdownProps {
  project: Project
}

const SUB_TAB_TRIGGER_CLASS =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80 hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'

/**
 * Pricing breakdown container with sub-tabs for comparison and detailed analysis.
 * @param props - Project data for pricing calculations
 * @returns Tabbed pricing view with comparison and detailed analysis sub-views
 */
export function PricingBreakdown({ project }: PricingBreakdownProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="comparison" className="space-y-8">
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 text-gray-500 shadow-lg border border-gray-200/50 backdrop-blur-sm min-w-full lg:min-w-0">
              <div className="flex space-x-1 w-full lg:w-auto">
                <TabsTrigger
                  value="comparison"
                  className={SUB_TAB_TRIGGER_CLASS}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300"></div>
                  <GitCompare className="w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200" />
                  <span className="text-sm font-medium">Comparaison</span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-12 transition-all duration-300"></div>
                </TabsTrigger>

                <TabsTrigger value="detailed" className={SUB_TAB_TRIGGER_CLASS}>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300"></div>
                  <FileText className="w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200" />
                  <span className="text-sm font-medium">Analyse détaillée</span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-12 transition-all duration-300"></div>
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
        </div>

        <TabsContent value="comparison" className="space-y-6 mt-8">
          <PurchaseRentalComparison project={project} />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6 mt-8">
          <PricingDetailedAnalysis project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
