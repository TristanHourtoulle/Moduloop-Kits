'use client'

import { useEffect, useState } from 'react'
import { ProjectCard } from './project-card'
import { Project } from '@/lib/types/project'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen } from 'lucide-react'
import { CreateProjectButton } from './create-project-button'
import { useSearchParams } from 'next/navigation'

interface ProjectsGridProps {
  projects?: Project[]
  selectedUserId?: string
}

export function ProjectsGrid({ projects, selectedUserId }: ProjectsGridProps) {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects || [])
  const [isLoading, setIsLoading] = useState(!projects)
  const searchParams = useSearchParams()

  // Récupérer l'userId depuis les props ou les params d'URL
  const userId = selectedUserId || searchParams.get('userId') || undefined

  useEffect(() => {
    if (!projects) {
      fetchProjects()
    }
  }, [projects, userId])

  const fetchProjects = async () => {
    try {
      const url = userId ? `/api/projects?userId=${userId}` : '/api/projects'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLocalProjects(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch projects when userId changes
  useEffect(() => {
    setIsLoading(true)
    fetchProjects()
  }, [userId])

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (localProjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-20 text-center"
      >
        <div className="mx-auto max-w-lg">
          {/* Icon container */}
          <div className="relative mx-auto mb-8 h-32 w-32">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#30C1BD]/10 to-blue-50" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#30C1BD]/20 to-blue-100" />
            <div className="absolute inset-8 flex items-center justify-center rounded-full bg-white shadow-sm">
              <FolderOpen className="h-12 w-12 text-[#30C1BD]" />
            </div>
          </div>

          <h3 className="mb-3 text-2xl font-bold text-gray-900">Aucun projet créé</h3>
          <p className="mb-8 leading-relaxed text-gray-600">
            Commencez votre premier projet de construction modulaire. Organisez vos kits, suivez vos
            coûts et analysez l&apos;impact environnemental.
          </p>

          <CreateProjectButton />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#30C1BD]/10">
              <FolderOpen className="h-5 w-5 text-[#30C1BD]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total des projets</p>
              <p className="text-2xl font-bold text-gray-900">{localProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <span className="font-bold text-green-600">✓</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Projets actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {localProjects.filter((p) => p.status === 'ACTIF').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <span className="font-bold text-blue-600">€</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valeur totale</p>
              <p className="text-2xl font-bold text-gray-900">
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
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <AnimatePresence>
          {localProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="h-full"
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
