'use client'

import { useState, useEffect } from 'react'
import { UsersList } from '@/components/admin/users-list'
import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { useDialog } from '@/components/providers/dialog-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Loader2 } from 'lucide-react'

interface UserStats {
  projectsCount: number
  productsCount: number
  kitsCount: number
}

interface AdminUser {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  createdAt: string
  emailVerified: boolean
  stats: UserStats
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const { showError, showSuccess } = useDialog()

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès refusé. Vous devez être administrateur.')
        }
        throw new Error('Erreur lors du chargement des utilisateurs')
      }

      const usersData = await response.json()
      setUsers(usersData)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      await showError(
        'Erreur',
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors du chargement des utilisateurs',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du rôle')
      }

      // Mettre à jour la liste locale
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)),
      )

      await showSuccess('Succès', "Le rôle de l'utilisateur a été mis à jour avec succès")
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      await showError(
        'Erreur',
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la mise à jour du rôle',
      )
      throw error
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="bg-background w-full">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 bg-red-50">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-foreground text-3xl font-bold">Administration</h1>
              <p className="text-muted-foreground">Gestion des utilisateurs et des rôles</p>
            </div>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Chargement des utilisateurs...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <UsersList users={users} onRoleUpdate={handleRoleUpdate} />
          )}
        </div>
      </div>
    </RoleGuard>
  )
}
