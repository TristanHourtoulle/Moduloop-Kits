"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info } from "lucide-react";
import { ProductFormData } from "@/lib/schemas/product";

interface GeneralInfoSectionProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function GeneralInfoSection({
  register,
  errors,
}: GeneralInfoSectionProps) {
  return (
    <AccordionItem value="general" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#30C1BD]/10">
            <Info className="h-5 w-5 text-[#30C1BD]" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Informations générales</h3>
            <p className="text-sm text-gray-500">
              Nom, référence et description du produit
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm font-medium">
                Nom du produit *
              </Label>
              <Input
                id="nom"
                {...register("nom")}
                placeholder="Ex: Panneau solaire 400W"
                className={`transition-colors ${
                  errors.nom
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                }`}
              />
              {errors.nom && (
                <p className="text-sm text-red-500">{errors.nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm font-medium">
                Référence *
              </Label>
              <Input
                id="reference"
                {...register("reference")}
                placeholder="Ex: PS-400W-001"
                className={`uppercase transition-colors ${
                  errors.reference
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                }`}
              />
              {errors.reference && (
                <p className="text-sm text-red-500">
                  {errors.reference.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Description détaillée du produit..."
              rows={4}
              className={`transition-colors resize-none ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantite" className="text-sm font-medium">
                Quantité *
              </Label>
              <Input
                id="quantite"
                type="number"
                {...register("quantite", { valueAsNumber: true })}
                placeholder="Ex: 100"
                min="0"
                className={`transition-colors ${
                  errors.quantite
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                }`}
              />
              {errors.quantite && (
                <p className="text-sm text-red-500">
                  {errors.quantite.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surfaceM2" className="text-sm font-medium">
                Surface occupée (m²) *
              </Label>
              <Input
                id="surfaceM2"
                type="number"
                step="0.01"
                {...register("surfaceM2", { valueAsNumber: true })}
                placeholder="Ex: 2.5"
                min="0"
                className={`transition-colors ${
                  errors.surfaceM2
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
                }`}
              />
              {errors.surfaceM2 && (
                <p className="text-sm text-red-500">
                  {errors.surfaceM2.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
