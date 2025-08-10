"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Leaf } from "lucide-react";
import { ProductFormData } from "@/lib/schemas/product";

interface EnvironmentalSectionProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function EnvironmentalSection({
  register,
  errors,
}: EnvironmentalSectionProps) {
  return (
    <AccordionItem value="environmental" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Impact environnemental</h3>
            <p className="text-sm text-gray-500">
              Empreinte carbone et impacts écologiques
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Réchauffement climatique (kg eq. CO₂) *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register("rechauffementClimatique", {
                valueAsNumber: true,
              })}
              placeholder="150.5"
              min="0"
              className={`transition-colors ${
                errors.rechauffementClimatique
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
              }`}
            />
            {errors.rechauffementClimatique && (
              <p className="text-sm text-red-500">
                {errors.rechauffementClimatique.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Épuisement des ressources fossiles (MJ) *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register("epuisementRessources", {
                valueAsNumber: true,
              })}
              placeholder="2500.0"
              min="0"
              className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
            />
            {errors.epuisementRessources && (
              <p className="text-sm text-red-500">
                {errors.epuisementRessources.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              Acidification des sols et des eaux (MOL H+) *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register("acidification", { valueAsNumber: true })}
              placeholder="0.25"
              min="0"
              className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
            />
            {errors.acidification && (
              <p className="text-sm text-red-500">
                {errors.acidification.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Eutrophisation marine (kg P eq.) *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register("eutrophisation", { valueAsNumber: true })}
              placeholder="0.05"
              min="0"
              className="focus:border-[#30C1BD] focus:ring-[#30C1BD]"
            />
            {errors.eutrophisation && (
              <p className="text-sm text-red-500">
                {errors.eutrophisation.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-semibold text-green-800">
              À propos de l&apos;impact environnemental
            </h4>
          </div>
          <p className="text-xs text-green-700">
            Ces données permettent d&apos;évaluer l&apos;empreinte écologique du
            produit sur son cycle de vie complet et d&apos;informer vos clients
            sur les impacts environnementaux.
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
