"use client"

import { useState } from "react"
import { verifyTicketsByEmail } from "@/app/actions/verify-tickets"
import { Search, Trophy, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export function VerifySection() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) { setError("Ingresa un correo válido"); return }
    setError("")
    setLoading(true)
    try {
      const result = await verifyTicketsByEmail(email.toLowerCase().trim())
      if (!result.success) { setError(result.error || "Error al verificar"); setResults(null) }
      else setResults(result)
    } catch { setError("Error inesperado") }
    finally { setLoading(false) }
  }

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 border-t border-white/5">
      <div className="container mx-auto max-w-2xl">

        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-3" style={{ color: "#ffffff" }}>
            Tus participaciones
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Verifica tus <span style={{ color: "#ffffff" }}>boletos</span>
          </h2>
          <p className="text-neutral-500 text-sm mt-3">Ingresa el correo con el que compraste</p>
        </div>

        <form onSubmit={handleVerify} className="flex gap-0 mb-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError("") }}
            placeholder="tu@correo.com"
            className="flex-1 h-12 px-4 bg-transparent border border-r-0 text-white text-sm placeholder:text-neutral-600 outline-none focus:border-[#ffffff]/50 transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-6 text-sm font-bold tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: "#ffffff", color: "#000" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "" : "Buscar"}
          </button>
        </form>
        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        {/* Results */}
        {results && (
          <div className="mt-8 space-y-4">
            <p className="text-neutral-500 text-xs tracking-widest uppercase">
              {results.data?.length ?? 0} sorteo{results.data?.length !== 1 ? "s" : ""} encontrado{results.data?.length !== 1 ? "s" : ""}
            </p>

            {results.data?.length === 0 ? (
              <div className="border border-white/5 p-8 text-center">
                <p className="text-neutral-500 text-sm">No hay boletos para este correo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.data?.map((item: any) => (
                  <div
                    key={item.raffle.id}
                    className="flex items-center gap-4 border p-4 transition-colors"
                    style={{ borderColor: item.isWinner ? "#ffffff33" : "rgba(255,255,255,0.06)", backgroundColor: item.isWinner ? "#ffffff08" : "transparent" }}
                  >
                    <div className="w-14 h-14 shrink-0 overflow-hidden">
                      <img src={item.raffle.image_url || "/placeholder.svg"} alt={item.raffle.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm line-clamp-1">{item.raffle.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.isWinner && (
                          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#22c55e" }}>
                            <Trophy className="w-3 h-3" /> Ganador
                          </span>
                        )}
                        {item.approvedCount > 0 && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#22c55e" }}>
                            <CheckCircle className="w-3 h-3" /> {item.approvedCount} aprobado{item.approvedCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {item.pendingCount > 0 && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#f59e0b" }}>
                            <AlertCircle className="w-3 h-3" /> {item.pendingCount} pendiente{item.pendingCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/raffle/${item.raffle.id}`}
                      className="text-xs font-semibold shrink-0 transition-opacity hover:opacity-70"
                      style={{ color: "#ffffff" }}
                    >
                      Ver →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
