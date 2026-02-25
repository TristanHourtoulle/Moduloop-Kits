import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConnexionForm } from '@/components/auth/connexion-form'

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 w-full">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Bienvenue !
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
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
