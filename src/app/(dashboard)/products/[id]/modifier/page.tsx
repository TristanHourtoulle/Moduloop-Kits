"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertTriangle } from "lucide-react";
import { ProductFormData } from "@/lib/schemas/product";

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProduct = async (showSuccessMessage = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`, {
        cache: "no-store", // Éviter le cache du navigateur
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Produit non trouvé");
        }
        throw new Error("Erreur lors du chargement du produit");
      }

      const data = await response.json();
      setProduct(data);

      // Afficher un message de succès temporaire après le refetch (uniquement si demandé)
      if (showSuccessMessage) {
        setSuccessMessage("Produit mis à jour avec succès !");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
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

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

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

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Produit non trouvé
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 w-full">
        <div className="container mx-auto px-6">
          {/* Message de succès */}
          {successMessage && (
            <div className="mb-6 mx-auto max-w-2xl">
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {successMessage}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Header moderne */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80 rounded-2xl mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Modifier le produit
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Modifiez les informations de{" "}
              <span className="font-semibold text-[#30C1BD]">
                &quot;{product.nom}&quot;
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Package className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Référence: {product.reference}
              </span>
            </div>
          </div>

          {/* Formulaire */}
          <ProductForm
            initialData={product}
            productId={productId}
            onSuccess={() => fetchProduct(true)}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
