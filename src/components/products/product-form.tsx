'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZodForm } from '@/lib/forms';
import { productSchema, type ProductFormData } from '@/lib/schemas/product';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion } from '@/components/ui/accordion';
import { useSession } from '@/lib/auth-client';
import { cleanProductDataForForm } from '@/lib/utils/form-data';

// Import des sections
import { GeneralInfoSection } from './form-sections/general-info-section';
import { ImageSection } from './form-sections/image-section';
import { PricingEnvironmentalSection } from './form-sections/pricing-environmental-section';
import { FormActions } from './form-sections/form-actions';
import { FormErrorsDebug } from './form-sections/form-errors-debug';

interface ProductFormProps {
  readonly initialData?: Partial<ProductFormData>;
  readonly productId?: string;
}

export function ProductForm({
  initialData,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Préparer les valeurs par défaut
  const defaultValues: Partial<ProductFormData> = {
    nom: '',
    reference: '',
    description: '',
    // Valeurs par défaut pour les champs legacy requis
    prixAchat1An: 0,
    prixUnitaire1An: 0,
    prixVente1An: 0,
    margeCoefficient: 1.2,
    rechauffementClimatique: 0,
    epuisementRessources: 0,
    acidification: 0,
    eutrophisation: 0,
    // Champs optionnels
    quantite: undefined,
    surfaceM2: undefined,
    prixAchat2Ans: undefined,
    prixUnitaire2Ans: undefined,
    prixVente2Ans: undefined,
    prixAchat3Ans: undefined,
    prixUnitaire3Ans: undefined,
    prixVente3Ans: undefined,
    image: undefined,
    // Nouveaux champs
    prixAchatAchat1An: undefined,
    prixUnitaireAchat1An: undefined,
    prixVenteAchat1An: undefined,
    margeCoefficientAchat: 1.2,
    prixAchatLocation1An: undefined,
    prixAchatLocation2Ans: undefined,
    prixAchatLocation3Ans: undefined,
    prixUnitaireLocation1An: undefined,
    prixUnitaireLocation2Ans: undefined,
    prixUnitaireLocation3Ans: undefined,
    prixVenteLocation1An: undefined,
    prixVenteLocation2Ans: undefined,
    prixVenteLocation3Ans: undefined,
    margeCoefficientLocation: 1.2,
    rechauffementClimatiqueLocation: undefined,
    epuisementRessourcesLocation: undefined,
    acidificationLocation: undefined,
    eutrophisationLocation: undefined,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useZodForm(productSchema, {
    defaultValues: defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // Reset form when initialData changes (crucial for edit mode)
  // Only reset once when the component mounts with initialData
  useEffect(() => {
    if (initialData) {
      // Nettoyer les données initiales pour convertir null en undefined
      const cleanedInitialData = cleanProductDataForForm(initialData);

      reset({ ...defaultValues, ...cleanedInitialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]); // Only reset when productId changes, not when initialData object reference changes

  const onSubmit = async (data: ProductFormData) => {
    // Vérifier si on a des erreurs de validation
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      setError(
        'Des erreurs de validation sont présentes dans le formulaire. Veuillez les corriger avant de continuer.'
      );
      return;
    }

    if (!session?.user) {
      setError('Vous devez être connecté pour créer un produit');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Erreur de communication avec le serveur' }));
        throw new Error(
          errorData.error || `Erreur ${response.status} lors de la sauvegarde`
        );
      }

      // Invalidate the router cache to ensure fresh data on next visit
      router.refresh();

      // Add delay to ensure cache invalidation completes on Vercel
      // Check if we're on Vercel by looking for Vercel-specific environment variable
      const isProduction =
        typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        !window.location.hostname.includes("127.0.0.1");

      if (isProduction) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Redirect to products list with timestamp to trigger refetch (like kits)
      router.push("/products?updated=" + Date.now());
    } catch (err) {
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
    <div className='max-w-4xl mx-auto'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {error && (
          <Alert className='border-red-200 bg-red-50'>
            <AlertDescription className='text-red-800'>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <FormErrorsDebug errors={errors} />

        <Accordion
          type='multiple'
          defaultValue={['general']}
          className='space-y-4'
        >
          <GeneralInfoSection register={register} errors={errors} />

          <ImageSection
            setValue={setValue}
            errors={errors}
            initialImage={initialData?.image}
            onError={handleError}
          />

          <PricingEnvironmentalSection
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
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
