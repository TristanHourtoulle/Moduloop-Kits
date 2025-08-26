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
          color: 'bg-[#30C1BD]/10 text-[#30C1BD] border-[#30C1BD]/20',
          dot: 'bg-[#30C1BD]',
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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className='h-full'
    >
      <Card className='h-full bg-white border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer'>
        {/* Header Section */}
        <div className='p-6 pb-4'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-semibold text-gray-900 transition-colors duration-200 truncate'>
                {project.nom}
              </h3>
              {project.description && (
                <p className='text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed'>
                  {project.description}
                </p>
              )}
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
          <div className='flex items-center text-xs text-gray-500 space-x-4'>
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
        <CardContent className='px-6 py-4 space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            {/* Impact environnemental */}
            <div className='bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100/50 group-hover:border-emerald-200 transition-colors'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center'>
                  <Leaf className='w-4 h-4 text-emerald-600' />
                </div>
                <span className='text-xs font-medium text-emerald-700'>
                  Impact CO₂
                </span>
              </div>
              <div className='text-xl font-bold text-emerald-800'>
                {project.totalImpact?.rechauffementClimatique?.toFixed(1) ||
                  '0'}
                <span className='text-sm font-normal ml-1'>kg CO₂</span>
              </div>
            </div>

            {/* Prix total */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50 group-hover:border-blue-200 transition-colors'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <Euro className='w-4 h-4 text-blue-600' />
                </div>
                <span className='text-xs font-medium text-blue-700'>
                  Prix Total
                </span>
              </div>
              <div className='text-xl font-bold text-blue-800'>
                {project.totalPrix?.toLocaleString('fr-FR') || '0'}
                <span className='text-sm font-normal ml-1'>€</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center space-x-3 pt-2'>
            <Button
              asChild
              size='sm'
              className='flex-1 bg-[#30C1BD] hover:bg-[#2AA9A4] text-white border-0 shadow-sm hover:shadow-md transition-all duration-200'
            >
              <Link href={`/projects/${project.id}`}>
                <Eye className='w-4 h-4 mr-2' />
                Voir le projet
              </Link>
            </Button>

            <Button
              size='sm'
              variant='ghost'
              className='text-gray-600 hover:text-[#30C1BD] hover:bg-[#30C1BD]/5'
              onClick={() => {
                // TODO: Ajouter la fonctionnalité d'édition
                console.log('Édition du projet:', project.id);
              }}
            >
              <Edit3 className='w-4 h-4' />
            </Button>

            <Button
              size='sm'
              variant='ghost'
              className='text-gray-600 hover:text-red-600 hover:bg-red-50'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
