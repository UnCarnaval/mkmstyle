export default function Loading() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="h-10 w-64 bg-slate-800 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-96 max-w-full bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-slate-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-slate-800 rounded" />
                <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
                <div className="h-2 w-full bg-slate-800/60 rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 flex-1 bg-slate-800 rounded" />
                  <div className="h-8 w-20 bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
