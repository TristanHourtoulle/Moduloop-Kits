'use client'

import { useSearchParams } from 'next/navigation'
import { ProjectsGrid } from '@/components/projects/projects-grid'
import { CreateProjectButton } from '@/components/projects/create-project-button'
import { UserSelector } from '@/components/projects/user-selector'

export function ProjectsPageClient() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  const handleUserChange = (_newUserId: string) => {
    // Le UserSelector gère déjà la navigation
  }

  return (
    <>
      {/* User Selector for Admin/Dev */}
      <UserSelector
        onUserChange={handleUserChange}
        selectedUserId={userId || undefined}
      />

      {/* Title and Action Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600 max-w-2xl">
            Gérez vos projets de construction modulaire et suivez leur
            progression
          </p>
        </div>
        <div className="flex-shrink-0">
          <CreateProjectButton />
        </div>
      </div>

      {/* Projects Grid */}
      <ProjectsGrid selectedUserId={userId || undefined} />
    </>
  )
}
