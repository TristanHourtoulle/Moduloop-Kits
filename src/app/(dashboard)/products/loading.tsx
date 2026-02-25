export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Search and filters skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
