'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/types/project';
import {
  Calendar,
  Package,
  Leaf,
  Euro,
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return {
          color: 'bg-primary/10 text-primary border-primary/20',
          dot: 'bg-primary',
          label: 'Actif',
        };
      case 'TERMINE':
        return {
          color: 'bg-primary/10 text-primary border-primary/20',
          dot: 'bg-primary',
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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className='h-full'
    >
      <Card className='h-full group cursor-pointer'>
        {/* Header Section */}
        <div className='p-6 pb-4'>
          <div className='flex items-start justify-between mb-4'>
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

          {/* Meta info */}
          <div className='flex items-center text-xs text-muted-foreground space-x-4 pl-13'>
            <div className='flex items-center space-x-1.5'>
              <Calendar className='w-3.5 h-3.5' />
              <span>
                {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className='flex items-center space-x-1.5'>
              <Package className='w-3.5 h-3.5' />
              <span>{project.projectKits?.length || 0} kits</span>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <CardContent className='px-6 py-4 space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            {/* Impact environnemental */}
            <div className='p-4 rounded-xl bg-muted/30 border border-border/50'>
              <div className='flex items-center space-x-2 mb-2'>
                <Leaf className='w-4 h-4 text-emerald-600' />
                <span className='text-xs font-medium text-muted-foreground'>
                  Impact CO₂
                </span>
              </div>
              <div className='text-lg font-bold text-emerald-600'>
                {project.totalImpact?.rechauffementClimatique?.toFixed(1) ||
                  '0'} kg
              </div>
            </div>

            {/* Prix total */}
            <div className='p-4 rounded-xl bg-muted/30 border border-border/50'>
              <div className='flex items-center space-x-2 mb-2'>
                <Euro className='w-4 h-4 text-primary' />
                <span className='text-xs font-medium text-muted-foreground'>
                  Prix Total
                </span>
              </div>
              <div className='text-lg font-bold text-primary'>
                {project.totalPrix?.toLocaleString('fr-FR') || '0'}€
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center space-x-3 pt-2'>
            <Button
              asChild
              size='sm'
              className='flex-1'
            >
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
                // TODO: Ajouter la fonctionnalité d'édition
                console.log('Édition du projet:', project.id);
              }}
            >
              <Edit3 className='w-4 h-4' />
            </Button>

            <Button
              size='sm'
              variant='outline'
              className='hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
