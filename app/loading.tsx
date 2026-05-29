import { ProductGridSkeleton } from '@/components/product/product-card-skeleton'

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      {/* Hero skeleton */}
      <div className="mb-20 flex flex-col items-center gap-6 text-center">
        <div className="h-6 w-64 animate-pulse rounded-full bg-gray-800" />
        <div className="h-16 w-full max-w-2xl animate-pulse rounded-2xl bg-gray-800" />
        <div className="h-6 w-96 animate-pulse rounded-xl bg-gray-800/70" />
        <div className="flex gap-4">
          <div className="h-12 w-44 animate-pulse rounded-xl bg-gray-800" />
          <div className="h-12 w-36 animate-pulse rounded-xl bg-gray-800/70" />
        </div>
      </div>

      {/* Products skeleton */}
      <div className="mb-8 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-800" />
          <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-800" />
        </div>
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}
