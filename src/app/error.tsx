"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

import { useRouter } from "next/navigation";
import { Frown } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="flex flex-col items-center gap-2">
          <Frown size={48} className="text-red-500 mb-2" />
          <CardTitle>
            <h4 className="text-center text-2xl font-bold">
              Oups ! Une erreur s&apos;est produite
            </h4>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-gray-600">
            {error?.message
              ? error.message
              : "Une erreur inattendue est survenue. Veuillez réessayer."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Retour
            </Button>
            <Button onClick={() => reset()}>Réessayer</Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
