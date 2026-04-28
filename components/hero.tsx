import Link from "next/link"

interface HeroProps {
  heroImageUrl: string | null
}

export function Hero({ heroImageUrl }: HeroProps) {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
      {heroImageUrl && (
        <div className="absolute inset-0">
          <img
            src={heroImageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.62) saturate(0.75)" }}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent z-10" />

      <div className="relative z-20 container mx-auto px-6 sm:px-10">
        <div className="max-w-2xl space-y-8">
          <p className="text-xs font-semibold tracking-[0.4em] uppercase" style={{ color: "#ffffff" }}>
            Making Money Style
          </p>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white leading-[0.92] tracking-tight uppercase">
            🎟️ Participa
            <br />
            <span style={{ color: "#ffffff" }}> 💸 Gana</span>
            <br />
            🔥Representa
          </h1>

          <p className="text-neutral-400 text-lg leading-relaxed max-w-sm">Making Money Family❤️</p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="#sorteos"
              className="inline-flex items-center justify-center px-8 h-12 border text-white text-sm font-bold tracking-[0.2em] uppercase transition-all hover:bg-white hover:text-black"
              style={{ borderColor: "rgba(255,255,255,0.6)" }}
            >
              Descubrir
            </Link>

            <Link
              href="/sorteos"
              className="inline-flex items-center justify-center px-8 h-12 border text-sm font-bold tracking-[0.2em] uppercase transition-all hover:opacity-80"
              style={{ borderColor: "#ffffff", color: "#ffffff" }}
            >
              Ver sorteos →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
