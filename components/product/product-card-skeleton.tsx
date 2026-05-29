export function ProductCardSkeleton() {
  return (
    <div className="glass flex flex-col overflow-hidden rounded-2xl">
      {/* Image skeleton */}
      <div className="aspect-square animate-pulse bg-gray-800/70" />
      {/* Content skeleton */}
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-3 w-full animate-pulse rounded-lg bg-gray-800/70" />
        <div className="h-3 w-2/3 animate-pulse rounded-lg bg-gray-800/70" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-28 animate-pulse rounded-lg bg-gray-800" />
          <div className="h-6 w-14 animate-pulse rounded-lg bg-gray-800/70" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
