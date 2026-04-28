"use client"

import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-sm border-b border-white/5">
      <div className="container mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 relative">
            <Image
              src="/logoneon.png"
              alt="MakingMoney Style"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-base font-black text-white tracking-tight leading-none">MakingMoney</span>
            <span className="text-sm font-black leading-none mt-0.5" style={{ color: "#ffffff" }}>$TYLE</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/verify"
            className="text-xs font-semibold tracking-widest uppercase text-neutral-500 hover:text-white transition-colors"
          >
            Verificar Boletos
          </Link>
        </div>
      </div>
    </nav>
  )
}
