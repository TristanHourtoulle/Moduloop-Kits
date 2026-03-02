export default function KitsLoading() {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-64 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-6 w-16 rounded bg-gray-200"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200"></div>
                  <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="h-8 w-20 rounded bg-gray-200"></div>
                  <div className="h-8 w-20 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
