import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InscriptionForm } from '@/components/auth/inscription-form'

export default function InscriptionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 w-full">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
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
