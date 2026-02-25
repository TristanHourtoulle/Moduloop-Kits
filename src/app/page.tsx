'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export default function HomePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        // L'utilisateur est connecté, rediriger vers le dashboard
        router.push('/dashboard')
      } else {
        // L'utilisateur n'est pas connecté, rediriger vers l'auth
        router.push('/auth/connexion')
      }
    }
  }, [session, isPending, router])

  // Afficher un loader pendant la vérification
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="mx-auto h-16 w-16">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#30C1BD] border-t-transparent"></div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Moduloop Kits</h1>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  )
}
