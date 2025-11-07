"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useZodForm } from "@/lib/forms";
import { kitSchema, type KitFormData } from "@/lib/schemas/kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion } from "@/components/ui/accordion";
import { useSession } from "@/lib/auth-client";

// Import des sections
import { KitGeneralInfoSection } from "./form-sections/kit-general-info-section";
import { KitProductsSection } from "./form-sections/kit-products-section";
import { KitFormActions } from "./form-sections/kit-form-actions";

interface KitFormProps {
  readonly initialData?: Partial<KitFormData>;
  readonly kitId?: string;
}

export function KitForm({ initialData, kitId }: KitFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("[KitForm] Component mounted/updated:", {
    kitId,
    hasInitialData: !!initialData,
    initialDataName: initialData?.nom,
    productsCount: initialData?.products?.length || 0,
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    getValues,
  } = useZodForm(kitSchema, {
    defaultValues: {
      products: [],
    },
  });

  // Réinitialiser le formulaire quand les données changent
  useEffect(() => {
    if (initialData) {
      console.log("[KitForm] Resetting form with initial data:", {
        nom: initialData.nom,
        style: initialData.style,
        productsCount: initialData.products?.length || 0,
      });

      reset({
        nom: initialData.nom || "",
        style: initialData.style || "",
        description: initialData.description,
        surfaceM2: initialData.surfaceM2,
        products: initialData.products || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitId]); // Reset when kitId changes

  const onSubmit = async (data: KitFormData) => {
    if (!session?.user) {
      setError("Vous devez être connecté pour créer un kit");
      return;
    }

    console.log("[KitForm] Submitting form:", {
      kitId,
      action: kitId ? "UPDATE" : "CREATE",
      nom: data.nom,
      productsCount: data.products.length,
    });

    setIsLoading(true);
    setError(null);

    try {
      // Regrouper les produits identiques avant soumission
      const groupedProducts = data.products.reduce(
        (acc, product) => {
          const existingProduct = acc.find(
            (p) => p.productId === product.productId,
          );
          if (existingProduct) {
            existingProduct.quantite += product.quantite;
          } else {
            acc.push({ ...product });
          }
          return acc;
        },
        [] as typeof data.products,
      );

      console.log("[KitForm] Products grouped:", {
        original: data.products.length,
        grouped: groupedProducts.length,
      });

      const url = kitId ? `/api/kits/${kitId}` : "/api/kits";
      const method = kitId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          products: groupedProducts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      const savedKit = await response.json();
      console.log("[KitForm] Kit saved successfully:", {
        kitId: savedKit.id,
        nom: savedKit.nom,
      });

      // Add delay to ensure cache invalidation completes on Vercel
      // Check if we're on Vercel by looking for Vercel-specific environment variable
      const isProduction =
        typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        !window.location.hostname.includes("127.0.0.1");

      if (isProduction) {
        console.log("[KitForm] Waiting for cache invalidation to propagate...");
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Redirect to kits list with timestamp to trigger refetch
      const redirectUrl = "/kits?updated=" + Date.now();
      console.log("[KitForm] Redirecting to:", redirectUrl);
      router.push(redirectUrl);
    } catch (err) {
      console.error("[KitForm] Error submitting form:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue s'est produite",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Accordion
          type="multiple"
          defaultValue={["general", "products"]}
          className="space-y-4"
        >
          <KitGeneralInfoSection control={control} errors={errors} />

          <KitProductsSection
            control={control}
            errors={errors}
            onError={handleError}
          />
        </Accordion>

        <KitFormActions isLoading={isLoading} kitId={kitId} onReset={reset} />
      </form>
    </div>
  );
}
