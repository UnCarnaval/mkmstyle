export default function RaffleLoading() {
  return (
    <div className="min-h-screen bg-[#080808] px-6 sm:px-10 py-10">
      <div className="container mx-auto max-w-6xl">

        {/* Back link skeleton */}
        <div className="h-4 w-20 bg-neutral-900 animate-pulse mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-10">

          {/* Left — image skeleton */}
          <div className="aspect-[4/5] bg-neutral-900 animate-pulse" />

          {/* Right — info skeleton */}
          <div className="space-y-6 lg:pt-2">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 bg-neutral-900 animate-pulse w-4/5" />
              <div className="h-8 bg-neutral-900 animate-pulse w-2/3" />
            </div>

            {/* Status */}
            <div className="h-4 bg-neutral-900 animate-pulse w-1/3" />

            {/* Price */}
            <div className="h-10 bg-neutral-900 animate-pulse w-1/4" />

            {/* Progress */}
            <div className="space-y-2">
              <div className="h-3 bg-neutral-900 animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 bg-neutral-900 animate-pulse w-20" />
                <div className="h-3 bg-neutral-900 animate-pulse w-16" />
              </div>
            </div>

            {/* Quantity */}
            <div className="h-16 bg-neutral-900 animate-pulse" />

            {/* Guest form */}
            <div className="space-y-3">
              <div className="h-11 bg-neutral-900 animate-pulse" />
              <div className="h-11 bg-neutral-900 animate-pulse" />
              <div className="h-11 bg-neutral-900 animate-pulse" />
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 bg-neutral-900 animate-pulse" />
              <div className="h-14 bg-neutral-900 animate-pulse" />
              <div className="h-14 bg-neutral-900 animate-pulse" />
              <div className="h-14 bg-neutral-900 animate-pulse" />
            </div>

            {/* Buy button */}
            <div className="h-14 bg-neutral-900 animate-pulse" />

            {/* Description */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <div className="h-4 bg-neutral-900 animate-pulse w-full" />
              <div className="h-4 bg-neutral-900 animate-pulse w-5/6" />
              <div className="h-4 bg-neutral-900 animate-pulse w-4/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
