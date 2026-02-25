import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InscriptionForm } from '@/components/auth/inscription-form'

export default function InscriptionPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-6 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Créer un compte</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Rejoignez Moduloop Kits et commencez votre parcours
          </CardDescription>
        </CardHeader>

        <CardContent>
          <InscriptionForm />
        </CardContent>
      </Card>
    </div>
  )
}
