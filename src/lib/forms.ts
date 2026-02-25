import { useForm, FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useZodForm<T extends z.ZodType<any>>(
  schema: T,
  options?: Parameters<typeof useForm<z.infer<T>>>[0],
) {
  const form = useForm<z.infer<T>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    // Mode de validation par défaut
    mode: 'onChange',
    reValidateMode: 'onChange',
    ...options,
  })

  // Helper pour obtenir les erreurs formatées
  const getFieldError = (fieldName: string): string | undefined => {
    const error = form.formState.errors[fieldName as keyof typeof form.formState.errors] as
      | FieldError
      | undefined
    return error?.message
  }

  return {
    ...form,
    getFieldError,
  }
}
