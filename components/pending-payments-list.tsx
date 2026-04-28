"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Clock, User, Mail, Phone, CreditCard, Eye, X, ImageOff } from "lucide-react"
import { approveGroupPayment, rejectGroupPayment } from "@/app/actions/payments"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"
import { formatPrice, formatCount } from "@/lib/utils"

interface GroupedPurchase {
  id: string
  tickets: Array<{
    id: string
    ticket_number: number
    ticket_hash: string
  }>
  raffle: {
    id: string
    title: string
    ticket_price: number
  }
  guest_name: string
  guest_email: string
  guest_phone: string
  bank_reference: string
  screenshot_url: string | null
  purchased_at: string
}

export function PendingPaymentsList({ purchases }: { purchases: GroupedPurchase[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Set<string>>(new Set())
  const [removedPurchases, setRemovedPurchases] = useState<Set<string>>(new Set())

  const filteredPurchases = purchases.filter((group) => !removedPurchases.has(group.id))

  const handleApprove = async (group: GroupedPurchase) => {
    const n = group.tickets.length
    const ok = await swal.confirm(
      `¿Aprobar ${n} boleto${n > 1 ? "s" : ""}?`,
      `Compra de ${group.guest_name} (${group.guest_email}) — Sorteo "${group.raffle.title}"`,
      "Sí, aprobar",
      "Cancelar",
    )
    if (!ok) return

    setProcessing(group.id)
    swal.loading("Aprobando pago...")

    try {
      const result = await approveGroupPayment(group.tickets.map((t) => t.id))
      if (result.error) {
        swal.error("Error al aprobar", result.error)
        return
      }
      swal.success(
        "Pago aprobado",
        `${result.updatedCount ?? n} boleto${(result.updatedCount ?? n) > 1 ? "s" : ""} confirmado${(result.updatedCount ?? n) > 1 ? "s" : ""}`,
      )
      setRemovedPurchases((prev) => new Set(prev).add(group.id))
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error approving payment:", error)
      swal.error("Error al aprobar", error.message || "Error al aprobar pago")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (group: GroupedPurchase) => {
    const n = group.tickets.length
    const ok = await swal.confirm(
      `¿Rechazar ${n} boleto${n > 1 ? "s" : ""}?`,
      `Esta acción eliminará los boletos de ${group.guest_name}. No se puede deshacer.`,
      "Sí, rechazar",
      "Cancelar",
    )
    if (!ok) return

    setProcessing(group.id)
    swal.loading("Rechazando pago...")

    try {
      const result = await rejectGroupPayment(group.tickets.map((t) => t.id))
      if (result.error) {
        swal.error("Error al rechazar", result.error)
        return
      }
      swal.success(
        "Pago rechazado",
        `${result.deletedCount ?? n} boleto${(result.deletedCount ?? n) > 1 ? "s" : ""} eliminado${(result.deletedCount ?? n) > 1 ? "s" : ""}`,
      )
      setRemovedPurchases((prev) => new Set(prev).add(group.id))
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error rejecting payment:", error)
      swal.error("Error al rechazar", error.message || "Error al rechazar pago")
    } finally {
      setProcessing(null)
    }
  }

  if (filteredPurchases.length === 0) {
    return (
      <div className="editorial-card p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center relative">
          <div className="absolute inset-0 blur-xl rounded-full bg-white/10" />
          <Clock className="w-6 h-6 relative z-10 text-white" />
        </div>
        <p className="editorial-eyebrow mb-3">Aprobaciones</p>
        <h3 className="text-2xl font-black text-white mb-3">No hay pagos pendientes</h3>
        <p className="text-neutral-500 text-sm">Las transferencias bancarias por aprobar aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredPurchases.map((group) => {
          const totalAmount = group.raffle.ticket_price * group.tickets.length
          return (
            <article key={group.id} className="editorial-card p-6 hover:bg-[#121212] transition-colors">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {group.screenshot_url && !imageError.has(group.screenshot_url) ? (
                    <button
                      onClick={() => setSelectedScreenshot(group.screenshot_url)}
                      className="w-full aspect-video bg-[#121212] overflow-hidden border border-white/[0.07] hover:border-white/30 transition-colors group relative"
                    >
                      <img
                        src={`/api/image-proxy?url=${encodeURIComponent(group.screenshot_url)}`}
                        alt="Comprobante"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImageError((prev) => new Set(prev).add(group.screenshot_url || ""))
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-full aspect-video bg-[#121212] border border-white/[0.07] flex flex-col items-center justify-center">
                      <ImageOff className="w-6 h-6 text-neutral-600 mb-2" />
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Sin comprobante</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1 space-y-4">
                  <div>
                    <p className="editorial-eyebrow mb-1 text-neutral-400">Sorteo</p>
                    <h3 className="text-lg font-black text-white">{group.raffle.title}</h3>
                  </div>

                  <div>
                    <p className="editorial-eyebrow mb-2 text-neutral-400">
                      Boletos · {formatCount(group.tickets.length)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {group.tickets.map((t) => (
                        <span
                          key={t.id}
                          className="border border-white/10 text-white px-2 py-0.5 font-mono text-xs"
                        >
                          #{t.ticket_number.toString().padStart(4, "0")}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-white truncate">{group.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-300 truncate">{group.guest_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-300">{group.guest_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span className="text-neutral-300">Ref: {group.bank_reference || "Sin referencia"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 uppercase tracking-wider">
                    {new Date(group.purchased_at).toLocaleDateString("es", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="md:col-span-1 flex flex-col justify-between gap-4">
                  <div className="text-right">
                    <p className="editorial-eyebrow mb-1 text-neutral-400">Total</p>
                    <p className="text-3xl font-black text-white break-all">${formatPrice(totalAmount)}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatCount(group.tickets.length)} × ${formatPrice(group.raffle.ticket_price)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(group)}
                      disabled={processing === group.id}
                      className="editorial-button-primary"
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                      {processing === group.id ? "Procesando..." : "Aprobar pago"}
                    </button>
                    <button
                      onClick={() => handleReject(group)}
                      disabled={processing === group.id}
                      className="editorial-button-danger"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-12 right-0 border border-white/20 hover:border-white p-2 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={`/api/image-proxy?url=${encodeURIComponent(selectedScreenshot)}`}
              alt="Comprobante de transferencia"
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
