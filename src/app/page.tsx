'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        // L'utilisateur est connecté, rediriger vers le dashboard
        router.push('/dashboard');
      } else {
        // L'utilisateur n'est pas connecté, rediriger vers l'auth
        router.push('/auth/connexion');
      }
    }
  }, [session, isPending, router]);

  // Afficher un loader pendant la vérification
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background'>
      <div className='text-center space-y-6'>
        <div className='w-16 h-16 mx-auto'>
          <div className='w-16 h-16 border-4 border-[#30C1BD] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <h1 className='text-2xl font-semibold text-gray-900'>Moduloop Kits</h1>
        <p className='text-gray-600'>Chargement...</p>
      </div>
    </div>
  );
}
