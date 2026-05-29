export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* Header skeleton */}
      <div className="mb-10 flex flex-col gap-2">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-800" />
        <div className="h-9 w-64 animate-pulse rounded-xl bg-gray-800" />
        <div className="h-4 w-80 animate-pulse rounded bg-gray-800/70" />
      </div>

      {/* Stats skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-800" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-800" />
            <div className="mt-1 h-3 w-28 animate-pulse rounded bg-gray-800/70" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-8">
            <div className="mb-6 h-6 w-40 animate-pulse rounded-xl bg-gray-800" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-gray-800/50"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-20 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
