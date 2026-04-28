import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ConditionalNav, ConditionalFooter, ConditionalWhatsApp } from "@/components/conditional-nav"
import { AosProvider } from "@/components/aos-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MakingMoney Style - Sorteos Premium",
  description:
    "Participa en sorteos exclusivos de productos premium. Ropa, calzado, tecnologia y mas. Plataforma segura y confiable.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-[#080808]">
      <body className={`${inter.className} antialiased bg-[#080808] text-neutral-50`}>
        <AosProvider />
        <ConditionalNav />
        {children}
        <ConditionalFooter />
        <ConditionalWhatsApp />
        <Analytics />
      </body>
    </html>
  )
}
