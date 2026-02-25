import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </motion.div>

        {/* Metrics skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="bg-gradient-to-br from-gray-50 to-gray-100"
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tabs skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
