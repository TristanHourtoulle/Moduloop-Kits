"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { PasswordInput } from "@/components/ui/password-input";
import { GoogleButton } from "@/components/auth/google-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import {
  connexionSchema,
  type ConnexionFormData,
} from "@/lib/validations/auth";
import { getSpecificAuthError } from "@/lib/auth/error-messages";
import { signInWithErrorHandling } from "@/lib/auth/sign-in-with-error-handling";

export function ConnexionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<ConnexionFormData>({
    resolver: zodResolver(connexionSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ConnexionFormData) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("🔵 Using custom sign-in handler...");
      
      const result = await signInWithErrorHandling(data.email, data.password);
      
      console.log("🔵 Custom sign-in result:", result);
      
      if (result.success) {
        console.log("🟢 Sign-in successful, redirecting...");
        router.push("/dashboard");
      } else {
        console.log("🔴 Sign-in failed:", result.error);
        const errorMessage = getSpecificAuthError(result.error || "Authentication failed", 'signin');
        setError(errorMessage);
      }
      
    } catch (err: any) {
      console.log("🔴 Unexpected error:", err);
      const errorMessage = getSpecificAuthError(err, 'signin');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
  };

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
                    className="border-gray-200 focus:border-[#30C1BD] focus:ring-[#30C1BD] transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <Link
              href="/auth/mot-de-passe-oublie"
              className="text-sm text-[#30C1BD] hover:text-[#30C1BD]/80 transition-colors cursor-pointer"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/inscription"
            className="text-[#30C1BD] hover:text-[#30C1BD]/80 font-medium transition-colors cursor-pointer"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
