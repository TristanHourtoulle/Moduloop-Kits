'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simuler l'envoi d'email (à remplacer par l'API better-auth)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsEmailSent(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Une erreur est survenue lors de l'envoi de l'email")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Email envoyé !</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Vérifiez votre boîte de réception
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4 text-center">
              <p className="text-gray-600">Nous avons envoyé un lien de réinitialisation à :</p>
              <p className="rounded-lg bg-gray-50 p-3 font-medium text-gray-900">{email}</p>
              <p className="text-sm text-gray-500">
                Si vous ne recevez pas l&apos;email dans les 5 minutes, vérifiez votre dossier spam
                ou essayez à nouveau.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsEmailSent(false)
                  setEmail('')
                }}
                variant="outline"
                className="h-12 w-full cursor-pointer border-gray-200 hover:bg-gray-50"
              >
                Renvoyer l&apos;email
              </Button>

              <Link href="/auth/connexion" className="block">
                <Button
                  variant="ghost"
                  className="h-12 w-full cursor-pointer text-[#30C1BD] hover:bg-[#30C1BD]/10 hover:text-[#30C1BD]/80"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-6 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Pas de problème ! Entrez votre adresse e-mail et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse e-mail
              </Label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-200 pl-10 transition-colors focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="h-12 w-full cursor-pointer bg-[#30C1BD] text-white shadow-lg transition-all duration-200 hover:bg-[#30C1BD]/90 hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/auth/connexion"
              className="inline-flex cursor-pointer items-center text-sm text-gray-600 transition-colors hover:text-[#30C1BD]"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-blue-900">Conseils de sécurité :</h3>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• Le lien expirera dans 1 heure pour votre sécurité</li>
              <li>• Utilisez un mot de passe fort avec au moins 8 caractères</li>
              <li>• Ne partagez jamais votre mot de passe avec personne</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
