"use client"

import { useState } from "react"
import { verifyTicketsByEmail } from "@/app/actions/verify-tickets"
import { Search, Trophy, CheckCircle, Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

const GOLD = "#ffffff"

export default function VerifyPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError]     = useState("")

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
    <div className="min-h-screen bg-[#080808] px-6 sm:px-10 py-10">
      <div className="container mx-auto max-w-2xl">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm mb-12 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-3" style={{ color: GOLD }}>
            Mis participaciones
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Verifica tus <span style={{ color: GOLD }}>boletos</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">
            Ingresa el correo electrónico que usaste para comprar
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleVerify} className="flex gap-0 mb-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError("") }}
            placeholder="tu@correo.com"
            className="flex-1 h-12 px-4 bg-transparent border border-r-0 text-white text-sm placeholder:text-neutral-600 outline-none transition-colors"
            style={{ borderColor: error ? "#f87171" : "rgba(255,255,255,0.12)" }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-8 text-sm font-bold tracking-widest uppercase flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ backgroundColor: GOLD, color: "#000" }}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Search className="w-4 h-4" /> Buscar</>
            }
          </button>
        </form>
        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        {/* Results */}
        {results && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <p className="text-neutral-500 text-xs tracking-widest uppercase">
                {results.data?.length ?? 0} sorteo{results.data?.length !== 1 ? "s" : ""} encontrado{results.data?.length !== 1 ? "s" : ""}
              </p>
              <p className="text-neutral-600 text-xs">{results.email}</p>
            </div>

            {results.data?.length === 0 ? (
              <div className="border border-white/5 p-12 text-center">
                <p className="text-neutral-500 text-sm">No se encontraron boletos para este correo</p>
              </div>
            ) : (
              <div className="space-y-px">
                {results.data?.map((item: any) => (
                  <div
                    key={item.raffle.id}
                    className="border-b last:border-b-0 py-6"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex gap-5">

                      {/* Image */}
                      <div className="w-20 h-20 shrink-0 overflow-hidden">
                        <img src={item.raffle.image_url || "/placeholder.svg"} alt={item.raffle.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-white font-bold text-base leading-tight">{item.raffle.title}</h3>
                          <Link
                            href={`/raffle/${item.raffle.id}`}
                            className="text-xs font-semibold shrink-0 hover:opacity-70 transition-opacity"
                            style={{ color: GOLD }}
                          >
                            Ver →
                          </Link>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {item.isWinner && (
                            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: GOLD }}>
                              <Trophy className="w-3.5 h-3.5" /> ¡Ganador!
                            </span>
                          )}
                          {item.approvedCount > 0 && (
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#22c55e" }}>
                              <CheckCircle className="w-3.5 h-3.5" /> {item.approvedCount} aprobado{item.approvedCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {item.pendingCount > 0 && (
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#f59e0b" }}>
                              <AlertCircle className="w-3.5 h-3.5" /> {item.pendingCount} pendiente{item.pendingCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {/* Ticket numbers */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.tickets.slice(0, 12).map((ticket: any) => {
                            const isWinnerTicket = item.raffle.winner_ticket_id === ticket.id
                            const isPending = ticket.payment_status === "pending"
                            const borderColor = isWinnerTicket ? GOLD : isPending ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"
                            const textColor = isWinnerTicket ? GOLD : isPending ? "#f59e0b" : "rgba(255,255,255,0.5)"
                            return (
                              <span
                                key={ticket.id}
                                className="px-2 py-0.5 text-xs font-mono border"
                                style={{ borderColor, color: textColor }}
                                title={isPending ? "Pendiente de aprobación" : "Aprobado"}
                              >
                                #{ticket.ticket_number}{isPending ? " ⏳" : ""}
                              </span>
                            )
                          })}
                          {item.tickets.length > 12 && (
                            <span className="px-2 py-0.5 text-xs text-neutral-600 border border-white/5">
                              +{item.tickets.length - 12}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
