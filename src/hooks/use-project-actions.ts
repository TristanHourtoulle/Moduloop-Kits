'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useDialog } from '@/components/providers/dialog-provider'
import type { Project } from '@/lib/types/project'

interface UseProjectActionsParams {
  project: Project
  onProjectUpdate?: (updatedProject: Project) => void
  refreshProject?: () => Promise<void>
}

interface UseProjectActionsReturn {
  handleDeleteProject: () => Promise<void>
  handleAddKits: (kits: { kitId: string; quantite: number }[]) => Promise<void>
  handleUpdateKitQuantity: (projectKitId: string, newQuantity: number) => Promise<void>
  handleRemoveKit: (projectKitId: string) => Promise<void>
  handleProjectUpdated: (updatedProject: Project) => void
}

/**
 * Fetch the latest project data and forward it to the update callback.
 * @param projectId - The project ID to fetch
 * @param onProjectUpdate - Optional callback receiving the refreshed project
 */
async function refreshAndUpdate(
  projectId: string,
  onProjectUpdate?: (updatedProject: Project) => void,
): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}`, {
    cache: 'no-store',
  })

  if (response.ok) {
    const updatedProject: Project = await response.json()
    onProjectUpdate?.(updatedProject)
  }
}

/**
 * Custom hook providing project-level action handlers (delete, add/remove/update kits).
 * @param params - The project instance and optional callbacks
 * @returns An object containing all project action handlers
 */
export function useProjectActions({
  project,
  onProjectUpdate,
  refreshProject,
}: UseProjectActionsParams): UseProjectActionsReturn {
  const router = useRouter()
  const { showError, showSuccess, showConfirm } = useDialog()

  const handleDeleteProject = useCallback(async () => {
    const confirmed = await showConfirm(
      'Supprimer le projet',
      'Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.',
      'Supprimer',
      'Annuler',
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/projects')
      } else {
        await showError(
          'Erreur',
          'Une erreur est survenue lors de la suppression du projet. Veuillez réessayer.',
        )
      }
    } catch {
      await showError(
        'Erreur',
        'Une erreur est survenue lors de la suppression du projet. Veuillez réessayer.',
      )
    }
  }, [project.id, router, showConfirm, showError])

  const handleAddKits = useCallback(
    async (kits: { kitId: string; quantite: number }[]) => {
      try {
        const response = await fetch(`/api/projects/${project.id}/kits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kits }),
        })

        if (response.ok) {
          await refreshAndUpdate(project.id, onProjectUpdate)
          await showSuccess('Succès', 'Les kits ont été ajoutés avec succès au projet.')
        } else {
          await showError(
            'Erreur',
            "Une erreur est survenue lors de l'ajout des kits. Veuillez réessayer.",
          )
        }
      } catch {
        await showError(
          'Erreur',
          "Une erreur est survenue lors de l'ajout des kits. Veuillez réessayer.",
        )
      }
    },
    [project.id, onProjectUpdate, showSuccess, showError],
  )

  const handleUpdateKitQuantity = useCallback(
    async (projectKitId: string, newQuantity: number) => {
      try {
        const response = await fetch(`/api/projects/${project.id}/kits/${projectKitId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantite: newQuantity }),
        })

        if (response.ok) {
          await refreshAndUpdate(project.id, onProjectUpdate)
        } else {
          await showError(
            'Erreur',
            'Une erreur est survenue lors de la modification de la quantité. Veuillez réessayer.',
          )
        }
      } catch {
        await showError(
          'Erreur',
          'Une erreur est survenue lors de la modification de la quantité. Veuillez réessayer.',
        )
      }
    },
    [project.id, onProjectUpdate, showError],
  )

  const handleRemoveKit = useCallback(
    async (projectKitId: string) => {
      const confirmed = await showConfirm(
        'Retirer le kit',
        'Êtes-vous sûr de vouloir retirer ce kit du projet ?',
        'Retirer',
        'Annuler',
      )

      if (!confirmed) return

      try {
        const response = await fetch(`/api/projects/${project.id}/kits/${projectKitId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await refreshAndUpdate(project.id, onProjectUpdate)
        } else {
          await showError(
            'Erreur',
            'Une erreur est survenue lors de la suppression du kit. Veuillez réessayer.',
          )
        }
      } catch {
        await showError(
          'Erreur',
          'Une erreur est survenue lors de la suppression du kit. Veuillez réessayer.',
        )
      }
    },
    [project.id, onProjectUpdate, showConfirm, showError],
  )

  const handleProjectUpdated = useCallback(
    (updatedProject: Project) => {
      onProjectUpdate?.(updatedProject)
      refreshProject?.()
    },
    [onProjectUpdate, refreshProject],
  )

  return {
    handleDeleteProject,
    handleAddKits,
    handleUpdateKitQuantity,
    handleRemoveKit,
    handleProjectUpdated,
  }
}
