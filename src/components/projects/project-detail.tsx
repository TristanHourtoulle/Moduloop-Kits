'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/lib/types/project';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Package,
  Leaf,
  Euro,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  Target,
  Zap,
  Droplets,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddKitModal } from './add-kit-modal';
import { EnvironmentalMetrics } from './environmental-metrics';
import { PricingBreakdown } from './pricing-breakdown';
import { KitsList } from './kits-list';
import { EditProjectDialog } from './edit-project-dialog';
import { useDialog } from '@/components/providers/dialog-provider';

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
  const [isAddKitModalOpen, setIsAddKitModalOpen] = useState(false);
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const router = useRouter();
  const { showError, showSuccess, showConfirm } = useDialog();

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
    setIsAddKitModalOpen(false);
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
    <div className='space-y-8'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-start justify-between'
      >
        <div className='flex items-center space-x-4'>
          <Button asChild variant='ghost' size='sm'>
            <Link href='/projects'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Retour
            </Link>
          </Button>

          <div>
            <h1 className='text-3xl font-bold text-[#30C1BD]'>{project.nom}</h1>
            {project.description && (
              <p className='text-gray-600 mt-2 max-w-2xl'>
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center space-x-3'>
          <Badge
            className={`${getStatusColor(
              project.status
            )} text-sm font-medium px-3 py-1`}
          >
            {getStatusIcon(project.status)} {project.status}
          </Badge>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsEditProjectDialogOpen(true)}
          >
            <Edit3 className='w-4 h-4 mr-2' />
            Modifier
          </Button>

          <Button
            variant='outline'
            size='sm'
            className='border-red-200 hover:bg-red-50 text-red-600'
            onClick={handleDeleteProject}
          >
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      </motion.div>

      {/* Métriques principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'
      >
        <Card className='bg-gradient-to-br from-[#30C1BD]/10 to-[#30C1BD]/20 border-[#30C1BD]/30 hover:shadow-md transition-all duration-200'>
          <CardContent className='p-4'>
            <div className='flex flex-col items-center text-center space-y-2'>
              <div className='w-10 h-10 bg-[#30C1BD]/20 rounded-full flex items-center justify-center'>
                <Euro className='w-5 h-5 text-[#30C1BD]' />
              </div>
              <div>
                <p className='text-xs font-medium text-[#30C1BD] mb-1'>
                  Prix Total
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {project.totalPrix?.toFixed(0) || '0'} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-[#30C1BD]/10 to-[#30C1BD]/20 border-[#30C1BD]/30 hover:shadow-md transition-all duration-200'>
          <CardContent className='p-4'>
            <div className='flex flex-col items-center text-center space-y-2'>
              <div className='w-10 h-10 bg-[#30C1BD]/20 rounded-full flex items-center justify-center'>
                <Leaf className='w-5 h-5 text-[#30C1BD]' />
              </div>
              <div>
                <p className='text-xs font-medium text-[#30C1BD] mb-1'>
                  Impact CO₂
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {project.totalImpact?.rechauffementClimatique?.toFixed(1) ||
                    '0'}{' '}
                  kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-[#30C1BD]/10 to-[#30C1BD]/20 border-[#30C1BD]/30 hover:shadow-md transition-all duration-200'>
          <CardContent className='p-4'>
            <div className='flex flex-col items-center text-center space-y-2'>
              <div className='w-10 h-10 bg-[#30C1BD]/20 rounded-full flex items-center justify-center'>
                <Package className='w-5 h-5 text-[#30C1BD]' />
              </div>
              <div>
                <p className='text-xs font-medium text-[#30C1BD] mb-1'>Kits</p>
                <p className='text-xl font-bold text-gray-900'>
                  {project.projectKits?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-[#30C1BD]/10 to-[#30C1BD]/20 border-[#30C1BD]/30 hover:shadow-md transition-all duration-200'>
          <CardContent className='p-4'>
            <div className='flex flex-col items-center text-center space-y-2'>
              <div className='w-10 h-10 bg-[#30C1BD]/20 rounded-full flex items-center justify-center'>
                <Calendar className='w-5 h-5 text-[#30C1BD]' />
              </div>
              <div>
                <p className='text-xs font-medium text-[#30C1BD] mb-1'>
                  Créé le
                </p>
                <p className='text-lg font-bold text-gray-900'>
                  {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-[#30C1BD]/10 to-[#30C1BD]/20 border-[#30C1BD]/30 hover:shadow-md transition-all duration-200'>
          <CardContent className='p-4'>
            <div className='flex flex-col items-center text-center space-y-2'>
              <div className='w-10 h-10 bg-[#30C1BD]/20 rounded-full flex items-center justify-center'>
                <Target className='w-5 h-5 text-[#30C1BD]' />
              </div>
              <div>
                <p className='text-xs font-medium text-[#30C1BD] mb-1'>
                  Surface totale
                </p>
                <p className='text-xl font-bold text-gray-900'>
                  {project.totalSurface?.toFixed(1) || '0'} m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs pour les détails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue='kits' className='space-y-8'>
          <TabsList className='inline-flex h-12 items-center justify-center rounded-xl bg-gray-50 p-1 text-gray-500 shadow-sm border border-gray-200'>
            <TabsTrigger
              value='kits'
              className='inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD]/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#30C1BD] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 data-[state=active]:hover:bg-[#30C1BD]/90'
            >
              <Package className='w-4 h-4 mr-2' />
              Kits
            </TabsTrigger>
            <TabsTrigger
              value='environmental'
              className='inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD]/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#30C1BD] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 data-[state=active]:hover:bg-[#30C1BD]/90'
            >
              <Leaf className='w-4 h-4 mr-2' />
              Impact Environnemental
            </TabsTrigger>
            <TabsTrigger
              value='pricing'
              className='inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD]/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#30C1BD] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 data-[state=active]:hover:bg-[#30C1BD]/90'
            >
              <Euro className='w-4 h-4 mr-2' />
              Prix & Coûts
            </TabsTrigger>
            <TabsTrigger
              value='analytics'
              className='inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD]/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#30C1BD] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 data-[state=active]:hover:bg-[#30C1BD]/90'
            >
              <BarChart3 className='w-4 h-4 mr-2' />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value='kits' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Kits du projet
              </h2>
              <Button
                onClick={() => setIsAddKitModalOpen(true)}
                className='bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white border-0'
              >
                <Plus className='w-4 h-4 mr-2' />
                Ajouter un kit
              </Button>
            </div>

            {project.projectKits && project.projectKits.length > 0 ? (
              <KitsList
                projectKits={project.projectKits}
                onUpdateQuantity={handleUpdateKitQuantity}
                onRemoveKit={handleRemoveKit}
              />
            ) : (
              <p className='text-gray-500 italic'>Aucun kit pour le moment</p>
            )}
          </TabsContent>

          <TabsContent value='environmental' className='space-y-6'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Impact environnemental
            </h2>
            {project.totalImpact ? (
              <EnvironmentalMetrics impact={project.totalImpact} />
            ) : (
              <p className='text-gray-500 italic'>
                Aucune donnée d'impact disponible
              </p>
            )}
          </TabsContent>

          <TabsContent value='pricing' className='space-y-6'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Détail des prix
            </h2>
            <PricingBreakdown project={project} />
          </TabsContent>

          <TabsContent value='analytics' className='space-y-6'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Analytics du projet
            </h2>
            <div className='text-center py-12 text-gray-500'>
              <BarChart3 className='w-16 h-16 mx-auto mb-4 text-gray-300' />
              <p>Analytics avancées à venir...</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modal d'ajout de kit */}
      <AnimatePresence>
        {isAddKitModalOpen && (
          <AddKitModal
            isOpen={isAddKitModalOpen}
            onClose={() => setIsAddKitModalOpen(false)}
            onAddKits={handleAddKits}
            projectId={project.id}
          />
        )}

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
  );
}
