"use client";

import { useState } from "react";
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
  initialData?: Partial<KitFormData>;
  kitId?: string;
  onSuccess?: () => void;
}

export function KitForm({ initialData, kitId, onSuccess }: KitFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useZodForm(kitSchema, {
    defaultValues: initialData || {
      products: [],
    },
  });

  const onSubmit = async (data: KitFormData) => {
    if (!session?.user) {
      setError("Vous devez être connecté pour créer un kit");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Regrouper les produits identiques avant soumission
      const groupedProducts = data.products.reduce((acc, product) => {
        const existingProduct = acc.find(
          (p) => p.productId === product.productId
        );
        if (existingProduct) {
          existingProduct.quantite += product.quantite;
        } else {
          acc.push({ ...product });
        }
        return acc;
      }, [] as typeof data.products);

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

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/kits");
        router.refresh();
      }
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue s'est produite"
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
          <KitGeneralInfoSection register={register} errors={errors} />

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
