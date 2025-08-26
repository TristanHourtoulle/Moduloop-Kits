import { Suspense } from 'react';
import { ProjectsGrid } from '@/components/projects/projects-grid';
import { CreateProjectButton } from '@/components/projects/create-project-button';
import { ProjectsHeader } from '@/components/projects/projects-header';
import { ProjectsGridSkeleton } from '@/components/projects/projects-grid-skeleton';

export default function ProjectsPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 w-full'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Header Section */}
        <ProjectsHeader />

        {/* Main Content */}
        <div className='mt-8 space-y-8'>
          {/* Title and Action Section */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='space-y-2'>
              <h1 className='text-4xl font-bold text-gray-900'>Mes Projets</h1>
              <p className='text-gray-600 max-w-2xl'>
                Gérez vos projets de construction modulaire et suivez leur
                progression
              </p>
            </div>
            <div className='flex-shrink-0'>
              <CreateProjectButton />
            </div>
          </div>

          {/* Projects Grid */}
          <Suspense fallback={<ProjectsGridSkeleton />}>
            <ProjectsGrid />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
