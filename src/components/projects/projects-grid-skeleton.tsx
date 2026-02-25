import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function ProjectsGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className="h-full bg-white border border-gray-200/60 shadow-sm"
          >
            {/* Header Section */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-7 w-20 rounded-full ml-3" />
              </div>

              {/* Meta info skeleton */}
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Metrics Section */}
            <CardContent className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Impact skeleton */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>

                {/* Prix skeleton */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              {/* Actions skeleton */}
              <div className="flex items-center space-x-3 pt-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
