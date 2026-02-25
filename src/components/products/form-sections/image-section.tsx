'use client'

import { useState } from 'react'
import { UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ImageIcon, Upload, X } from 'lucide-react'
import { ProductFormData } from '@/lib/schemas/product'

interface ImageSectionProps {
  setValue: UseFormSetValue<ProductFormData>
  errors: FieldErrors<ProductFormData>
  initialImage?: string | null
  onError: (error: string) => void
}

export function ImageSection({
  setValue,
  errors,
  initialImage,
  onError,
}: ImageSectionProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage || null,
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError('Veuillez sélectionner un fichier image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      onError("L'image ne peut pas dépasser 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setImagePreview(base64)
      setValue('image', base64)
      onError('')
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setValue('image', undefined)
  }

  return (
    <AccordionItem value="image" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <ImageIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Image du produit</h3>
            <p className="text-sm text-gray-500">
              Photo ou illustration du produit
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="w-48 h-48 object-cover rounded-lg border shadow-sm"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-lg"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#30C1BD] transition-colors">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer w-full flex flex-col items-center justify-center"
                >
                  <span className="text-[#30C1BD] hover:text-[#30C1BD]/80 font-medium">
                    Cliquez pour télécharger
                  </span>
                  <span className="text-gray-500"> ou glissez-déposez</span>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF jusqu&apos;à 5MB
                </p>
              </div>
            </div>
          )}
          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message}</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
