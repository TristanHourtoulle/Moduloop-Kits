'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SafeAvatar } from '@/components/ui/safe-avatar';
import { RoleBadge } from '@/components/ui/role-badge';
import { useRole } from '@/hooks/use-role';
import { LogOut, Mail, Calendar, Home } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/connexion');
    }
  }, [session, router]);

  if (!session?.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className='min-h-screen bg-background w-full'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Header Section */}
        <div className='pb-6 border-b border-border'>
          <div className='flex items-center space-x-2 text-sm font-medium text-muted-foreground'>
            <Home className='w-4 h-4 text-primary' />
            <span>Tableau de bord</span>
          </div>
        </div>

        {/* Main Content */}
        <div className='mt-8 space-y-8'>
          {/* Title Section */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <SafeAvatar
                src={session.user.image}
                name={session.user.name}
                className='h-16 w-16 ring-2 ring-primary/20'
              />
              <div>
                <h1 className='text-4xl font-bold text-foreground'>
                  Bonjour <span className='text-primary'>{session.user.name?.split(' ')[0]}</span> !
                </h1>
                <p className='text-muted-foreground max-w-2xl mt-2'>
                  Bienvenue sur votre tableau de bord Moduloop Kits
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <Card className='hover-lift border-primary/10'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>Profil</CardTitle>
                  <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                    <Mail className='w-5 h-5 text-primary' />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center space-x-2 mb-2'>
                  <RoleBadge role={role} />
                </div>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center space-x-2 text-muted-foreground'>
                    <Mail className='h-4 w-4' />
                    <span className='truncate'>{session.user.email}</span>
                  </div>
                  <div className='flex items-center space-x-2 text-muted-foreground'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      Membre depuis le {new Date().toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='hover-lift border-primary/10'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>Actions rapides</CardTitle>
                  <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                    <LogOut className='w-5 h-5 text-primary' />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={async () => {
                    try {
                      await signOut();
                      router.push('/auth/connexion');
                      router.refresh();
                    } catch (error) {
                      console.error('Sign out error:', error);
                    }
                  }}
                  variant='outline'
                  className='w-full'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>

            <Card className='hover-lift border-primary/10 md:col-span-2 lg:col-span-1'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-primary'>Bienvenue !</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 text-sm text-muted-foreground'>
                  <p>Explorez les fonctionnalités disponibles :</p>
                  <ul className='space-y-1 ml-4'>
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
  );
}
