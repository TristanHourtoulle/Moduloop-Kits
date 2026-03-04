'use client'

import { Control, FieldErrors, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tag, Palette, Ruler, Info, FileText } from 'lucide-react'
import { KitFormData } from '@/lib/schemas/kit'

interface KitGeneralInfoSectionProps {
  control: Control<KitFormData>
  errors: FieldErrors<KitFormData>
}

export function KitGeneralInfoSection({ control, errors }: KitGeneralInfoSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#30C1BD]/20 bg-white shadow-sm">
      {/* Header bar with gradient */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#30C1BD]/10 to-[#30C1BD]/5 px-6 py-4">
        <div className="rounded-lg bg-[#30C1BD]/15 p-2">
          <Info className="h-5 w-5 text-[#30C1BD]" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Informations générales</h3>
          <p className="text-sm text-gray-500">Nom, style et description du kit</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-6 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="nom" className="flex items-center gap-1.5 text-sm font-medium">
              Nom du kit <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="nom"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Tag className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    {...field}
                    id="nom"
                    placeholder="Ex: Kit Solaire Résidentiel"
                    className={`pl-10 transition-colors ${
                      errors.nom
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                    }`}
                  />
                </div>
              )}
            />
            {errors.nom && <p className="text-sm text-red-500">{errors.nom.message}</p>}
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style" className="flex items-center gap-1.5 text-sm font-medium">
              Style <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="style"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Palette className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    {...field}
                    id="style"
                    placeholder="Ex: Résidentiel, Commercial"
                    className={`pl-10 transition-colors ${
                      errors.style
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                    }`}
                  />
                </div>
              )}
            />
            {errors.style && <p className="text-sm text-red-500">{errors.style.message}</p>}
          </div>

          {/* Surface */}
          <div className="space-y-2">
            <Label htmlFor="surfaceM2" className="flex items-center gap-1.5 text-sm font-medium">
              Surface (m²) <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="surfaceM2"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Ruler className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                      field.onChange(value === '' ? undefined : parseFloat(value))
                    }}
                    className={`pl-10 transition-colors ${
                      errors.surfaceM2
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                    }`}
                  />
                </div>
              )}
            />
            {errors.surfaceM2 && <p className="text-sm text-red-500">{errors.surfaceM2.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium">
            <FileText className="h-3.5 w-3.5 text-gray-400" />
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
                className={`resize-none transition-colors ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500'
                    : 'focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                }`}
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
