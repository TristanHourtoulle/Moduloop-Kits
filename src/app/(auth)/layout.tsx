import type { Metadata } from 'next'
import { AuthHeader } from '@/components/headers/auth-header'

export const metadata: Metadata = {
  title: 'Moduloop Kits - Authentification',
  description: 'Connectez-vous à votre compte Moduloop Kits',
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AuthHeader />
      <main className="flex w-full min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  )
}
