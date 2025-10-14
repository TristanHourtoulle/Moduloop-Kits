"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { KitForm } from "@/components/kits/kit-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package2, Sparkles, AlertTriangle } from "lucide-react";

interface KitData {
  nom: string;
  style: string;
  description?: string;
  products: Array<{
    productId: string;
    quantite: number;
  }>;
}

export default function EditKitPage() {
  const params = useParams();
  const kitId = params?.id as string;

  const [kit, setKit] = useState<KitData | null>(null);
  const [kitName, setKitName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kitId) {
      const fetchKit = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/kits/${kitId}`, {
            cache: "no-store", // Éviter le cache du navigateur
          });

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Kit non trouvé");
            }
            throw new Error("Erreur lors du chargement du kit");
          }

          const data = await response.json();

          // Transformer les données pour le formulaire
          const kitData: KitData = {
            nom: data.nom,
            style: data.style,
            description: data.description || undefined,
            products: data.kitProducts.map(
              (kp: { product: { id: string }; quantite: number }) => ({
                productId: kp.product.id,
                quantite: kp.quantite,
              })
            ),
          };

          setKit(kitData);
          setKitName(data.nom);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Une erreur inattendue s'est produite"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchKit();
    }
  }, [kitId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Kit non trouvé
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 w-full">
        <div className="container mx-auto px-6">
          {/* Header moderne */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80 rounded-2xl mb-4">
              <Package2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Modifier le kit
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Modifiez les informations de{" "}
              <span className="font-semibold text-[#30C1BD]">
                &quot;{kitName}&quot;
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Calculs automatiques mis à jour en temps réel
              </span>
            </div>
          </div>

          {/* Formulaire */}
          <KitForm initialData={kit} kitId={kitId} />
        </div>
      </div>
    </RoleGuard>
  );
}
