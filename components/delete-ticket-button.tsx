"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteTicket } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"

interface DeleteTicketButtonProps {
  ticketId: string
  raffleId: string
  ticketNumber: number
  paymentStatus: string
}

export function DeleteTicketButton({
  ticketId,
  raffleId,
  ticketNumber,
  paymentStatus,
}: DeleteTicketButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = await swal.confirm(
      "¿Eliminar boleto?",
      "",
      `
        <div class="text-left space-y-3">
          <p class="text-slate-300">Boleto: <span class="text-cyan-400 font-bold">#${ticketNumber.toString().padStart(4, "0")}</span></p>
          <p class="text-slate-300">Estado: <span class="font-semibold">${paymentStatus === "completed" ? "Completado" : "Pendiente"}</span></p>
          ${paymentStatus === "completed" ? '<p class="text-amber-400 text-sm">⚠️ Este boleto cuenta como venta y se descontará del total</p>' : ""}
          <p class="text-red-400 font-semibold">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
    )

    if (!confirmed) return

    setIsDeleting(true)
    swal.loading("Eliminando boleto...")

    try {
      await deleteTicket(ticketId, raffleId)

      await swal.success("Boleto eliminado", "El boleto ha sido eliminado y el número queda disponible para compra", 3000)

      router.refresh()
    } catch (error: any) {
      swal.error("Error al eliminar", error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/60 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Eliminando...
        </>
      ) : (
        <>
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar
        </>
      )}
    </button>
  )
}
