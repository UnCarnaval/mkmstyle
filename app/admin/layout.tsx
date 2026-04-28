import type React from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, Trophy, Settings, CreditCard, Clock, LogOut } from "lucide-react"
import { getSiteSettings } from "@/app/actions/site-settings"
import { signOut } from "@/app/actions/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const settings = await getSiteSettings()
  const siteName = settings?.site_name || "MakingMoney"
  const displayName = profile?.full_name || user.email || ""

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/raffles", label: "Sorteos", icon: Trophy },
    { href: "/admin/pending-payments", label: "Pagos Pendientes", icon: Clock },
    { href: "/admin/sales", label: "Ventas", icon: CreditCard },
    { href: "/admin/settings", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-[#080808]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.07] flex-shrink-0 sticky top-0 h-screen">
        <div className="px-6 pt-10 pb-8 border-b border-white/[0.07]">
          <Link href="/" className="block group">
            <img
              src="/logo.png"
              alt={siteName}
              className="h-10 w-auto object-contain mb-3"
            />
            <p className="editorial-eyebrow text-neutral-500 group-hover:text-neutral-300 transition-colors">
              Panel admin
            </p>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors text-xs font-semibold tracking-widest uppercase"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] px-6 py-5 space-y-3">
          <div>
            <p className="editorial-eyebrow text-neutral-500 mb-1">Sesión</p>
            <p className="text-sm text-white truncate" title={displayName}>{displayName}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full editorial-button-secondary px-4 py-2 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top header (logo + logout) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-[#080808] border-b border-white/[0.07] z-40 flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt={siteName} className="h-7 w-auto object-contain" />
          <span className="editorial-eyebrow text-neutral-500">Admin</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 text-neutral-400 hover:text-white text-[0.65rem] font-semibold tracking-widest uppercase px-2 py-1 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </header>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#080808] border-t border-white/[0.07] z-50">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-2 py-2 text-neutral-500 hover:text-white transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[0.6rem] tracking-widest uppercase">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <main className="flex-1 pt-14 lg:pt-0 pb-20 lg:pb-0 overflow-x-hidden">{children}</main>
    </div>
  )
}
