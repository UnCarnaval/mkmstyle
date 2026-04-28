export default function Loading() {
  return (
    <div className="min-h-screen bg-[#080808] py-16 sm:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <div className="h-3 w-24 bg-white/[0.06] animate-pulse mb-3" />
          <div className="h-10 w-64 bg-white/[0.06] animate-pulse mb-3" />
          <div className="h-4 w-72 bg-white/[0.04] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 mb-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#080808] p-8 animate-pulse space-y-4">
              <div className="w-12 h-12 bg-white/[0.04]" />
              <div className="h-3 w-20 bg-white/[0.06]" />
              <div className="h-8 w-24 bg-white/[0.06]" />
              <div className="h-3 w-32 bg-white/[0.04]" />
            </div>
          ))}
        </div>
        <div className="space-y-px bg-white/5 border border-white/[0.07]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#0d0d0d] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
