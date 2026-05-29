import { ProductGridSkeleton } from '@/components/product/product-card-skeleton'

export default function ProdukLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-10 flex flex-col gap-2">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-800" />
        <div className="h-9 w-48 animate-pulse rounded-xl bg-gray-800" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-800/70" />
      </div>
      {/* Category filter skeleton */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-xl bg-gray-800" />
        ))}
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}
