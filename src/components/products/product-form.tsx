'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZodForm } from '@/lib/forms';
import { productSchema, type ProductFormData } from '@/lib/schemas/product';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion } from '@/components/ui/accordion';
import { useSession } from '@/lib/auth-client';
import { parseNumberValue } from '@/lib/utils/form-helpers';
import { cleanProductDataForForm } from '@/lib/utils/form-data';

// Import des sections
import { GeneralInfoSection } from './form-sections/general-info-section';
import { ImageSection } from './form-sections/image-section';
import { PricingEnvironmentalSection } from './form-sections/pricing-environmental-section';
import { FormActions } from './form-sections/form-actions';
import { FormErrorsDebug } from './form-sections/form-errors-debug';

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

  // Debug logging
  console.log('[ProductForm] Component mounted with:', {
    initialData,
    productId,
    isEditMode: !!productId,
  });

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

  // Nettoyer les données initiales pour convertir null en undefined
  const cleanedInitialData = initialData
    ? cleanProductDataForForm(initialData)
    : null;

  // Debug: comparer les données avant/après nettoyage
  if (initialData && cleanedInitialData) {
    console.log('[ProductForm] Raw initial data:', initialData);
    console.log('[ProductForm] Cleaned initial data:', cleanedInitialData);

    // Identifier les champs qui ont changé
    const changedFields = Object.keys(initialData).filter(
      (key) => (initialData as any)[key] !== (cleanedInitialData as any)[key]
    );
    if (changedFields.length > 0) {
      console.log(
        '[ProductForm] Fields cleaned (null -> undefined):',
        changedFields
      );
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useZodForm(productSchema, {
    defaultValues: cleanedInitialData
      ? { ...defaultValues, ...cleanedInitialData }
      : defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // Debug: log form state changes
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log('[ProductForm] Field changed:', {
        name,
        type,
        value: value[name as keyof typeof value],
      });

      // Debug spécial pour description
      if (name === 'description') {
        console.log('[ProductForm] Description debug:', {
          rawValue: value[name as keyof typeof value],
          allFormValues: value,
          descriptionType: typeof value.description,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: ProductFormData) => {
    console.log('[ProductForm] onSubmit called with data:', data);
    console.log('[ProductForm] Form errors:', errors);
    console.log('[ProductForm] ProductId:', productId);
    console.log('[ProductForm] Is editing:', !!productId);
    console.log('[ProductForm] Data types:', {
      nom: typeof data.nom,
      reference: typeof data.reference,
      prixAchat1An: typeof data.prixAchat1An,
      margeCoefficient: typeof data.margeCoefficient,
    });

    // Vérifier si on a des erreurs de validation
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      console.error('[ProductForm] Validation errors found:', errors);
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

      console.log('[ProductForm] Sending request to:', url);
      console.log('[ProductForm] Request body:', JSON.stringify(data, null, 2));

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('[ProductForm] Response status:', response.status);
      console.log(
        '[ProductForm] Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Erreur de communication avec le serveur' }));
        console.error('[ProductForm] API Error:', errorData);
        throw new Error(
          errorData.error || `Erreur ${response.status} lors de la sauvegarde`
        );
      }

      console.log('[ProductForm] Success! Product saved:', {
        productId,
        isEdit: !!productId,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Afficher un message de succès temporaire
        const successMessage = productId
          ? 'Produit modifié avec succès !'
          : 'Produit créé avec succès !';

        // On pourrait ajouter un toast notification ici
        console.log('[ProductForm]', successMessage);

        router.push('/products');
        router.refresh();
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
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
