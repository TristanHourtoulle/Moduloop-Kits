'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { Project } from '@/lib/types/project';
import { ProjectCardPricingMode } from '@/lib/types/project-card';
import {
  calculateProjectCardMetrics,
  getSurfaceMode,
} from '@/lib/utils/project-card-helpers';
import { QuickStatsBar } from './project-card/quick-stats-bar';
import {
  PriceMetricCard,
  SurfaceMetricCard,
  CO2MetricCard,
  KitSummaryCard,
} from './project-card/metric-cards';
import { Package, Eye, Edit3, ShoppingCart, Home } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void | Promise<void>;
}

/**
 * Project Card Component - Enhanced version
 * Displays project information with mode-aware pricing, surface, and environmental metrics
 */
export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  // Local state for pricing mode (each card is independent)
  const [pricingMode, setPricingMode] = useState<ProjectCardPricingMode>('achat');

  // Calculate all metrics based on current mode
  const metrics = useMemo(
    () => calculateProjectCardMetrics(project, pricingMode),
    [project, pricingMode]
  );

  // Get surface display mode
  const surfaceMode = useMemo(() => getSurfaceMode(project), [project]);

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return {
          color: 'bg-green-50 text-green-700 border-green-200',
          dot: 'bg-green-500',
          label: 'Actif',
        };
      case 'TERMINE':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Terminé',
        };
      case 'EN_PAUSE':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'En pause',
        };
      case 'ARCHIVE':
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-500',
          label: 'Archivé',
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-500',
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <Card
      className='h-full group overflow-hidden transition-transform duration-200 hover:-translate-y-1'
      style={{ pointerEvents: 'auto' }}
    >
        {/* Header Section */}
        <div className='p-6 pb-4 space-y-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0 space-y-2'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0'>
                  <Package className='h-5 w-5 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='text-lg font-semibold text-foreground transition-colors duration-200 truncate'>
                    {project.nom}
                  </h3>
                  {project.description && (
                    <p className='text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Badge
              className={`${statusConfig.color} text-xs font-medium px-3 py-1 border ml-3 flex-shrink-0`}
            >
              <div
                className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-2`}
              />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Mode Selector */}
          <div className='flex gap-1 mb-4'>
            <Button
              variant={pricingMode === 'achat' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setPricingMode('achat')}
              className={`h-7 px-2 text-xs flex-1 ${
                pricingMode === 'achat'
                  ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90'
                  : ''
              }`}
            >
              <ShoppingCart className='w-3 h-3 mr-1' />
              Achat
            </Button>
            <Button
              variant={pricingMode === 'location' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setPricingMode('location')}
              className={`h-7 px-2 text-xs flex-1 ${
                pricingMode === 'location'
                  ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90'
                  : ''
              }`}
            >
              <Home className='w-3 h-3 mr-1' />
              Location 3 ans
            </Button>
          </div>

          {/* Quick Stats Bar */}
          <QuickStatsBar
            kitCount={metrics.kitCount}
            productCount={metrics.productCount}
            totalUnits={metrics.totalUnits}
            createdAt={project.createdAt}
          />
        </div>

        {/* Metrics Grid */}
        <div className='px-6 pb-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
            <PriceMetricCard
              totalPrice={metrics.totalPrice}
              pricePerM2={metrics.pricePerM2}
              mode={pricingMode}
            />

            <SurfaceMetricCard
              totalSurface={project.totalSurface || 0}
              surfaceMode={surfaceMode}
            />

            <CO2MetricCard totalCO2={metrics.totalCO2} mode={pricingMode} />

            <KitSummaryCard
              kitCount={metrics.kitCount}
              totalUnits={metrics.totalUnits}
            />
          </div>
        </div>

        {/* Actions */}
        <div className='px-6 pb-6'>
          <div className='flex items-center gap-3 pt-2'>
            <Button asChild size='sm' className='flex-1'>
              <Link href={`/projects/${project.id}`}>
                <Eye className='w-4 h-4 mr-2' />
                Voir le projet
              </Link>
            </Button>

            <Button
              size='sm'
              variant='outline'
              className='hover:bg-primary/10 hover:text-primary hover:border-primary/30'
              onClick={() => {
                // TODO: Navigate to edit page or open edit modal
                console.log('Édition du projet:', project.id);
              }}
            >
              <Edit3 className='w-4 h-4' />
            </Button>

            {onDelete && (
              <DeleteConfirmDialog
                title='Supprimer le projet ?'
                itemName={project.nom}
                description='Tous les kits et données associés à ce projet seront également supprimés.'
                onConfirm={() => onDelete(project.id)}
                triggerVariant='outline'
                triggerSize='sm'
                triggerClassName='hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
              />
            )}
          </div>
        </div>
      </Card>
  );
}
