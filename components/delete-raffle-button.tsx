"use client"

import { useState } from "react"
import { cancelRaffle } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { Ban, Loader2 } from "lucide-react"
import { swal } from "@/lib/swal"

export function DeleteRaffleButton({ raffleId }: { raffleId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    const ok = await swal.confirm(
      "¿Cancelar este sorteo?",
      "El sorteo dejará de aparecer en el sitio público y no se podrán comprar más boletos. Los boletos ya vendidos se conservan.",
      "Sí, cancelar",
      "Volver",
    )
    if (!ok) return

    setLoading(true)
    try {
      const result = await cancelRaffle(raffleId)
      if (result?.error) {
        swal.error("No se pudo cancelar", result.error)
        return
      }
      swal.success("Sorteo cancelado")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Error cancelling raffle:", err)
      swal.error("No se pudo cancelar", err?.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="editorial-button-danger px-4 py-2 text-xs"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
      {loading ? "Cancelando..." : "Cancelar sorteo"}
    </button>
  )
}
