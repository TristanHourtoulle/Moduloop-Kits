'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SafeAvatar } from '@/components/ui/safe-avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { useRole } from '@/hooks/use-role'
import { LogOut, Mail, Calendar, Home } from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { role } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/connexion')
    }
  }, [session, router])

  if (!session?.user) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header Section */}
        <div className="border-border border-b pb-6">
          <div className="text-muted-foreground flex items-center space-x-2 text-sm font-medium">
            <Home className="text-primary h-4 w-4" />
            <span>Tableau de bord</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 space-y-8">
          {/* Title Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <SafeAvatar
                src={session.user.image}
                name={session.user.name}
                className="ring-primary/20 h-16 w-16 ring-2"
              />
              <div>
                <h1 className="text-foreground text-4xl font-bold">
                  Bonjour <span className="text-primary">{session.user.name?.split(' ')[0]}</span> !
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Bienvenue sur votre tableau de bord Moduloop Kits
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover-lift border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Profil</CardTitle>
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Mail className="text-primary h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="mb-2 flex items-center space-x-2">
                  <RoleBadge role={role} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-muted-foreground flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{session.user.email}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis le {new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <LogOut className="text-primary h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={async () => {
                    try {
                      await signOut()
                      router.push('/auth/connexion')
                      router.refresh()
                    } catch (error) {
                      console.error('Sign out error:', error)
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-lift border-primary/10 md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary text-lg">Bienvenue !</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground space-y-3 text-sm">
                  <p>Explorez les fonctionnalités disponibles :</p>
                  <ul className="ml-4 space-y-1">
                    <li>• Gérer vos projets</li>
                    <li>• Créer des kits</li>
                    <li>• Organiser vos produits</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
