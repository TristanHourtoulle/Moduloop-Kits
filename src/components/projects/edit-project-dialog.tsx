'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Edit3, Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'
import { Project, ProjectStatus } from '@/lib/types/project'

interface EditProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onProjectUpdated: (updatedProject: Project) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const STATUS_OPTIONS = [
  {
    value: 'ACTIF' as ProjectStatus,
    label: 'Actif',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'EN_PAUSE' as ProjectStatus,
    label: 'En pause',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'TERMINE' as ProjectStatus,
    label: 'Terminé',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'ARCHIVE' as ProjectStatus,
    label: 'Archivé',
    color: 'bg-gray-100 text-gray-800',
  },
]

export function EditProjectDialog({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
  onError,
  onSuccess,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    nom: project.nom,
    description: project.description || '',
    status: project.status,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom.trim()) {
      onError('Le nom du projet est requis')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du projet')
      }

      const updatedProject = await response.json()
      onProjectUpdated(updatedProject)
      onSuccess('Le projet a été mis à jour avec succès')
      onClose()
    } catch (error) {
      logger.error('Error updating project', { error })
      onError('Une erreur est survenue lors de la mise à jour du projet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      // Réinitialiser le formulaire
      setFormData({
        nom: project.nom,
        description: project.description || '',
        status: project.status,
      })
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#30C1BD]/10">
                  <Edit3 className="h-5 w-5 text-[#30C1BD]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Modifier le projet</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom du projet */}
              <div>
                <label htmlFor="nom" className="mb-2 block text-sm font-medium text-gray-700">
                  Nom du projet *
                </label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                  placeholder="Entrez le nom du projet"
                  disabled={isLoading}
                  className="border-gray-300 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Décrivez votre projet (optionnel)"
                  rows={3}
                  disabled={isLoading}
                  className="resize-none border-gray-300 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Statut du projet
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <Badge
                      key={option.value}
                      variant={formData.status === option.value ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all duration-200 ${
                        formData.status === option.value
                          ? 'border-[#30C1BD] bg-[#30C1BD] text-white'
                          : 'border-gray-300 text-gray-600 hover:border-[#30C1BD] hover:text-[#30C1BD]'
                      }`}
                      onClick={() =>
                        !isLoading &&
                        setFormData((prev) => ({
                          ...prev,
                          status: option.value,
                        }))
                      }
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#30C1BD] text-white hover:bg-[#30C1BD]/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
