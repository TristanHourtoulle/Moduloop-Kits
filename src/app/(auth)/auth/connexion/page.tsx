import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnexionForm } from '@/components/auth/connexion-form'

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-8 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Bienvenue !</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Connectez-vous à votre compte Moduloop Kits
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ConnexionForm />
        </CardContent>
      </Card>
    </div>
  )
}
