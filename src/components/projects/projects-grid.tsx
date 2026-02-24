'use client';

import { useEffect, useState } from 'react';
import { ProjectCard } from './project-card';
import { Project } from '@/lib/types/project';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { CreateProjectButton } from './create-project-button';
import { useSearchParams } from 'next/navigation';

interface ProjectsGridProps {
  projects?: Project[];
  selectedUserId?: string;
}

export function ProjectsGrid({ projects, selectedUserId }: ProjectsGridProps) {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects || []);
  const [isLoading, setIsLoading] = useState(!projects);
  const searchParams = useSearchParams();

  // Récupérer l'userId depuis les props ou les params d'URL
  const userId = selectedUserId || searchParams.get('userId') || undefined;

  useEffect(() => {
    if (!projects) {
      fetchProjects();
    }
  }, [projects, userId]);

  const fetchProjects = async () => {
    try {
      const url = userId ? `/api/projects?userId=${userId}` : '/api/projects';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLocalProjects(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch projects when userId changes
  useEffect(() => {
    setIsLoading(true);
    fetchProjects();
  }, [userId]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (localProjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center py-20'
      >
        <div className='max-w-lg mx-auto'>
          {/* Icon container */}
          <div className='relative mx-auto mb-8 w-32 h-32'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#30C1BD]/10 to-blue-50 rounded-full' />
            <div className='absolute inset-4 bg-gradient-to-br from-[#30C1BD]/20 to-blue-100 rounded-full' />
            <div className='absolute inset-8 bg-white rounded-full shadow-sm flex items-center justify-center'>
              <FolderOpen className='w-12 h-12 text-[#30C1BD]' />
            </div>
          </div>

          <h3 className='text-2xl font-bold text-gray-900 mb-3'>
            Aucun projet créé
          </h3>
          <p className='text-gray-600 mb-8 leading-relaxed'>
            Commencez votre premier projet de construction modulaire. Organisez
            vos kits, suivez vos coûts et analysez l&apos;impact environnemental.
          </p>

          <CreateProjectButton />
        </div>
      </motion.div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'
      >
        <div className='bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-[#30C1BD]/10 rounded-lg flex items-center justify-center'>
              <FolderOpen className='w-5 h-5 text-[#30C1BD]' />
            </div>
            <div>
              <p className='text-sm text-gray-600'>Total des projets</p>
              <p className='text-2xl font-bold text-gray-900'>
                {localProjects.length}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <span className='text-green-600 font-bold'>✓</span>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Projets actifs</p>
              <p className='text-2xl font-bold text-gray-900'>
                {localProjects.filter((p) => p.status === 'ACTIF').length}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
              <span className='text-blue-600 font-bold'>€</span>
            </div>
            <div>
              <p className='text-sm text-gray-600'>Valeur totale</p>
              <p className='text-2xl font-bold text-gray-900'>
                {localProjects
                  .reduce((acc, p) => acc + (p.totalPrix || 0), 0)
                  .toLocaleString('fr-FR')}
                €
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
      >
        <AnimatePresence>
          {localProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className='h-full'
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
