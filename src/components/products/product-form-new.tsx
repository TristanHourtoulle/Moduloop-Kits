"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useZodForm } from "@/lib/forms";
import { productSchema, type ProductFormData } from "@/lib/schemas/product";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion } from "@/components/ui/accordion";
import { useSession } from "@/lib/auth-client";

// Import des sections
import { GeneralInfoSection } from "./form-sections/general-info-section";
import { ImageSection } from "./form-sections/image-section";
import { PricingSection } from "./form-sections/pricing-section";
import { EnvironmentalSection } from "./form-sections/environmental-section";
import { FormActions } from "./form-sections/form-actions";

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  productId?: string;
  onSuccess?: () => void;
}

export function ProductForm({
  initialData,
  productId,
  onSuccess,
}: ProductFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useZodForm(productSchema, {
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProductFormData) => {
    if (!session?.user) {
      setError("Vous devez être connecté pour créer un produit");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/products");
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
          defaultValue={["general"]}
          className="space-y-4"
        >
          <GeneralInfoSection register={register} errors={errors} />

          <ImageSection
            setValue={setValue}
            errors={errors}
            initialImage={initialData?.image}
            onError={handleError}
          />

          <PricingSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />

          <EnvironmentalSection register={register} errors={errors} />
        </Accordion>

        <FormActions
          isLoading={isLoading}
          productId={productId}
          onReset={reset}
        />
      </form>
    </div>
  );
}
