'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import { PasswordInput } from '@/components/ui/password-input'
import { GoogleButton } from '@/components/auth/google-button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Mail, User, AlertCircle, Loader2, Check } from 'lucide-react'
import { signUp } from '@/lib/auth-client'
import { inscriptionSchema, type InscriptionFormData } from '@/lib/schemas/auth'
import { getSpecificAuthError } from '@/lib/auth/error-messages'

export function InscriptionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const watchPassword = form.watch('password')
  const watchConfirmPassword = form.watch('confirmPassword')

  const onSubmit = async (data: InscriptionFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: '/dashboard',
      })

      // Vérifier si l'inscription a réussi
      if (result?.error) {
        const errorMessage = getSpecificAuthError(result.error, 'signup')
        setError(errorMessage)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      const errorMessage = getSpecificAuthError(err, 'signup')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GoogleButton onError={handleGoogleError} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Ou</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nom complet
                </FormLabel>
                <FormControl>
                  <InputWithIcon
                    icon={User}
                    placeholder="Votre nom complet"
                    className="border-gray-200 focus:border-[#30C1BD] focus:ring-[#30C1BD] transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Adresse e-mail
                </FormLabel>
                <FormControl>
                  <InputWithIcon
                    icon={Mail}
                    placeholder="votre@email.com"
                    className="border-gray-200 focus:border-[#30C1BD] focus:ring-[#30C1BD] transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Mot de passe
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    showStrength
                    className="border-gray-200 focus:border-[#30C1BD] focus:ring-[#30C1BD] transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      placeholder="••••••••"
                      className="border-gray-200 focus:border-[#30C1BD] focus:ring-[#30C1BD] transition-colors pr-16"
                      {...field}
                    />
                    {watchConfirmPassword &&
                      watchPassword === watchConfirmPassword && (
                        <Check className="absolute right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-300 data-[state=checked]:bg-[#30C1BD] data-[state=checked]:border-[#30C1BD] mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-600 cursor-pointer">
                    J&apos;accepte les{' '}
                    <Link
                      href="/conditions"
                      className="text-[#30C1BD] hover:text-[#30C1BD]/80 cursor-pointer"
                    >
                      conditions d&apos;utilisation
                    </Link>{' '}
                    et la{' '}
                    <Link
                      href="/confidentialite"
                      className="text-[#30C1BD] hover:text-[#30C1BD]/80 cursor-pointer"
                    >
                      politique de confidentialité
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Créer mon compte'
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <Link
            href="/auth/connexion"
            className="text-[#30C1BD] hover:text-[#30C1BD]/80 font-medium transition-colors cursor-pointer"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
