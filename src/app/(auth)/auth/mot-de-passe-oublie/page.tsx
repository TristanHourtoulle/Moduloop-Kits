"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simuler l'envoi d'email (à remplacer par l'API better-auth)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsEmailSent(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de l'envoi de l'email");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email envoyé !
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Vérifiez votre boîte de réception
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Nous avons envoyé un lien de réinitialisation à :
              </p>
              <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                {email}
              </p>
              <p className="text-sm text-gray-500">
                Si vous ne recevez pas l&apos;email dans les 5 minutes, vérifiez
                votre dossier spam ou essayez à nouveau.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                Renvoyer l&apos;email
              </Button>

              <Link href="/auth/connexion" className="block">
                <Button
                  variant="ghost"
                  className="w-full h-12 text-[#30C1BD] hover:text-[#30C1BD]/80 hover:bg-[#30C1BD]/10 cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 w-full">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Mot de passe oublié ?
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Pas de problème ! Entrez votre adresse e-mail et nous vous enverrons
            un lien pour réinitialiser votre mot de passe.
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
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Adresse e-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-[#30C1BD] focus:ring-[#30C1BD] transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12 bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/auth/connexion"
              className="inline-flex items-center text-sm text-gray-600 hover:text-[#30C1BD] transition-colors cursor-pointer"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Conseils de sécurité :
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Le lien expirera dans 1 heure pour votre sécurité</li>
              <li>
                • Utilisez un mot de passe fort avec au moins 8 caractères
              </li>
              <li>• Ne partagez jamais votre mot de passe avec personne</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
