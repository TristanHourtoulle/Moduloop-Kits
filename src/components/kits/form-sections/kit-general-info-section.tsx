'use client'

import { Control, FieldErrors, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Info } from 'lucide-react'
import { KitFormData } from '@/lib/schemas/kit'

interface KitGeneralInfoSectionProps {
  control: Control<KitFormData>
  errors: FieldErrors<KitFormData>
}

export function KitGeneralInfoSection({
  control,
  errors,
}: KitGeneralInfoSectionProps) {
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
              Nom, style et description du kit
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm font-medium">
                Nom du kit *
              </Label>
              <Controller
                name="nom"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nom"
                    placeholder="Ex: Kit Solaire Résidentiel"
                    className={`transition-colors ${
                      errors.nom
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                    }`}
                  />
                )}
              />
              {errors.nom && (
                <p className="text-sm text-red-500">{errors.nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="style" className="text-sm font-medium">
                Style *
              </Label>
              <Controller
                name="style"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="style"
                    placeholder="Ex: Résidentiel, Commercial, Industriel"
                    className={`transition-colors ${
                      errors.style
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                    }`}
                  />
                )}
              />
              {errors.style && (
                <p className="text-sm text-red-500">{errors.style.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surfaceM2" className="text-sm font-medium">
                Surface (m²)
              </Label>
              <Controller
                name="surfaceM2"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="surfaceM2"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 25.5"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(
                        value === '' ? undefined : parseFloat(value),
                      )
                    }}
                    className={`transition-colors ${
                      errors.surfaceM2
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                    }`}
                  />
                )}
              />
              {errors.surfaceM2 && (
                <p className="text-sm text-red-500">
                  {errors.surfaceM2.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Description détaillée du kit et de ses avantages..."
                  rows={4}
                  className={`transition-colors resize-none ${
                    errors.description
                      ? 'border-red-500 focus:border-red-500'
                      : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                  }`}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
