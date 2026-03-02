'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { ProjectCard } from '@/components/projects/project-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'
import { type Project } from '@/lib/types/project'
import { logger } from '@/lib/logger'

interface ProjectsListWrapperProps {
  initialProjects: Project[]
}

function ProjectsListContent({ initialProjects }: ProjectsListWrapperProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const handleDelete = useCallback(
    async (projectId: string) => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du projet')
        }

        // Remove project from local state without refetch
        const updatedProjects = projects.filter((p) => p.id !== projectId)
        setProjects(updatedProjects)
      } catch (err) {
        logger.error('[ProjectsListWrapper] Error deleting project', { error: err })
      }
    },
    [projects],
  )

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-muted/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <FolderOpen className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">Aucun projet trouvé</h3>
        <p className="text-muted-foreground">Commencez par créer votre premier projet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
      ))}
    </div>
  )
}

// Loading skeleton component
function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-9 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  )
}

// Wrapper component with Suspense boundary
export function ProjectsListWrapper(props: ProjectsListWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <ProjectsListContent {...props} />
    </Suspense>
  )
}
