"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppBubble } from "@/components/whatsapp-bubble"

export function ConditionalNav() {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null
  }

  return <Navbar />
}

export function ConditionalFooter() {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null
  }

  return <Footer />
}

export function ConditionalWhatsApp() {
  const pathname = usePathname()

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null
  }

  return <WhatsAppBubble />
}
