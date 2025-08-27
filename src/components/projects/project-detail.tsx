'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddKitModal } from './add-kit-modal';
import { EnvironmentalMetrics } from './environmental-metrics';
import { PricingBreakdown } from './pricing-breakdown';
import { KitsList } from './kits-list';
import { EditProjectDialog } from './edit-project-dialog';
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
    <div className='min-h-screen bg-background w-full'>
      <div className='max-w-7xl mx-auto px-6 py-8 space-y-8'>
        {/* Header simplifié */}
        <div className='space-y-4'>
          {/* Navigation et statut */}
          <div className='flex items-center justify-between'>
            <Button asChild variant='ghost' size='sm' className='text-muted-foreground'>
              <Link href='/projects'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Retour aux projets
              </Link>
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

        {/* Métriques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='grid grid-cols-2 lg:grid-cols-4 gap-4'
        >
          <div className='bg-card border border-border rounded-lg p-4 text-center'>
            <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2'>
              <Euro className='w-5 h-5 text-primary' />
            </div>
            <p className='text-2xl font-bold text-foreground mb-1'>
              {project.totalPrix?.toFixed(0) || '0'}€
            </p>
            <p className='text-sm text-muted-foreground'>Prix Total</p>
          </div>

          <div className='bg-card border border-border rounded-lg p-4 text-center'>
            <div className='w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-2'>
              <Leaf className='w-5 h-5 text-emerald-600' />
            </div>
            <p className='text-2xl font-bold text-foreground mb-1'>
              {project.totalImpact?.rechauffementClimatique?.toFixed(1) || '0'}kg
            </p>
            <p className='text-sm text-muted-foreground'>Impact CO₂</p>
          </div>

          <div className='bg-card border border-border rounded-lg p-4 text-center'>
            <div className='w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center mx-auto mb-2'>
              <Package className='w-5 h-5 text-blue-600' />
            </div>
            <p className='text-2xl font-bold text-foreground mb-1'>
              {project.projectKits?.length || 0}
            </p>
            <p className='text-sm text-muted-foreground'>Kits</p>
          </div>

          <div className='bg-card border border-border rounded-lg p-4 text-center'>
            <div className='w-10 h-10 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center mx-auto mb-2'>
              <Target className='w-5 h-5 text-orange-600' />
            </div>
            <p className='text-2xl font-bold text-foreground mb-1'>
              {project.totalSurface?.toFixed(1) || '0'}m²
            </p>
            <p className='text-sm text-muted-foreground'>Surface</p>
          </div>
        </motion.div>

      {/* Tabs pour les détails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue='kits' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='kits'>
              <Package className='w-4 h-4 mr-2' />
              Kits
            </TabsTrigger>
            <TabsTrigger value='environmental'>
              <Leaf className='w-4 h-4 mr-2' />
              Impact
            </TabsTrigger>
            <TabsTrigger value='pricing'>
              <Euro className='w-4 h-4 mr-2' />
              Prix
            </TabsTrigger>
          </TabsList>

          <TabsContent value='kits' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-foreground'>
                Kits du projet
              </h2>
              <Button onClick={() => setIsAddKitModalOpen(true)}>
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
              <p className='text-muted-foreground text-center py-8'>Aucun kit pour le moment</p>
            )}
          </TabsContent>

          <TabsContent value='environmental' className='space-y-4'>
            <h2 className='text-lg font-semibold text-foreground'>
              Impact environnemental
            </h2>
            {project.totalImpact ? (
              <EnvironmentalMetrics impact={project.totalImpact} />
            ) : (
              <p className='text-muted-foreground text-center py-8'>
                Aucune donnée d'impact disponible
              </p>
            )}
          </TabsContent>

          <TabsContent value='pricing' className='space-y-4'>
            <h2 className='text-lg font-semibold text-foreground'>
              Détail des prix
            </h2>
            <PricingBreakdown project={project} />
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
    </div>
  );
}
