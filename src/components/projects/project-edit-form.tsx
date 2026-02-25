'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Trash2, Edit3, Package, Leaf, Euro } from 'lucide-react'
import Link from 'next/link'
import { type Project } from '@/lib/types/project'

type ProjectEditData = Pick<Project, 'id' | 'nom' | 'status'> &
  Partial<Pick<Project, 'description' | 'projectKits' | 'totalImpact' | 'totalPrix'>>

interface ProjectEditFormProps {
  project: ProjectEditData
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: project.nom,
    description: project.description || '',
    status: project.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Invalidate the router cache to ensure fresh data on next visit
        router.refresh()

        // Add delay to ensure cache invalidation completes on Vercel
        // Check if we're on Vercel by looking for Vercel-specific environment variable
        const isProduction =
          typeof window !== 'undefined' &&
          window.location.hostname !== 'localhost' &&
          !window.location.hostname.includes('127.0.0.1')

        if (isProduction) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }

        // Redirect with timestamp to force server-side refetch
        const timestamp = Date.now()
        router.push(`/projects/${project.id}?updated=${timestamp}`)
      } else {
        throw new Error('Erreur lors de la modification du projet')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return 'bg-green-100 text-green-800'
      case 'TERMINE':
        return 'bg-blue-100 text-blue-800'
      case 'EN_PAUSE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return '🟢'
      case 'TERMINE':
        return '🔵'
      case 'EN_PAUSE':
        return '🟡'
      case 'ARCHIVE':
        return '⚫'
      default:
        return '⚪'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/projects/${project.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>

          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Modifier le projet
            </h1>
            <p className="mt-2 text-gray-600">Modifiez les détails de votre projet</p>
          </div>
        </div>

        <Badge className={`${getStatusColor(project.status)} px-3 py-1 text-sm font-medium`}>
          {getStatusIcon(project.status)} {project.status}
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <span>Informations du projet</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
                    Nom du projet *
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Ex: Rénovation Bureau 2024"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre projet..."
                    className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Statut
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIF">Actif</SelectItem>
                      <SelectItem value="EN_PAUSE">En pause</SelectItem>
                      <SelectItem value="TERMINE">Terminé</SelectItem>
                      <SelectItem value="ARCHIVE">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="flex-1 border-gray-200 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.nom.trim()}
                    className="flex-1 border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                      />
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Résumé du projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Kits</p>
                  <p className="text-xl font-bold text-blue-900">
                    {project.projectKits?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Impact CO₂</p>
                  <p className="text-xl font-bold text-green-900">
                    {project.totalImpact?.rechauffementClimatique?.toFixed(1) || '0'} kg
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Euro className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Prix total</p>
                  <p className="text-xl font-bold text-purple-900">
                    {project.totalPrix?.toFixed(0) || '0'} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start border-gray-200 hover:bg-gray-50"
              >
                <Link href={`/projects/${project.id}`}>
                  <Package className="mr-2 h-4 w-4" />
                  Gérer les kits
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le projet
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
