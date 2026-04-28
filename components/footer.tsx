import Link from "next/link"
import Image from "next/image"

const GOLD = "#ffffff"

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 mt-20">
      <div className="container mx-auto px-5 sm:px-8 py-14">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <div className="w-12 h-12 relative shrink-0">
                <Image src="/logo.png" alt="MakingMoney Style" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-tight leading-none">MakingMoney</span>
                <span className="text-sm font-black leading-none mt-0.5" style={{ color: GOLD }}>$TYLE</span>
              </div>
            </Link>
            <p className="text-neutral-600 text-xs leading-relaxed max-w-xs">
              Plataforma de sorteos premium. Transparente, seguro y justo para todos los participantes.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-500 mb-4">
              Enlaces
            </p>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Inicio" },
                { href: "/sorteos", label: "Sorteos" },
                { href: "/verify", label: "Verificar Boletos" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-neutral-600 hover:text-white transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-500 mb-4">
              Legal
            </p>
            <ul className="space-y-3">
              {[
                { href: "/terms", label: "Términos y Condiciones" },
                { href: "/privacy", label: "Política de Privacidad" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-neutral-600 hover:text-white transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:support@makingmoneystyle.com"
                  className="text-neutral-600 hover:text-white transition-colors text-sm"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-neutral-700 text-xs">
            &copy; {new Date().getFullYear()} MakingMoney Style. Todos los derechos reservados.
          </p>
          <p className="text-xs font-black tracking-widest uppercase" style={{ color: GOLD }}>
            Making Money Style
          </p>
        </div>

      </div>
    </footer>
  )
}
