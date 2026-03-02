'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page de connexion par défaut
    router.replace('/auth/connexion')
  }, [router])

  return null
}
