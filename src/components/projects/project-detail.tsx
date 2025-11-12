'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/lib/types/project';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Package,
  Leaf,
  Euro,
  Target,
  MoreHorizontal,
  FileText,
  BarChart3,
  Clock,
  ShoppingCart,
  Home,
} from 'lucide-react';
import {
  type PurchaseRentalMode,
  type ProductPeriod,
} from '@/lib/schemas/product';
import {
  getProductPricing,
  formatPrice,
} from '@/lib/utils/product-helpers';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { EnvironmentalMetrics } from './environmental-metrics';
import { PricingBreakdown } from './pricing-breakdown';
import { KitsTab } from './kits-tab';
import { EditProjectDialog } from './edit-project-dialog';
import { ProjectHistory } from './project-history';
import { ProjectSurfaceManager } from './project-surface-manager';
import { useDialog } from '@/components/providers/dialog-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectDetailProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
  refreshProject?: () => Promise<void>;
}

export function ProjectDetail({
  project,
  onProjectUpdate,
  refreshProject,
}: ProjectDetailProps) {
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [pricingMode, setPricingMode] = useState<PurchaseRentalMode>('achat');
  const [pricingPeriod, setPricingPeriod] = useState<ProductPeriod>('1an');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { showError, showSuccess, showConfirm } = useDialog();

  // Get active tab from URL or default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  // Function to update URL with new tab
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Calculate total prices for all modes and periods
  const totalPrices = useMemo(() => {
    if (!project.projectKits) return { achat: 0, location1an: 0, location2ans: 0, location3ans: 0 };

    let achat = 0;
    let location1an = 0;
    let location2ans = 0;
    let location3ans = 0;

    project.projectKits.forEach((projectKit) => {
      const kit = projectKit.kit;
      if (!kit || !kit.kitProducts) return;

      kit.kitProducts.forEach((kitProduct) => {
        const product = kitProduct.product;
        if (product) {
          const quantite = kitProduct.quantite * projectKit.quantite;

          // Calculate achat price
          const pricingAchat = getProductPricing(product, 'achat', '1an');
          achat += (pricingAchat.prixVente || 0) * quantite;

          // Calculate location prices
          const pricing1an = getProductPricing(product, 'location', '1an');
          location1an += (pricing1an.prixVente || 0) * quantite;

          const pricing2ans = getProductPricing(product, 'location', '2ans');
          location2ans += (pricing2ans.prixVente || 0) * quantite;

          const pricing3ans = getProductPricing(product, 'location', '3ans');
          location3ans += (pricing3ans.prixVente || 0) * quantite;
        }
      });
    });

    return { achat, location1an, location2ans, location3ans };
  }, [project.projectKits]);

  // Get current displayed price based on mode and period
  const currentPrice = useMemo(() => {
    if (pricingMode === 'achat') {
      return totalPrices.achat;
    } else {
      if (pricingPeriod === '1an') return totalPrices.location1an;
      if (pricingPeriod === '2ans') return totalPrices.location2ans;
      return totalPrices.location3ans;
    }
  }, [pricingMode, pricingPeriod, totalPrices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return 'bg-green-100 text-green-800';
      case 'TERMINE':
        return 'bg-blue-100 text-blue-800';
      case 'EN_PAUSE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return '🟢';
      case 'TERMINE':
        return '🔵';
      case 'EN_PAUSE':
        return '🟡';
      case 'ARCHIVE':
        return '⚫';
      default:
        return '⚪';
    }
  };

  // Gestionnaire pour supprimer le projet
  const handleDeleteProject = async () => {
    const confirmed = await showConfirm(
      'Supprimer le projet',
      'Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.',
      'Supprimer',
      'Annuler'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du projet');
      }

      router.push('/projects');
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      await showError(
        'Erreur',
        'Une erreur est survenue lors de la suppression du projet. Veuillez réessayer.'
      );
    }
  };

  // Gestionnaire pour ajouter des kits
  const handleAddKits = async (kits: { kitId: string; quantite: number }[]) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/kits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kits }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout des kits");
      }

      // Récupérer les données mises à jour du projet
      if (refreshProject) {
        const updatedResponse = await fetch(`/api/projects/${project.id}`, {
          cache: 'no-store',
        });

        if (updatedResponse.ok) {
          const updatedProject = await updatedResponse.json();
          if (onProjectUpdate) {
            onProjectUpdate(updatedProject);
          }
          await showSuccess(
            'Succès',
            'Les kits ont été ajoutés avec succès au projet.'
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout des kits:", error);
      await showError(
        'Erreur',
        "Une erreur est survenue lors de l'ajout des kits. Veuillez réessayer."
      );
    }
  };

  // Gestionnaire pour modifier la quantité d'un kit
  const handleUpdateKitQuantity = async (
    projectKitId: string,
    newQuantity: number
  ) => {
    try {
      const response = await fetch(
        `/api/projects/${project.id}/kits/${projectKitId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantite: newQuantity }),
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de la quantité');
      }

      // Récupérer les données mises à jour
      const updatedResponse = await fetch(`/api/projects/${project.id}`, {
        cache: 'no-store',
      });

      if (updatedResponse.ok) {
        const updatedProject = await updatedResponse.json();
        if (onProjectUpdate) {
          onProjectUpdate(updatedProject);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la quantité:', error);
      await showError(
        'Erreur',
        'Une erreur est survenue lors de la modification de la quantité. Veuillez réessayer.'
      );
    }
  };

  // Gestionnaire pour supprimer un kit du projet
  const handleRemoveKit = async (projectKitId: string) => {
    const confirmed = await showConfirm(
      'Retirer le kit',
      'Êtes-vous sûr de vouloir retirer ce kit du projet ?',
      'Retirer',
      'Annuler'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${project.id}/kits/${projectKitId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du kit');
      }

      // Récupérer les données mises à jour
      const updatedResponse = await fetch(`/api/projects/${project.id}`, {
        cache: 'no-store',
      });

      if (updatedResponse.ok) {
        const updatedProject = await updatedResponse.json();
        if (onProjectUpdate) {
          onProjectUpdate(updatedProject);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du kit:', error);
      await showError(
        'Erreur',
        'Une erreur est survenue lors de la suppression du kit. Veuillez réessayer.'
      );
    }
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject);
    }
    if (refreshProject) {
      refreshProject();
    }
  };

  return (
    <div className='min-h-screen bg-background w-full'>
      <div className='max-w-7xl mx-auto px-6 py-8 space-y-8'>
        {/* Header simplifié */}
        <div className='space-y-4'>
          {/* Navigation et statut */}
          <div className='flex items-center justify-between'>
            <Button
              variant='ghost'
              size='sm'
              className='text-muted-foreground'
              onClick={() => {
                router.refresh();
                router.push('/projects');
              }}
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Retour aux projets
            </Button>
            
            <div className='flex items-center gap-2'>
              <Badge
                className={`${getStatusColor(
                  project.status
                )} text-sm font-medium px-3 py-1`}
              >
                {getStatusIcon(project.status)} {project.status}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <MoreHorizontal className='w-4 h-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => setIsEditProjectDialogOpen(true)}>
                    <Edit3 className='w-4 h-4 mr-2' />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDeleteProject}
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Titre et description */}
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold text-foreground'>
              {project.nom}
            </h1>
            {project.description && (
              <p className='text-muted-foreground text-lg max-w-3xl'>
                {project.description}
              </p>
            )}
            <p className='text-sm text-muted-foreground'>
              Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Tabs navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='relative'
          >
            {/* Navigation d'onglets moderne */}
            <div className='overflow-x-auto scrollbar-hide'>
              <TabsList className='inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 text-gray-500 shadow-lg border border-gray-200/50 backdrop-blur-sm min-w-full lg:min-w-0'>
                <div className='flex space-x-1 w-full lg:w-auto'>
                  <TabsTrigger
                    value='overview'
                    className='relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80
                    hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300'></div>
                    <BarChart3 className='w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200' />
                    <span className='hidden sm:inline text-sm font-medium'>Vue d&apos;ensemble</span>
                    <span className='sm:hidden text-sm font-medium'>Vue</span>
                    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-8 transition-all duration-300'></div>
                  </TabsTrigger>

                  <TabsTrigger
                    value='kits'
                    className='relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80
                    hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300'></div>
                    <Package className='w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200' />
                    <span className='hidden sm:inline text-sm font-medium'>Kits</span>
                    <span className='sm:hidden text-sm font-medium'>Kits</span>
                    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-8 transition-all duration-300'></div>
                  </TabsTrigger>

                  <TabsTrigger
                    value='pricing'
                    className='relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80
                    hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300'></div>
                    <Euro className='w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200' />
                    <span className='hidden sm:inline text-sm font-medium'>Tarification</span>
                    <span className='sm:hidden text-sm font-medium'>Prix</span>
                    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-8 transition-all duration-300'></div>
                  </TabsTrigger>

                  <TabsTrigger
                    value='environmental'
                    className='relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80
                    hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300'></div>
                    <Leaf className='w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200' />
                    <span className='hidden sm:inline text-sm font-medium'>Impact</span>
                    <span className='sm:hidden text-sm font-medium'>Impact</span>
                    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-8 transition-all duration-300'></div>
                  </TabsTrigger>

                  <TabsTrigger
                    value='timeline'
                    className='relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80
                    hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300'></div>
                    <Clock className='w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200' />
                    <span className='hidden sm:inline text-sm font-medium'>Historique</span>
                    <span className='sm:hidden text-sm font-medium'>Temps</span>
                    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-8 transition-all duration-300'></div>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>
          </motion.div>

          {/* Tab content wrapper for overview */}
          <TabsContent value='overview' className='space-y-6'>
            {/* Sélecteur de mode et période */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='flex flex-col sm:flex-row items-center justify-center gap-4 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm'
            >
          {/* Mode selector */}
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-700'>Mode :</span>
            <div className='flex gap-2'>
              <button
                onClick={() => setPricingMode('achat')}
                className={`h-10 px-4 text-sm rounded-xl flex items-center justify-center gap-2 transition-all font-medium ${
                  pricingMode === 'achat'
                    ? 'bg-[#30C1BD] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ShoppingCart className='w-4 h-4' />
                Achat
              </button>
              <button
                onClick={() => setPricingMode('location')}
                className={`h-10 px-4 text-sm rounded-xl flex items-center justify-center gap-2 transition-all font-medium ${
                  pricingMode === 'location'
                    ? 'bg-[#30C1BD] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Home className='w-4 h-4' />
                Location
              </button>
            </div>
          </div>

          {/* Period selector for location */}
          {pricingMode === 'location' && (
            <>
              <div className='hidden sm:block w-px h-8 bg-gray-300'></div>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium text-gray-700'>Période :</span>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setPricingPeriod('1an')}
                    className={`h-10 px-4 text-sm rounded-xl transition-all font-medium ${
                      pricingPeriod === '1an'
                        ? 'bg-[#30C1BD] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    1 an
                  </button>
                  <button
                    onClick={() => setPricingPeriod('2ans')}
                    className={`h-10 px-4 text-sm rounded-xl transition-all font-medium ${
                      pricingPeriod === '2ans'
                        ? 'bg-[#30C1BD] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    2 ans
                  </button>
                  <button
                    onClick={() => setPricingPeriod('3ans')}
                    className={`h-10 px-4 text-sm rounded-xl transition-all font-medium ${
                      pricingPeriod === '3ans'
                        ? 'bg-[#30C1BD] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    3 ans
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Métriques principales avec design moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`grid grid-cols-1 gap-6 ${pricingMode === 'location' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
        >
          {/* Card 1: Prix Total */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            className='group relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-elegant overflow-hidden'
          >
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/[0.02] to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            <div className='relative z-10'>
              <div className='w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
                <Euro className='w-6 h-6 text-green-600' />
              </div>
              <p className='text-3xl font-bold text-green-900 mb-2'>
                {formatPrice(currentPrice)}
              </p>
              <p className='text-sm text-green-700 font-medium'>Prix Total</p>
              {project.totalSurface && project.totalSurface > 0 && (
                <div className='mt-3 pt-3 border-t border-green-200'>
                  <p className='text-xs text-green-600 mb-1'>Prix moyen/m²</p>
                  <p className='text-lg font-bold text-green-800'>
                    {Math.round(currentPrice / project.totalSurface).toLocaleString('fr-FR')}€/m²
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 2: Impact CO₂ (Location uniquement) */}
          {pricingMode === 'location' && (
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className='group relative bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-elegant overflow-hidden'
            >
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-green-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              <div className='relative z-10'>
                <div className='w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
                  <Leaf className='w-6 h-6 text-emerald-600' />
                </div>
                <p className='text-3xl font-bold text-emerald-900 mb-2'>
                  {project.totalImpact?.rechauffementClimatique?.toFixed(1) || '0'} kg
                </p>
                <p className='text-sm text-emerald-700 font-medium'>CO₂ économisé</p>
                <p className='text-xs text-emerald-600 mt-1'>(Location)</p>
              </div>
            </motion.div>
          )}

          {/* Card 3: Surface */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            className='group relative bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-elegant overflow-hidden'
          >
            <div className='absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            <div className='relative z-10'>
              <div className='w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
                <Target className='w-6 h-6 text-orange-600' />
              </div>
              <p className='text-3xl font-bold text-orange-900 mb-2'>
                {project.totalSurface?.toFixed(1) || '0'} m²
              </p>
              <p className='text-sm text-orange-700 font-medium'>Surface</p>
            </div>
          </motion.div>
        </motion.div>

            {/* Résumé du projet */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='lg:col-span-2 space-y-6'
              >
                <div className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-3 bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 rounded-xl'>
                      <FileText className='w-6 h-6 text-[#30C1BD]' />
                    </div>
                    <div>
                      <h2 className='text-2xl font-bold text-gray-900'>Aperçu du projet</h2>
                      <p className='text-gray-600'>Informations générales et métriques clés</p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-6'>
                      <div>
                        <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>Statut</label>
                        <div className='mt-1 flex items-center gap-2'>
                          <span className='text-2xl'>{getStatusIcon(project.status)}</span>
                          <span className='text-lg font-semibold text-gray-900'>{project.status}</span>
                        </div>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>Créé le</label>
                        <div className='mt-1 text-lg text-gray-900'>
                          {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {project.description && (
                      <div>
                        <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>Description</label>
                        <div className='mt-1 text-gray-900 leading-relaxed'>
                          {project.description}
                        </div>
                      </div>
                    )}

                    <div className='pt-4 border-t border-gray-200'>
                      <div className='grid grid-cols-2 gap-6'>
                        <div className='text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200'>
                          <div className='text-2xl font-bold text-green-900 mb-1'>
                            {project.projectKits?.reduce((acc, pk) => acc + pk.quantite, 0) || 0}
                          </div>
                          <div className='text-sm text-green-700 font-medium'>Unités totales</div>
                        </div>
                        <div className='text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200'>
                          <div className='text-2xl font-bold text-blue-900 mb-1'>
                            {project.projectKits?.length || 0}
                          </div>
                          <div className='text-sm text-blue-700 font-medium'>Types de kits</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions rapides */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='space-y-4'
              >
                <div className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>Actions rapides</h3>
                  <div className='space-y-3'>
                    <Button
                      onClick={() => setIsEditProjectDialogOpen(true)}
                      className='w-full bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white justify-start gap-3 h-12'
                    >
                      <Edit3 className='w-5 h-5' />
                      Modifier le projet
                    </Button>
                  </div>
                </div>

                {/* Gestion de la surface */}
                <ProjectSurfaceManager
                  projectId={project.id}
                  currentSurface={project.totalSurface || 0}
                  manualSurface={project.surfaceManual}
                  isOverride={project.surfaceOverride || false}
                  onUpdate={() => {
                    if (refreshProject) {
                      refreshProject();
                    }
                  }}
                />

                {/* Métriques rapides */}
                {project.projectKits && project.projectKits.length > 0 && (() => {
                  // Calculate total surface from all kits
                  const totalSurfaceM2 = project.projectKits.reduce((total, projectKit) => {
                    const kitSurface = projectKit.kit?.surfaceM2 || 0;
                    return total + (kitSurface * projectKit.quantite);
                  }, 0);

                  return totalSurfaceM2 > 0 ? (
                    <div className='bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>Aperçu financier</h3>
                      <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-600'>Prix moyen/m²</span>
                          <span className='font-semibold text-gray-900'>
                            {Math.round((project.totalPrix || 0) / totalSurfaceM2).toLocaleString('fr-FR')}€/m²
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </motion.div>
            </div>
          </TabsContent>

          {/* Onglet Kits */}
          <TabsContent value='kits' className='space-y-6'>
            <KitsTab
              projectKits={project.projectKits || []}
              onAddKits={handleAddKits}
              onUpdateQuantity={handleUpdateKitQuantity}
              onRemoveKit={handleRemoveKit}
            />
          </TabsContent>

          {/* Onglet Tarification amélioré */}
          <TabsContent value='pricing' className='space-y-6'>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm'
            >
              <div className='flex items-center gap-4 mb-6'>
                <div className='p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl'>
                  <Euro className='w-6 h-6 text-green-600' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>Analyse financière</h2>
                  <p className='text-gray-600'>Détail des coûts et marges par mode et période</p>
                </div>
              </div>
              <PricingBreakdown project={project} />
            </motion.div>
          </TabsContent>

          {/* Onglet Impact environnemental amélioré */}
          <TabsContent value='environmental' className='space-y-6'>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm'
            >
              <div className='flex items-center gap-4 mb-6'>
                <div className='p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl'>
                  <Leaf className='w-6 h-6 text-green-600' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>Impact environnemental</h2>
                  <p className='text-gray-600'>Analyse de l&apos;empreinte carbone et des économies</p>
                </div>
              </div>
              <EnvironmentalMetrics project={project} />
            </motion.div>
          </TabsContent>
          
          {/* Nouvel onglet Historique */}
          <TabsContent value='timeline' className='space-y-6'>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm'
            >
              <div className='flex items-center gap-4 mb-6'>
                <div className='p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl'>
                  <Clock className='w-6 h-6 text-purple-600' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>Historique du projet</h2>
                  <p className='text-gray-600'>Chronologie et événements importants</p>
                </div>
              </div>
              
              <ProjectHistory 
                projectId={project.id}
                projectCreatedAt={project.createdAt}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

      {/* Modales */}
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
  );
}
