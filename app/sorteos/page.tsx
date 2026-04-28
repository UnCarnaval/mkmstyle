import { createClient } from "@/lib/supabase/server"
import { SorteosClient } from "@/components/sorteos-client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Todos los sorteos — Making Money Style",
}

export const revalidate = 0

export default async function SorteosPage() {
  const supabase = await createClient()

  const { data: raffles } = await supabase
    .from("raffles")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Page header */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-6 sm:px-10 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Link>

          <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-2" style={{ color: "#ffffff" }}>
            Catálogo completo
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Todos los <span style={{ color: "#ffffff" }}>sorteos</span>
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-10 py-14">
        <SorteosClient raffles={raffles ?? []} />
      </div>

    </div>
  )
}
