"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Trophy, Loader2, X } from "lucide-react"
import { selectWinner, selectWinnerManual } from "@/app/actions/lottery"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"

interface DrawWinnerButtonProps {
  raffleId: string
  raffleStatus: string
  ticketsSold: number
  totalTickets: number
}

export function DrawWinnerButton({ raffleId, raffleStatus, ticketsSold, totalTickets }: DrawWinnerButtonProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [manualTicketNumber, setManualTicketNumber] = useState("")
  const router = useRouter()

  const canDraw = raffleStatus === "active" && ticketsSold > 0

  const closeModal = () => {
    setShowModal(false)
    setManualTicketNumber("")
  }

  const handleRandomDraw = async () => {
    setShowModal(false)

    const confirmed = await swal.confirm(
      "¿Sorteo Aleatorio?",
      "",
      `
        <div class="text-left space-y-3">
          <p class="text-neutral-300">Se seleccionará un boleto de forma aleatoria.</p>
          <p class="text-neutral-300">Boletos vendidos: <span class="text-white font-bold">${ticketsSold}/${totalTickets}</span></p>
          <p class="text-[#ef4444] font-semibold">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
    )

    if (!confirmed) return

    setIsDrawing(true)
    swal.loading("Realizando sorteo aleatorio...")

    try {
      const result = await selectWinner(raffleId)
      await swal.success(
        "🎉 ¡Sorteo completado!",
        `Boleto ganador: #${result.winner.ticket_number.toString().padStart(4, "0")}\n\nSe ha notificado al ganador por email`,
        5000,
      )
      router.refresh()
    } catch (error: any) {
      swal.error("Error en el sorteo", error.message)
    } finally {
      setIsDrawing(false)
    }
  }

  const handleManualDraw = async () => {
    if (!manualTicketNumber.trim()) {
      swal.error("Error", "Por favor ingresa un número de boleto")
      return
    }

    const ticketNum = parseInt(manualTicketNumber)
    if (isNaN(ticketNum) || ticketNum < 1 || ticketNum > totalTickets) {
      swal.error("Error", `El número debe estar entre 1 y ${totalTickets}`)
      return
    }

    setShowModal(false)

    const confirmed = await swal.confirm(
      "¿Sorteo Manual?",
      "",
      `
        <div class="text-left space-y-3">
          <p class="text-neutral-300">Número de boleto seleccionado: <span class="text-white font-bold">#${ticketNum.toString().padStart(4, "0")}</span></p>
          <p class="text-neutral-300">Verifica que este sea el número correcto según la lotería.</p>
          <p class="text-[#ef4444] font-semibold">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
    )

    if (!confirmed) return

    setIsDrawing(true)
    swal.loading("Finalizando sorteo...")

    try {
      const result = await selectWinnerManual(raffleId, ticketNum)
      await swal.success(
        "🎉 ¡Sorteo completado!",
        `Boleto ganador: #${result.winner.ticket_number.toString().padStart(4, "0")}\n\nSe ha notificado al ganador por email`,
        5000,
      )
      setManualTicketNumber("")
      router.refresh()
    } catch (error: any) {
      swal.error("Error en el sorteo", error.message)
    } finally {
      setIsDrawing(false)
    }
  }

  const modalContent = showModal ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
      <div className="relative editorial-card p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="editorial-eyebrow mb-2">Finalizar</p>
        <h2 className="text-xl font-black text-white mb-2">Seleccionar método</h2>
        <p className="text-neutral-500 text-sm mb-6">Elige cómo deseas finalizar el sorteo.</p>

        <div className="space-y-4">
          <div className="border border-white/[0.07] p-4">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Opción 1</p>
            <p className="text-white font-semibold mb-1">Sorteo aleatorio</p>
            <p className="text-neutral-500 text-xs mb-4">Se seleccionará un boleto al azar.</p>
            <button
              onClick={handleRandomDraw}
              disabled={isDrawing}
              className="editorial-button-primary w-full px-4 py-2 text-xs"
            >
              Realizar aleatorio
            </button>
          </div>

          <div className="border border-white/[0.07] p-4">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Opción 2</p>
            <p className="text-white font-semibold mb-1">Sorteo manual</p>
            <p className="text-neutral-500 text-xs mb-3">Ingresa el número del boleto ganador.</p>
            <input
              type="number"
              value={manualTicketNumber}
              onChange={(e) => setManualTicketNumber(e.target.value)}
              placeholder={`Entre 1 y ${totalTickets}`}
              min="1"
              max={totalTickets}
              className="editorial-input mb-3"
            />
            <button
              onClick={handleManualDraw}
              disabled={isDrawing || !manualTicketNumber.trim()}
              className="editorial-button-secondary w-full px-4 py-2 text-xs"
            >
              Confirmar manual
            </button>
          </div>

          <button
            onClick={closeModal}
            className="w-full text-neutral-400 hover:text-white text-xs font-semibold tracking-widest uppercase py-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canDraw || isDrawing}
        className="editorial-button-primary px-4 py-2 text-xs"
      >
        {isDrawing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Trophy className="w-4 h-4" />
            Realizar sorteo
          </>
        )}
      </button>

      {typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  )
}
