"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Settings, CreditCard, Clock } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/raffles", label: "Sorteos", icon: Trophy },
  { href: "/admin/pending-payments", label: "Pagos Pendientes", icon: Clock },
  { href: "/admin/sales", label: "Ventas", icon: CreditCard },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

const GOLD = "#d4af37"

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-3 text-xs font-semibold tracking-widest uppercase transition-colors"
            style={
              active
                ? { color: GOLD, background: "rgba(212,175,55,0.08)", borderLeft: `2px solid ${GOLD}` }
                : { color: "#737373", borderLeft: "2px solid transparent" }
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-around py-2">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2 py-2 transition-colors"
            style={active ? { color: GOLD } : { color: "#737373" }}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[0.6rem] tracking-widest uppercase">
              {item.label.split(" ")[0]}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
