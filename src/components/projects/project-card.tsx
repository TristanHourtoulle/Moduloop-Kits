'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/lib/types/project';
import { ProjectCardPricingMode } from '@/lib/types/project-card';
import {
  calculateProjectCardMetrics,
  getSurfaceMode,
} from '@/lib/utils/project-card-helpers';
import {
  Package,
  Eye,
  Edit3,
  ShoppingCart,
  Home,
  Calendar,
  Box,
  Layers,
  MapPin,
  Euro,
  Leaf,
  Trash2,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void | Promise<void>;
}

// Status configuration (extracted as constant for performance)
const STATUS_CONFIG = {
  ACTIF: {
    variant: 'default' as const,
    className: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
    label: 'Actif',
  },
  TERMINE: {
    variant: 'secondary' as const,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Terminé',
  },
  EN_PAUSE: {
    variant: 'outline' as const,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'En pause',
  },
  ARCHIVE: {
    variant: 'outline' as const,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-500',
    label: 'Archivé',
  },
} as const;

// Format number helper (memoization candidate)
const formatNumber = (num: number, decimals = 2): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Format date helper
const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Optimized Project Card Component - Pure shadcn/ui
 *
 * Performance improvements:
 * - Uses ONLY shadcn/ui components
 * - Proper Card component structure
 * - Memoized calculations
 * - Extracted constants
 * - Minimized re-renders
 * - Tabs for mode selection
 * - AlertDialog for delete confirmation
 */
export function ProjectCard({
  project,
  onDelete,
}: ProjectCardProps) {
  // Local state for pricing mode
  const [pricingMode, setPricingMode] =
    useState<ProjectCardPricingMode>('achat');

  // Memoized status config
  const statusConfig = useMemo(() => {
    return (
      STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] || {
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-500',
        label: project.status,
      }
    );
  }, [project.status]);

  // Memoized metrics calculation
  const metrics = useMemo(
    () => calculateProjectCardMetrics(project, pricingMode),
    [project, pricingMode]
  );

  // Memoized surface mode
  const surfaceMode = useMemo(() => getSurfaceMode(project), [project]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate">{project.nom}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
        </div>

        <CardAction>
          <Badge className={`${statusConfig.className} text-xs font-medium px-3 py-1 border`}>
            <div className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-2`} />
            {statusConfig.label}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mode Selector using Tabs */}
        <Tabs
          value={pricingMode}
          onValueChange={(value) => setPricingMode(value as ProjectCardPricingMode)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger
              value="achat"
              className="data-[state=active]:bg-[#30C1BD] data-[state=active]:text-white"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-medium">Achat</span>
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="data-[state=active]:bg-[#30C1BD] data-[state=active]:text-white"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-medium">Location 3 ans</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {metrics.kitCount} kit{metrics.kitCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5" />
            <span>
              {metrics.productCount} produit{metrics.productCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(project.createdAt)}</span>
          </div>
        </div>

        <Separator />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Price Metric */}
          <div className="rounded-lg border bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Euro className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {pricingMode === 'achat' ? 'Prix achat' : 'Prix location'}
              </span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {formatNumber(metrics.totalPrice, 0)} €
            </div>
            {metrics.pricePerM2 && metrics.pricePerM2 > 0 && (
              <div className="text-xs text-muted-foreground">
                {formatNumber(metrics.pricePerM2, 0)} €/m²
              </div>
            )}
          </div>

          {/* Surface Metric */}
          <div className="rounded-lg border bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Surface</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {formatNumber(project.totalSurface || 0, 0)} m²
            </div>
            <div className="text-xs text-muted-foreground">
              {surfaceMode === 'manual' ? 'Manuelle' : 'Calculée'}
            </div>
          </div>

          {/* CO2 Metric */}
          <div className="rounded-lg border bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Leaf className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Impact CO₂</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {formatNumber(metrics.totalCO2, 0)} kg
            </div>
            <div className="text-xs text-muted-foreground">
              {pricingMode === 'achat' ? 'Achat' : 'Location'}
            </div>
          </div>

          {/* Units Metric */}
          <div className="rounded-lg border bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Total unités</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {metrics.totalUnits}
            </div>
            <div className="text-xs text-muted-foreground">
              Dans {metrics.kitCount} kit{metrics.kitCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {/* View Project Button */}
        <Button asChild size="sm" className="flex-1">
          <Link href={`/projects/${project.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            Voir
          </Link>
        </Button>

        {/* Edit Project Button */}
        <Button
          size="sm"
          variant="outline"
          className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          asChild
        >
          <Link href={`/projects/${project.id}/modifier`}>
            <Edit3 className="w-4 h-4" />
          </Link>
        </Button>

        {/* Delete Project with AlertDialog */}
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le projet ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer le projet &quot;
                  {project.nom}&quot; ? Tous les kits et données associés à ce
                  projet seront également supprimés. Cette action est
                  irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(project.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
