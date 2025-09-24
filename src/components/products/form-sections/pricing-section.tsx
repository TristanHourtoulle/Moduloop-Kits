"use client";

import { useEffect, useState } from "react";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Euro, Calculator, TrendingUp, Info, ShoppingCart, Home } from "lucide-react";
import { ProductFormData, PurchaseRentalMode } from "@/lib/schemas/product";

interface PricingSectionProps {
  register: UseFormRegister<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function PricingSection({
  register,
  watch,
  setValue,
  errors,
}: PricingSectionProps) {
  const [activeMode, setActiveMode] = useState<PurchaseRentalMode>('achat');
  
  // Watch des valeurs pour les calculs automatiques
  const watchedValues = {
    // Achat
    prixAchatAchat1An: watch("prixAchatAchat1An"),
    prixAchatAchat2Ans: watch("prixAchatAchat2Ans"),
    prixAchatAchat3Ans: watch("prixAchatAchat3Ans"),
    prixUnitaireAchat1An: watch("prixUnitaireAchat1An"),
    prixUnitaireAchat2Ans: watch("prixUnitaireAchat2Ans"),
    prixUnitaireAchat3Ans: watch("prixUnitaireAchat3Ans"),
    margeCoefficientAchat: watch("margeCoefficientAchat"),
    
    // Location
    prixAchatLocation1An: watch("prixAchatLocation1An"),
    prixAchatLocation2Ans: watch("prixAchatLocation2Ans"),
    prixAchatLocation3Ans: watch("prixAchatLocation3Ans"),
    prixUnitaireLocation1An: watch("prixUnitaireLocation1An"),
    prixUnitaireLocation2Ans: watch("prixUnitaireLocation2Ans"),
    prixUnitaireLocation3Ans: watch("prixUnitaireLocation3Ans"),
    margeCoefficientLocation: watch("margeCoefficientLocation"),
    
    // Commun
    quantite: watch("quantite") || 1,
  };

  // Calcul automatique du prix unitaire basé sur la marge pour ACHAT
  useEffect(() => {
    if (watchedValues.margeCoefficientAchat && watchedValues.margeCoefficientAchat > 0) {
      if (watchedValues.prixAchatAchat1An && watchedValues.prixAchatAchat1An > 0) {
        // Formule: Prix de Revient / (1 - % de marge) = Prix de vente
        // Le coefficient représente directement le multiplicateur (ex: 1.25 pour 20% de marge)
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatAchat1An * watchedValues.margeCoefficientAchat).toFixed(2));
        setValue("prixUnitaireAchat1An", nouveauPrixUnitaire);
      }
      if (watchedValues.prixAchatAchat2Ans && watchedValues.prixAchatAchat2Ans > 0) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatAchat2Ans * watchedValues.margeCoefficientAchat).toFixed(2));
        setValue("prixUnitaireAchat2Ans", nouveauPrixUnitaire);
      }
      if (watchedValues.prixAchatAchat3Ans && watchedValues.prixAchatAchat3Ans > 0) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatAchat3Ans * watchedValues.margeCoefficientAchat).toFixed(2));
        setValue("prixUnitaireAchat3Ans", nouveauPrixUnitaire);
      }
    }
  }, [watchedValues.margeCoefficientAchat, watchedValues.prixAchatAchat1An, watchedValues.prixAchatAchat2Ans, watchedValues.prixAchatAchat3Ans, setValue]);

  // Calcul automatique du prix unitaire basé sur la marge pour LOCATION
  useEffect(() => {
    if (watchedValues.margeCoefficientLocation && watchedValues.margeCoefficientLocation > 0) {
      if (watchedValues.prixAchatLocation1An && watchedValues.prixAchatLocation1An > 0) {
        // Formule: Prix de Revient / (1 - % de marge) = Prix de vente
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatLocation1An * watchedValues.margeCoefficientLocation).toFixed(2));
        setValue("prixUnitaireLocation1An", nouveauPrixUnitaire);
      }
      if (watchedValues.prixAchatLocation2Ans && watchedValues.prixAchatLocation2Ans > 0) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatLocation2Ans * watchedValues.margeCoefficientLocation).toFixed(2));
        setValue("prixUnitaireLocation2Ans", nouveauPrixUnitaire);
      }
      if (watchedValues.prixAchatLocation3Ans && watchedValues.prixAchatLocation3Ans > 0) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatLocation3Ans * watchedValues.margeCoefficientLocation).toFixed(2));
        setValue("prixUnitaireLocation3Ans", nouveauPrixUnitaire);
      }
    }
  }, [watchedValues.margeCoefficientLocation, watchedValues.prixAchatLocation1An, watchedValues.prixAchatLocation2Ans, watchedValues.prixAchatLocation3Ans, setValue]);

  // Calcul automatique du prix total basé sur le prix unitaire et la quantité pour ACHAT
  useEffect(() => {
    if (watchedValues.prixUnitaireAchat1An && watchedValues.prixUnitaireAchat1An > 0) {
      setValue("prixVenteAchat1An", Number((watchedValues.prixUnitaireAchat1An * watchedValues.quantite).toFixed(2)));
    }
    if (watchedValues.prixUnitaireAchat2Ans && watchedValues.prixUnitaireAchat2Ans > 0) {
      setValue("prixVenteAchat2Ans", Number((watchedValues.prixUnitaireAchat2Ans * watchedValues.quantite).toFixed(2)));
    }
    if (watchedValues.prixUnitaireAchat3Ans && watchedValues.prixUnitaireAchat3Ans > 0) {
      setValue("prixVenteAchat3Ans", Number((watchedValues.prixUnitaireAchat3Ans * watchedValues.quantite).toFixed(2)));
    }
  }, [watchedValues.prixUnitaireAchat1An, watchedValues.prixUnitaireAchat2Ans, watchedValues.prixUnitaireAchat3Ans, watchedValues.quantite, setValue]);

  // Calcul automatique du prix total basé sur le prix unitaire et la quantité pour LOCATION
  useEffect(() => {
    if (watchedValues.prixUnitaireLocation1An && watchedValues.prixUnitaireLocation1An > 0) {
      setValue("prixVenteLocation1An", Number((watchedValues.prixUnitaireLocation1An * watchedValues.quantite).toFixed(2)));
    }
    if (watchedValues.prixUnitaireLocation2Ans && watchedValues.prixUnitaireLocation2Ans > 0) {
      setValue("prixVenteLocation2Ans", Number((watchedValues.prixUnitaireLocation2Ans * watchedValues.quantite).toFixed(2)));
    }
    if (watchedValues.prixUnitaireLocation3Ans && watchedValues.prixUnitaireLocation3Ans > 0) {
      setValue("prixVenteLocation3Ans", Number((watchedValues.prixUnitaireLocation3Ans * watchedValues.quantite).toFixed(2)));
    }
  }, [watchedValues.prixUnitaireLocation1An, watchedValues.prixUnitaireLocation2Ans, watchedValues.prixUnitaireLocation3Ans, watchedValues.quantite, setValue]);

  const handleCalculatePrix = (mode: PurchaseRentalMode) => {
    if (mode === 'achat') {
      const coefficient = watchedValues.margeCoefficientAchat;
      if (watchedValues.prixAchatAchat1An && coefficient) {
        // Formule: Prix de Revient / (1 - % de marge) = Prix de vente
        // Le coefficient est le multiplicateur direct (ex: 1.25 pour 20% de marge)
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatAchat1An * coefficient).toFixed(2));
        setValue("prixUnitaireAchat1An", nouveauPrixUnitaire);
        setValue("prixVenteAchat1An", Number((nouveauPrixUnitaire * watchedValues.quantite).toFixed(2)));
      }
      if (watchedValues.prixAchatAchat2Ans && coefficient) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatAchat2Ans * coefficient).toFixed(2));
        setValue("prixUnitaireAchat2Ans", nouveauPrixUnitaire);
        setValue("prixVenteAchat2Ans", Number((nouveauPrixUnitaire * watchedValues.quantite).toFixed(2)));
      }
      if (watchedValues.prixAchatAchat3Ans && coefficient) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatAchat3Ans * coefficient).toFixed(2));
        setValue("prixUnitaireAchat3Ans", nouveauPrixUnitaire);
        setValue("prixVenteAchat3Ans", Number((nouveauPrixUnitaire * watchedValues.quantite).toFixed(2)));
      }
    } else {
      const coefficient = watchedValues.margeCoefficientLocation;
      if (watchedValues.prixAchatLocation1An && coefficient) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatLocation1An * coefficient).toFixed(2));
        setValue("prixUnitaireLocation1An", nouveauPrixUnitaire);
        setValue("prixVenteLocation1An", Number((nouveauPrixUnitaire * watchedValues.quantite).toFixed(2)));
      }
      if (watchedValues.prixAchatLocation2Ans && coefficient) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatLocation2Ans * coefficient).toFixed(2));
        setValue("prixUnitaireLocation2Ans", nouveauPrixUnitaire);
        setValue("prixVenteLocation2Ans", Number((nouveauPrixUnitaire * watchedValues.quantite).toFixed(2)));
      }
      if (watchedValues.prixAchatLocation3Ans && coefficient) {
        const nouveauPrixUnitaire = Number((watchedValues.prixAchatLocation3Ans * coefficient).toFixed(2));
        setValue("prixUnitaireLocation3Ans", nouveauPrixUnitaire);
        setValue("prixVenteLocation3Ans", Number((nouveauPrixUnitaire * watchedValues.quantite).toFixed(2)));
      }
    }
  };

  const getMarge = (prixAchat: number | undefined, prixUnitaire: number | undefined) => {
    if (!prixAchat || !prixUnitaire || prixAchat === 0) return 0;
    // Calcul de la marge sur prix de vente : Marge% = (PV - PR) / PV * 100
    // Formule inverse du coefficient : si PV = PR * coeff, alors Marge% = (1 - 1/coeff) * 100
    const coefficient = prixUnitaire / prixAchat;
    return Number(((1 - 1/coefficient) * 100).toFixed(1));
  };

  const renderPricingForm = (mode: PurchaseRentalMode) => {
    const suffix = mode === 'achat' ? 'Achat' : 'Location';
    const modeLabel = mode === 'achat' ? 'Achat' : 'Location';
    const modeIcon = mode === 'achat' ? ShoppingCart : Home;
    
    return (
      <div className="space-y-6">
        {/* Coefficient de marge */}
        <div className="bg-gradient-to-r from-[#30C1BD]/5 to-green-50 p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-[#30C1BD]" />
            <h4 className="font-semibold text-gray-900">
              Coefficient de marge - {modeLabel}
            </h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id={`margeCoefficient${suffix}`}
                type="number"
                step="0.001"
                {...register(`margeCoefficient${suffix}` as keyof ProductFormData, {
                  setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                })}
                placeholder="Ex: 1.2"
                min="1"
                max="10"
                className={`transition-colors ${
                  errors[`margeCoefficient${suffix}` as keyof ProductFormData]
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                }`}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCalculatePrix(mode)}
              className="flex items-center gap-2 border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white cursor-pointer"
            >
              <Calculator className="h-4 w-4" />
              Calculer les prix
            </Button>
          </div>
          {errors[`margeCoefficient${suffix}` as keyof ProductFormData] && (
            <p className="text-sm text-red-500 mt-2">
              {errors[`margeCoefficient${suffix}` as keyof ProductFormData]?.message}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-2">
            Ex: 1.25 = 20% de marge • 1.43 = 30% de marge • 2.0 = 50% de marge
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Les prix unitaires Moduloop sont calculés automatiquement avec la marge
          </p>
        </div>

        {/* Tarification par période */}
        <div className="space-y-6">
          {/* 1 an */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#30C1BD] rounded-full"></div>
                Tarification 1 an * - {modeLabel}
              </h4>
              {watchedValues[`prixAchat${suffix}1An` as keyof typeof watchedValues] && watchedValues[`prixUnitaire${suffix}1An` as keyof typeof watchedValues] && (
                <span className="text-sm font-medium text-green-600">
                  Marge: {getMarge(
                    watchedValues[`prixAchat${suffix}1An` as keyof typeof watchedValues] as number,
                    watchedValues[`prixUnitaire${suffix}1An` as keyof typeof watchedValues] as number
                  )}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix d&apos;achat fournisseur
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixAchat${suffix}1An` as keyof ProductFormData, { 
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="250.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                </div>
                {errors[`prixAchat${suffix}1An` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixAchat${suffix}1An` as keyof ProductFormData]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix unitaire Moduloop
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixUnitaire${suffix}1An` as keyof ProductFormData, {
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="300.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                </div>
                {errors[`prixUnitaire${suffix}1An` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixUnitaire${suffix}1An` as keyof ProductFormData]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix total {watchedValues.quantite > 1 && `(×${watchedValues.quantite})`}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixVente${suffix}1An` as keyof ProductFormData, { 
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="300.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] font-semibold bg-gray-50 pr-8"
                    readOnly
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-semibold">€</span>
                </div>
                {errors[`prixVente${suffix}1An` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixVente${suffix}1An` as keyof ProductFormData]?.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Calculé automatiquement
                </p>
              </div>
            </div>
          </div>

          {/* 2 ans */}
          <div className="bg-gray-50 border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Tarification 2 ans (optionnel) - {modeLabel}
              </h4>
              {watchedValues[`prixAchat${suffix}2Ans` as keyof typeof watchedValues] && watchedValues[`prixUnitaire${suffix}2Ans` as keyof typeof watchedValues] && (
                <span className="text-sm font-medium text-green-600">
                  Marge: {getMarge(
                    watchedValues[`prixAchat${suffix}2Ans` as keyof typeof watchedValues] as number,
                    watchedValues[`prixUnitaire${suffix}2Ans` as keyof typeof watchedValues] as number
                  )}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix d&apos;achat fournisseur
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixAchat${suffix}2Ans` as keyof ProductFormData, {
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="450.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                </div>
                {errors[`prixAchat${suffix}2Ans` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixAchat${suffix}2Ans` as keyof ProductFormData]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix unitaire Moduloop
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixUnitaire${suffix}2Ans` as keyof ProductFormData, {
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="540.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                </div>
                {errors[`prixUnitaire${suffix}2Ans` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixUnitaire${suffix}2Ans` as keyof ProductFormData]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix total {watchedValues.quantite > 1 && `(×${watchedValues.quantite})`}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixVente${suffix}2Ans` as keyof ProductFormData, {
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="540.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] font-semibold bg-gray-50 pr-8"
                    readOnly
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-semibold">€</span>
                </div>
                {errors[`prixVente${suffix}2Ans` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixVente${suffix}2Ans` as keyof ProductFormData]?.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Calculé automatiquement
                </p>
              </div>
            </div>
          </div>

          {/* 3 ans */}
          <div className="bg-gray-50 border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Tarification 3 ans (optionnel) - {modeLabel}
              </h4>
              {watchedValues[`prixAchat${suffix}3Ans` as keyof typeof watchedValues] && watchedValues[`prixUnitaire${suffix}3Ans` as keyof typeof watchedValues] && (
                <span className="text-sm font-medium text-green-600">
                  Marge: {getMarge(
                    watchedValues[`prixAchat${suffix}3Ans` as keyof typeof watchedValues] as number,
                    watchedValues[`prixUnitaire${suffix}3Ans` as keyof typeof watchedValues] as number
                  )}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix d&apos;achat fournisseur
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixAchat${suffix}3Ans` as keyof ProductFormData, {
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="650.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                </div>
                {errors[`prixAchat${suffix}3Ans` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixAchat${suffix}3Ans` as keyof ProductFormData]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix unitaire Moduloop
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixUnitaire${suffix}3Ans` as keyof ProductFormData, {
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="780.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
                </div>
                {errors[`prixUnitaire${suffix}3Ans` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixUnitaire${suffix}3Ans` as keyof ProductFormData]?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Prix total {watchedValues.quantite > 1 && `(×${watchedValues.quantite})`}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prixVente${suffix}3Ans` as keyof ProductFormData, {
                      setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
                    })}
                    placeholder="780.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] font-semibold bg-gray-50 pr-8"
                    readOnly
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-semibold">€</span>
                </div>
                {errors[`prixVente${suffix}3Ans` as keyof ProductFormData] && (
                  <p className="text-sm text-red-500">
                    {errors[`prixVente${suffix}3Ans` as keyof ProductFormData]?.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Calculé automatiquement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AccordionItem value="pricing" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Euro className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Tarification</h3>
            <p className="text-sm text-gray-500">
              Prix d&apos;achat, location et marges
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        {/* Note d'information */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Différence Achat / Location :</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Achat</strong> : Prix pour l'acquisition définitive d'équipements neufs</li>
                <li>• <strong>Location</strong> : Prix pour la location temporaire d'équipements existants</li>
                <li>• Chaque mode a ses propres prix et impacts environnementaux</li>
              </ul>
            </div>
          </div>
        </div>

        <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as PurchaseRentalMode)}>
          <div className='relative mb-8'>
            {/* Navigation d'onglets moderne */}
            <div className='overflow-x-auto scrollbar-hide'>
              <TabsList className='inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 text-gray-500 shadow-lg border border-gray-200/50 backdrop-blur-sm min-w-full lg:min-w-0'>
                <div className='flex space-x-1 w-full lg:w-auto'>
                  <TabsTrigger 
                    value='achat'
                    className='relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80 
                    hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 data-[state=active]:opacity-5 transition-opacity duration-300'></div>
                    <ShoppingCart className={`w-4 h-4 mr-2 transition-colors duration-200 ${activeMode === 'achat' ? 'text-[#30C1BD]' : ''}`} />
                    <span className='text-sm font-medium'>Achat</span>
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full transition-all duration-300 ${activeMode === 'achat' ? 'w-8' : 'w-0'}`}></div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value='location'
                    className='relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 
                    data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80 
                    hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group'
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 data-[state=active]:opacity-5 transition-opacity duration-300'></div>
                    <Home className={`w-4 h-4 mr-2 transition-colors duration-200 ${activeMode === 'location' ? 'text-[#30C1BD]' : ''}`} />
                    <span className='text-sm font-medium'>Location</span>
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full transition-all duration-300 ${activeMode === 'location' ? 'w-8' : 'w-0'}`}></div>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>
          </div>

          <TabsContent value="achat">
            {renderPricingForm('achat')}
          </TabsContent>

          <TabsContent value="location">
            {renderPricingForm('location')}
          </TabsContent>
        </Tabs>
      </AccordionContent>
    </AccordionItem>
  );
}