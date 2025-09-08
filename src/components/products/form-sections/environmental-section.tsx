"use client";

import { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Leaf, Info, ShoppingCart, Home } from "lucide-react";
import { ProductFormData, PurchaseRentalMode } from "@/lib/schemas/product";

interface EnvironmentalSectionProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function EnvironmentalSection({
  register,
  errors,
}: EnvironmentalSectionProps) {
  const [activeMode, setActiveMode] = useState<PurchaseRentalMode>('achat');

  const renderEnvironmentalForm = (mode: PurchaseRentalMode) => {
    const suffix = mode === 'achat' ? 'Achat' : 'Location';
    const modeLabel = mode === 'achat' ? 'Achat' : 'Location';
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Réchauffement climatique (kg eq. CO₂) - {modeLabel} *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register(`rechauffementClimatique${suffix}` as keyof ProductFormData, {
                setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
              })}
              placeholder="150.5"
              min="0"
              className={`transition-colors ${
                errors[`rechauffementClimatique${suffix}` as keyof ProductFormData]
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
              }`}
            />
            {errors[`rechauffementClimatique${suffix}` as keyof ProductFormData] && (
              <p className="text-sm text-red-500">
                {errors[`rechauffementClimatique${suffix}` as keyof ProductFormData]?.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {mode === 'achat' 
                ? 'Impact total de la fabrication du produit neuf'
                : 'Impact réduit de la réutilisation d\'équipement existant'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Épuisement des ressources fossiles (MJ) - {modeLabel} *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register(`epuisementRessources${suffix}` as keyof ProductFormData, {
                setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
              })}
              placeholder="2500.0"
              min="0"
              className={`transition-colors ${
                errors[`epuisementRessources${suffix}` as keyof ProductFormData]
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
              }`}
            />
            {errors[`epuisementRessources${suffix}` as keyof ProductFormData] && (
              <p className="text-sm text-red-500">
                {errors[`epuisementRessources${suffix}` as keyof ProductFormData]?.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {mode === 'achat' 
                ? 'Énergie nécessaire pour fabriquer le produit'
                : 'Économies d\'énergie par réutilisation'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              Acidification des sols et des eaux (MOL H+) - {modeLabel} *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register(`acidification${suffix}` as keyof ProductFormData, { 
                setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
              })}
              placeholder="0.25"
              min="0"
              className={`transition-colors ${
                errors[`acidification${suffix}` as keyof ProductFormData]
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
              }`}
            />
            {errors[`acidification${suffix}` as keyof ProductFormData] && (
              <p className="text-sm text-red-500">
                {errors[`acidification${suffix}` as keyof ProductFormData]?.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {mode === 'achat' 
                ? 'Impact sur l\'acidité des sols lors de la production'
                : 'Impact réduit grâce à la réutilisation'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Eutrophisation marine (kg P eq.) - {modeLabel} *
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register(`eutrophisation${suffix}` as keyof ProductFormData, { 
                setValueAs: (v) => v === "" || v === null ? undefined : Number(v),
              })}
              placeholder="0.05"
              min="0"
              className={`transition-colors ${
                errors[`eutrophisation${suffix}` as keyof ProductFormData]
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-[#30C1BD] focus:ring-[#30C1BD]"
              }`}
            />
            {errors[`eutrophisation${suffix}` as keyof ProductFormData] && (
              <p className="text-sm text-red-500">
                {errors[`eutrophisation${suffix}` as keyof ProductFormData]?.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {mode === 'achat' 
                ? 'Impact sur les écosystèmes marins'
                : 'Bénéfice environnemental de la réutilisation'
              }
            </p>
          </div>
        </div>

        {/* Note explicative spécifique au mode */}
        <div className={`p-4 rounded-lg border ${
          mode === 'achat' 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Leaf className={`h-4 w-4 ${
              mode === 'achat' ? 'text-orange-600' : 'text-green-600'
            }`} />
            <h4 className={`text-sm font-semibold ${
              mode === 'achat' ? 'text-orange-800' : 'text-green-800'
            }`}>
              Impact environnemental - {modeLabel}
            </h4>
          </div>
          <p className={`text-xs ${
            mode === 'achat' ? 'text-orange-700' : 'text-green-700'
          }`}>
            {mode === 'achat' 
              ? 'Ces valeurs représentent l\'impact environnemental complet de la fabrication d\'un produit neuf, incluant l\'extraction des matières premières, la production, et le transport.'
              : 'Ces valeurs représentent l\'impact environnemental réduit de la réutilisation d\'équipements existants. La location permet généralement de diviser par 3 à 10 l\'impact environnemental comparé à l\'achat neuf.'
            }
          </p>
        </div>
      </div>
    );
  };

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
              Empreinte carbone pour achat et location
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
              <p className="font-semibold mb-1">Différence d'impact Achat / Location :</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Achat</strong> : Impact complet de la fabrication (extraction + production + transport)</li>
                <li>• <strong>Location</strong> : Impact réduit grâce à la réutilisation d'équipements existants</li>
                <li>• La location permet généralement de diviser l'impact environnemental par 3 à 10</li>
                <li>• Chaque mode nécessite ses propres données d'impact environnemental</li>
              </ul>
            </div>
          </div>
        </div>

        <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as PurchaseRentalMode)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="achat" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Achat (Neuf)
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Location (Existant)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achat">
            {renderEnvironmentalForm('achat')}
          </TabsContent>

          <TabsContent value="location">
            {renderEnvironmentalForm('location')}
          </TabsContent>
        </Tabs>

        {/* Information générale sur l'ACV */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-800">
              Analyse du cycle de vie (ACV)
            </h4>
          </div>
          <p className="text-xs text-gray-700">
            Ces données d'impact environnemental sont basées sur une analyse du cycle de vie (ACV) 
            et permettent d'évaluer l'empreinte écologique des produits selon différents scénarios d'usage. 
            Elles informent vos clients sur les bénéfices environnementaux de chaque option.
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}