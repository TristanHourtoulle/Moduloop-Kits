import { Suspense } from 'react';
import { ProjectsPageClient } from '@/components/projects/projects-page-client';

export default function ProjectsPage() {
  return (
    <div className='bg-background w-full'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Main Content */}
        <div className='mt-8 space-y-8'>
          <Suspense fallback={
            <div className='space-y-8'>
              <div className='h-12 flex items-center'>
                <div className='text-sm text-muted-foreground'>Chargement...</div>
              </div>
              <div className='flex justify-between items-center'>
                <h1 className='text-4xl font-bold text-gray-900'>Projets</h1>
              </div>
              <div className='text-center py-8'>Chargement des projets...</div>
            </div>
          }>
            <ProjectsPageClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
