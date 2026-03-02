import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export function AuthFormSkeleton() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-8 text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Button Skeleton */}
          <Skeleton className="h-12 w-full" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Ou</span>
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-12 w-full" />

          {/* Bottom Link Skeleton */}
          <div className="pt-4 text-center">
            <Skeleton className="mx-auto h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
