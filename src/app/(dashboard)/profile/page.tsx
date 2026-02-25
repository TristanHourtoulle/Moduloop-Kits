'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { useUser } from '@/components/providers/user-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { SafeAvatar } from '@/components/ui/safe-avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { UserRole } from '@/lib/types/user'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User,
  Mail,
  Calendar,
  Settings,
  Package,
  FolderOpen,
  BarChart3,
  Save,
  Edit3,
  Camera,
  Shield,
  Bell,
  Palette,
  Globe,
} from 'lucide-react'

interface ProfileData {
  user: {
    id: string
    name: string
    email: string
    image?: string
    role: string
    emailVerified: boolean
    createdAt: string
    hasGoogleAccount: boolean
  }
  statistics: {
    projectsCount: number
    kitsCount: number
    productsCount: number
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { updateUser } = useUser()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
  })

  const fetchProfileData = async () => {
    try {
      setIsPageLoading(true)
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil')
      }
      const data: ProfileData = await response.json()
      setProfileData(data)
      setFormData({
        name: data.user.name || '',
      })
    } catch (_error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' })
    } finally {
      setIsPageLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchProfileData()
    }
  }, [session])

  const handleSave = async () => {
    if (!profileData) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      const updatedData = await response.json()
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          ...updatedData.user,
        },
      })

      // Update the user in the global context to refresh header
      updateUser({
        name: updatedData.user.name,
      })

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
      setIsEditing(false)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user || isPageLoading) {
    return (
      <div className="bg-background min-h-screen w-full">
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card Skeleton */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Skeleton className="mb-4 h-20 w-20 rounded-full" />
                  <Skeleton className="mb-1 h-6 w-32" />
                  <Skeleton className="mb-3 h-4 w-40" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Main Content Skeleton */}
            <div className="space-y-6 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return <div>Erreur lors du chargement du profil</div>
  }

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
              <User className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-foreground text-3xl font-bold">Mon profil</h1>
              <p className="text-muted-foreground">
                Gérez vos informations personnelles et préférences
              </p>
            </div>
          </div>
        </div>

        {message && (
          <Alert
            className={
              message.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            <AlertDescription
              className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary h-5 w-5" />
                Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <SafeAvatar
                    src={profileData.user.image}
                    name={profileData.user.name}
                    className="ring-primary/10 h-20 w-20 ring-4"
                  />
                  <Button
                    size="sm"
                    className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="text-foreground mb-1 text-xl font-semibold">
                  {profileData.user.name}
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">{profileData.user.email}</p>
                <RoleBadge role={profileData.user.role as UserRole} />
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.user.email}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Membre depuis le{' '}
                    {new Date(profileData.user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>
                    {profileData.user.emailVerified ? 'Compte vérifié' : 'Compte non vérifié'}
                  </span>
                </div>
                {profileData.user.hasGoogleAccount && (
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Connecté via Google</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Informations personnelles */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="text-primary h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isLoading}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.user.email}
                      disabled={true}
                      className="bg-muted/50"
                    />
                    {profileData.user.hasGoogleAccount && (
                      <p className="text-muted-foreground text-xs">
                        L&apos;email ne peut pas être modifié pour les comptes Google
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="text-primary h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-primary/5 border-primary/10 rounded-xl border p-4 text-center">
                    <FolderOpen className="text-primary mx-auto mb-2 h-8 w-8" />
                    <div className="text-primary mb-1 text-2xl font-bold">
                      {profileData.statistics.projectsCount}
                    </div>
                    <div className="text-muted-foreground text-sm">Projets créés</div>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                    <div className="mb-1 text-2xl font-bold text-blue-600">
                      {profileData.statistics.kitsCount}
                    </div>
                    <div className="text-muted-foreground text-sm">Kits créés</div>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                    <div className="mb-1 text-2xl font-bold text-emerald-600">
                      {profileData.statistics.productsCount}
                    </div>
                    <div className="text-muted-foreground text-sm">Produits créés</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Préférences */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="text-primary h-5 w-5" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="font-medium">Notifications</div>
                      <div className="text-muted-foreground text-sm">
                        Recevoir des notifications par email
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Activé</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="font-medium">Langue</div>
                      <div className="text-muted-foreground text-sm">Français</div>
                    </div>
                  </div>
                  <Badge variant="outline">FR</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="font-medium">Thème</div>
                      <div className="text-muted-foreground text-sm">Thème de l&apos;interface</div>
                    </div>
                  </div>
                  <Badge variant="outline">Auto</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
