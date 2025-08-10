"use client";

import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Euro, Calculator, TrendingUp } from "lucide-react";
import { ProductFormData } from "@/lib/schemas/product";

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
  const prixAchat1An = watch("prixAchat1An");
  const prixAchat2Ans = watch("prixAchat2Ans");
  const prixAchat3Ans = watch("prixAchat3Ans");
  const margeCoefficient = watch("margeCoefficient");

  const handleCalculatePrix = () => {
    if (prixAchat1An && margeCoefficient) {
      setValue(
        "prixVente1An",
        Number((prixAchat1An * margeCoefficient).toFixed(2))
      );
    }
    if (prixAchat2Ans && margeCoefficient) {
      setValue(
        "prixVente2Ans",
        Number((prixAchat2Ans * margeCoefficient).toFixed(2))
      );
    }
    if (prixAchat3Ans && margeCoefficient) {
      setValue(
        "prixVente3Ans",
        Number((prixAchat3Ans * margeCoefficient).toFixed(2))
      );
    }
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
              Prix d&apos;achat, marge et prix de vente
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-8">
          {/* Coefficient de marge */}
          <div className="bg-gradient-to-r from-[#30C1BD]/5 to-green-50 p-6 rounded-lg border">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-[#30C1BD]" />
              <h4 className="font-semibold text-gray-900">
                Coefficient de marge
              </h4>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="margeCoefficient"
                  type="number"
                  step="0.1"
                  {...register("margeCoefficient", {
                    valueAsNumber: true,
                  })}
                  placeholder="Ex: 1.2"
                  min="1"
                  max="10"
                  className={`transition-colors ${
                    errors.margeCoefficient
                      ? "border-red-500 focus:border-red-500"
                      : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  }`}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCalculatePrix}
                className="flex items-center gap-2 border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white cursor-pointer"
              >
                <Calculator className="h-4 w-4" />
                Calculer les prix
              </Button>
            </div>
            {errors.margeCoefficient && (
              <p className="text-sm text-red-500 mt-2">
                {errors.margeCoefficient.message}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-2">
              Ex: 1.2 = 20% de marge • 1.5 = 50% de marge • 2.0 = 100% de marge
            </p>
          </div>

          {/* Tarification par période */}
          <div className="space-y-6">
            {/* 1 an */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#30C1BD] rounded-full"></div>
                Tarification 1 an *
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix d&apos;achat fournisseur
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixAchat1An", { valueAsNumber: true })}
                    placeholder="250.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  {errors.prixAchat1An && (
                    <p className="text-sm text-red-500">
                      {errors.prixAchat1An.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix unitaire Moduloop
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixUnitaire1An", {
                      valueAsNumber: true,
                    })}
                    placeholder="300.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  {errors.prixUnitaire1An && (
                    <p className="text-sm text-red-500">
                      {errors.prixUnitaire1An.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix de vente total
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixVente1An", { valueAsNumber: true })}
                    placeholder="300.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] font-semibold"
                  />
                  {errors.prixVente1An && (
                    <p className="text-sm text-red-500">
                      {errors.prixVente1An.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2 ans */}
            <div className="bg-gray-50 border rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Tarification 2 ans (optionnel)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix d&apos;achat fournisseur
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixAchat2Ans", {
                      valueAsNumber: true,
                    })}
                    placeholder="450.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  {errors.prixAchat2Ans && (
                    <p className="text-sm text-red-500">
                      {errors.prixAchat2Ans.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix unitaire Moduloop
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixUnitaire2Ans", {
                      valueAsNumber: true,
                    })}
                    placeholder="540.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  {errors.prixUnitaire2Ans && (
                    <p className="text-sm text-red-500">
                      {errors.prixUnitaire2Ans.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix de vente total
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixVente2Ans", {
                      valueAsNumber: true,
                    })}
                    placeholder="540.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] font-semibold"
                  />
                  {errors.prixVente2Ans && (
                    <p className="text-sm text-red-500">
                      {errors.prixVente2Ans.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3 ans */}
            <div className="bg-gray-50 border rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Tarification 3 ans (optionnel)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix d&apos;achat fournisseur
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixAchat3Ans", {
                      valueAsNumber: true,
                    })}
                    placeholder="650.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  {errors.prixAchat3Ans && (
                    <p className="text-sm text-red-500">
                      {errors.prixAchat3Ans.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix unitaire Moduloop
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixUnitaire3Ans", {
                      valueAsNumber: true,
                    })}
                    placeholder="780.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                  />
                  {errors.prixUnitaire3Ans && (
                    <p className="text-sm text-red-500">
                      {errors.prixUnitaire3Ans.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Prix de vente total
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("prixVente3Ans", {
                      valueAsNumber: true,
                    })}
                    placeholder="780.00"
                    min="0"
                    className="focus:border-[#30C1BD] focus:ring-[#30C1BD] font-semibold"
                  />
                  {errors.prixVente3Ans && (
                    <p className="text-sm text-red-500">
                      {errors.prixVente3Ans.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
