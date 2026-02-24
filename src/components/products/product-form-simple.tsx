"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/schemas/product";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";

interface ProductFormSimpleProps {
  initialData?: Partial<ProductFormData>;
  productId?: string;
  onSuccess?: () => void;
}

export function ProductFormSimple({
  initialData,
  productId,
  onSuccess,
}: ProductFormSimpleProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nom: initialData?.nom || "",
      reference: initialData?.reference || "",
      description: initialData?.description ?? "",
      prixAchat1An: initialData?.prixAchat1An || 0,
      prixUnitaire1An: initialData?.prixUnitaire1An || 0,
      prixVente1An: initialData?.prixVente1An || 0,
      margeCoefficient: initialData?.margeCoefficient || 1.2,
      rechauffementClimatique: initialData?.rechauffementClimatique || 0,
      epuisementRessources: initialData?.epuisementRessources || 0,
      acidification: initialData?.acidification || 0,
      eutrophisation: initialData?.eutrophisation || 0,
      quantite: initialData?.quantite || undefined,
      surfaceM2: initialData?.surfaceM2 || undefined,
    },
    mode: "onSubmit",
  });

  const { register, handleSubmit, formState: { errors } } = form;

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      await response.json();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/products");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (_errors: Record<string, unknown>) => {
    // Validation errors are displayed in the form UI
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Formulaire Produit Simplifié</h2>
      
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du produit *</Label>
            <Input
              id="nom"
              {...register("nom")}
              placeholder="VIT0108: Vitra Eames Plastic"
              className={errors.nom ? "border-red-500" : ""}
            />
            {errors.nom && <p className="text-sm text-red-500">{errors.nom.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Référence *</Label>
            <Input
              id="reference"
              {...register("reference")}
              placeholder="VIT0108:"
              className={errors.reference ? "border-red-500" : ""}
            />
            {errors.reference && <p className="text-sm text-red-500">{errors.reference.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Description du produit..."
            rows={3}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="quantite">Quantité (optionnel)</Label>
            <Input
              id="quantite"
              type="number"
              {...register("quantite", { valueAsNumber: true })}
              placeholder="4"
            />
            {errors.quantite && <p className="text-sm text-red-500">{errors.quantite.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="surfaceM2">Surface (m²) (optionnel)</Label>
            <Input
              id="surfaceM2"
              type="number"
              step="0.01"
              {...register("surfaceM2", { valueAsNumber: true })}
              placeholder="2.5"
            />
            {errors.surfaceM2 && <p className="text-sm text-red-500">{errors.surfaceM2.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tarification 1 an *</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="margeCoefficient">Coefficient de marge *</Label>
              <Input
                id="margeCoefficient"
                type="number"
                step="0.1"
                {...register("margeCoefficient", { valueAsNumber: true })}
                placeholder="1.2"
                className={errors.margeCoefficient ? "border-red-500" : ""}
              />
              {errors.margeCoefficient && <p className="text-sm text-red-500">{errors.margeCoefficient.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prixAchat1An">Prix d&apos;achat *</Label>
              <Input
                id="prixAchat1An"
                type="number"
                step="0.01"
                {...register("prixAchat1An", { valueAsNumber: true })}
                placeholder="250"
                className={errors.prixAchat1An ? "border-red-500" : ""}
              />
              {errors.prixAchat1An && <p className="text-sm text-red-500">{errors.prixAchat1An.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prixUnitaire1An">Prix unitaire *</Label>
              <Input
                id="prixUnitaire1An"
                type="number"
                step="0.01"
                {...register("prixUnitaire1An", { valueAsNumber: true })}
                placeholder="300"
                className={errors.prixUnitaire1An ? "border-red-500" : ""}
              />
              {errors.prixUnitaire1An && <p className="text-sm text-red-500">{errors.prixUnitaire1An.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prixVente1An">Prix de vente *</Label>
              <Input
                id="prixVente1An"
                type="number"
                step="0.01"
                {...register("prixVente1An", { valueAsNumber: true })}
                placeholder="310"
                className={errors.prixVente1An ? "border-red-500" : ""}
              />
              {errors.prixVente1An && <p className="text-sm text-red-500">{errors.prixVente1An.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Impact environnemental *</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rechauffementClimatique">Réchauffement climatique *</Label>
              <Input
                id="rechauffementClimatique"
                type="number"
                step="0.01"
                {...register("rechauffementClimatique", { valueAsNumber: true })}
                placeholder="150"
                className={errors.rechauffementClimatique ? "border-red-500" : ""}
              />
              {errors.rechauffementClimatique && <p className="text-sm text-red-500">{errors.rechauffementClimatique.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="epuisementRessources">Épuisement ressources *</Label>
              <Input
                id="epuisementRessources"
                type="number"
                step="0.01"
                {...register("epuisementRessources", { valueAsNumber: true })}
                placeholder="150"
                className={errors.epuisementRessources ? "border-red-500" : ""}
              />
              {errors.epuisementRessources && <p className="text-sm text-red-500">{errors.epuisementRessources.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acidification">Acidification *</Label>
              <Input
                id="acidification"
                type="number"
                step="0.01"
                {...register("acidification", { valueAsNumber: true })}
                placeholder="150"
                className={errors.acidification ? "border-red-500" : ""}
              />
              {errors.acidification && <p className="text-sm text-red-500">{errors.acidification.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eutrophisation">Eutrophisation *</Label>
              <Input
                id="eutrophisation"
                type="number"
                step="0.01"
                {...register("eutrophisation", { valueAsNumber: true })}
                placeholder="150"
                className={errors.eutrophisation ? "border-red-500" : ""}
              />
              {errors.eutrophisation && <p className="text-sm text-red-500">{errors.eutrophisation.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : productId ? "Mettre à jour" : "Créer le produit"}
          </Button>
        </div>
      </form>
    </div>
  );
}