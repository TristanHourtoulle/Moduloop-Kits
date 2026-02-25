'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Plus, Package, Activity, Edit3, Trash2, User, AlertCircle } from 'lucide-react'

interface ProjectHistoryItem {
  id: string
  changeType: string
  description: string
  createdAt: string
  changedBy: {
    id: string
    name: string
    firstName?: string
    lastName?: string
    email: string
  }
  metadata?: Record<string, unknown>
}

interface ProjectHistoryProps {
  projectId: string
  projectCreatedAt: string
}

export function ProjectHistory({ projectId, projectCreatedAt }: ProjectHistoryProps) {
  const [history, setHistory] = useState<ProjectHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [projectId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/history`)

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique")
      }

      const data = await response.json()
      setHistory(data)
    } catch (_err) {
      setError("Impossible de charger l'historique du projet")
    } finally {
      setLoading(false)
    }
  }

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'CREATED':
        return {
          icon: Plus,
          color: 'from-green-100 to-emerald-100',
          iconColor: 'text-green-600',
        }
      case 'UPDATED':
        return {
          icon: Edit3,
          color: 'from-blue-100 to-cyan-100',
          iconColor: 'text-blue-600',
        }
      case 'STATUS_CHANGED':
        return {
          icon: Activity,
          color: 'from-orange-100 to-amber-100',
          iconColor: 'text-orange-600',
        }
      case 'KIT_ADDED':
        return {
          icon: Package,
          color: 'from-[#30C1BD]/10 to-blue-100',
          iconColor: 'text-[#30C1BD]',
        }
      case 'KIT_REMOVED':
        return {
          icon: Trash2,
          color: 'from-red-100 to-pink-100',
          iconColor: 'text-red-600',
        }
      case 'KIT_QUANTITY_UPDATED':
        return {
          icon: Package,
          color: 'from-purple-100 to-indigo-100',
          iconColor: 'text-purple-600',
        }
      case 'DELETED':
        return {
          icon: Trash2,
          color: 'from-gray-100 to-slate-100',
          iconColor: 'text-gray-600',
        }
      default:
        return {
          icon: Clock,
          color: 'from-gray-100 to-slate-100',
          iconColor: 'text-gray-600',
        }
    }
  }

  const formatUserName = (user: ProjectHistoryItem['changedBy']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.name) {
      return user.name
    }
    return user.email.split('@')[0]
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) {
      return "à l'instant"
    } else if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    } else if (diffInDays < 30) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('fr-FR')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#30C1BD]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline des événements */}
      <div className="relative">
        <div className="absolute top-8 bottom-0 left-4 w-0.5 bg-gradient-to-b from-purple-200 to-transparent"></div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Clock className="mx-auto mb-2 h-8 w-8" />
            <p>Aucun historique disponible</p>
          </div>
        ) : (
          history.map((item, index) => {
            const { icon: Icon, color, iconColor } = getChangeTypeIcon(item.changeType)
            const isLast = index === history.length - 1

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-start gap-4 ${isLast ? '' : 'pb-6'}`}
              >
                <div
                  className={`h-8 w-8 bg-gradient-to-br ${color} z-10 flex items-center justify-center rounded-full border-2 border-white shadow-sm`}
                >
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-gray-900">{item.description}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{formatUserName(item.changedBy)}</span>
                          <span>•</span>
                          <time title={new Date(item.createdAt).toLocaleString('fr-FR')}>
                            {formatTimeAgo(item.createdAt)}
                          </time>
                        </div>
                      </div>
                    </div>

                    {/* Display metadata if available */}
                    {item.metadata && (
                      <div className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-500">
                        {item.changeType === 'KIT_ADDED' &&
                          typeof item.metadata.kitName === 'string' && (
                            <p>
                              Kit: {item.metadata.kitName} (
                              {typeof item.metadata.quantity === 'number'
                                ? item.metadata.quantity
                                : 0}{' '}
                              unité
                              {typeof item.metadata.quantity === 'number' &&
                              item.metadata.quantity > 1
                                ? 's'
                                : ''}
                              )
                            </p>
                          )}
                        {item.changeType === 'KIT_REMOVED' &&
                          typeof item.metadata.kitName === 'string' && (
                            <p>
                              Kit retiré: {item.metadata.kitName} (
                              {typeof item.metadata.quantity === 'number'
                                ? item.metadata.quantity
                                : 0}{' '}
                              unité
                              {typeof item.metadata.quantity === 'number' &&
                              item.metadata.quantity > 1
                                ? 's'
                                : ''}
                              )
                            </p>
                          )}
                        {item.changeType === 'KIT_QUANTITY_UPDATED' &&
                          typeof item.metadata.kitName === 'string' && (
                            <p>
                              Kit: {item.metadata.kitName} ({String(item.metadata.oldQuantity ?? 0)}{' '}
                              → {String(item.metadata.newQuantity ?? 0)})
                            </p>
                          )}
                        {(item.changeType === 'CREATED' || item.changeType === 'DELETED') &&
                          !!item.metadata.projectName && (
                            <p>Projet: {String(item.metadata.projectName)}</p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Statistiques d'évolution */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Statistiques de l&apos;historique
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="mb-1 text-lg font-bold text-gray-900">{history.length}</div>
            <div className="text-sm text-gray-600">Événements totaux</div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="mb-1 text-lg font-bold text-gray-900">
              {Math.ceil(
                (Date.now() - new Date(projectCreatedAt).getTime()) / (1000 * 60 * 60 * 24),
              )}
            </div>
            <div className="text-sm text-gray-600">Jours depuis création</div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="mb-1 text-lg font-bold text-gray-900">
              {history.filter((h) => h.changeType.startsWith('KIT_')).length}
            </div>
            <div className="text-sm text-gray-600">Actions sur les kits</div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="mb-1 text-lg font-bold text-gray-900">
              {new Set(history.map((h) => h.changedBy.id)).size}
            </div>
            <div className="text-sm text-gray-600">Contributeurs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
