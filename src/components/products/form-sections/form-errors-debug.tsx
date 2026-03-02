'use client'

import { FieldErrors } from 'react-hook-form'
import { ProductFormData } from '@/lib/schemas/product'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface FormErrorsDebugProps {
  errors: FieldErrors<ProductFormData>
}

export function FormErrorsDebug({ errors }: FormErrorsDebugProps) {
  const errorEntries = Object.entries(errors)

  if (errorEntries.length === 0) {
    return null
  }

  return (
    <Alert className="mb-4 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-2">
          <p className="font-semibold">Erreurs de validation détectées :</p>
          <ul className="list-disc space-y-1 pl-5">
            {errorEntries.map(([field, error]) => (
              <li key={field} className="text-sm">
                <strong>{field}</strong>: {error?.message || 'Erreur inconnue'}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs opacity-80">
            Nombre total d&apos;erreurs : {errorEntries.length}
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
