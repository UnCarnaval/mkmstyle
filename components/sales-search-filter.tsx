"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { DeleteTicketButton } from "./delete-ticket-button"
import { formatPrice, formatCount } from "@/lib/utils"

interface Ticket {
  id: string
  ticket_number: number
  ticket_hash?: string
  payment_method: string
  payment_status: string
  purchased_at: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  raffle_id: string
  user_id?: string
  raffle?: {
    id: string
    title: string
    image_url?: string
    ticket_price: number
  }
  profile?: {
    full_name?: string
    email?: string
  }
}

interface SalesSearchFilterProps {
  tickets: Ticket[]
  totalCount: number
}

export function SalesSearchFilter({ tickets, totalCount }: SalesSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) {
      return tickets
    }

    const query = searchQuery.toLowerCase()

    return tickets.filter((ticket) => {
      // Search by ticket number
      if (ticket.ticket_number.toString().includes(query)) return true

      // Search by ticket hash
      if (ticket.ticket_hash?.toLowerCase().includes(query)) return true

      // Search by guest name or profile name
      const name = (ticket.guest_name || ticket.profile?.full_name || "").toLowerCase()
      if (name.includes(query)) return true

      // Search by guest email or profile email
      const email = (ticket.guest_email || ticket.profile?.email || "").toLowerCase()
      if (email.includes(query)) return true

      // Search by phone
      if (ticket.guest_phone?.toLowerCase().includes(query)) return true

      // Search by raffle name
      if (ticket.raffle?.title.toLowerCase().includes(query)) return true

      // Search by payment method
      const paymentMethod =
        ticket.payment_method === "stripe"
          ? "tarjeta"
          : ticket.payment_method === "paypal"
            ? "paypal"
            : ticket.payment_method === "bank_transfer"
              ? "transferencia"
              : "crypto"

      if (paymentMethod.includes(query)) return true

      // Search by payment status
      const status =
        ticket.payment_status === "completed"
          ? "completado"
          : ticket.payment_status === "pending"
            ? "pendiente"
            : "fallido"

      if (status.includes(query)) return true

      return false
    })
  }, [tickets, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const from = (currentPage - 1) * itemsPerPage
  const to = from + itemsPerPage
  const paginatedTickets = filteredTickets.slice(from, to)

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-neutral-500" />
        </div>
        <input
          type="text"
          placeholder="Buscar por boleto, cliente, email, sorteo, método o estado…"
          value={searchQuery}
          onChange={handleSearchChange}
          className="editorial-input pl-12 pr-12"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchQuery && (
        <p className="text-sm text-neutral-500">
          Se encontraron {formatCount(filteredTickets.length)} de {formatCount(totalCount)} ventas
        </p>
      )}

      <div className="editorial-card">
        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[920px]">
            <thead className="bg-[#121212] border-b border-white/[0.07]">
              <tr>
                {["Boleto", "Sorteo", "Cliente", "Método", "Precio", "Estado", "Fecha", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-neutral-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {paginatedTickets.map((ticket) => {
                const statusBadgeClass =
                  ticket.payment_status === "completed"
                    ? "badge badge-success"
                    : ticket.payment_status === "pending"
                      ? "badge badge-warning"
                      : "badge badge-danger"
                const statusLabel =
                  ticket.payment_status === "completed"
                    ? "Completado"
                    : ticket.payment_status === "pending"
                      ? "Pendiente"
                      : "Fallido"
                const methodLabel =
                  ticket.payment_method === "stripe"
                    ? "Tarjeta"
                    : ticket.payment_method === "paypal"
                      ? "PayPal"
                      : ticket.payment_method === "bank_transfer"
                        ? "Transferencia"
                        : "Crypto"

                return (
                  <tr key={ticket.id} className="hover:bg-[#121212] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm text-white font-semibold">#{ticket.ticket_number}</p>
                      {ticket.ticket_hash && (
                        <p className="text-xs text-neutral-500 font-mono">{ticket.ticket_hash}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ticket.raffle?.image_url || "/placeholder.svg"}
                          alt={ticket.raffle?.title}
                          className="w-10 h-10 object-cover flex-shrink-0"
                        />
                        <span className="text-sm text-white truncate max-w-xs">{ticket.raffle?.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm">
                        <p className="text-white">{ticket.guest_name || ticket.profile?.full_name || "Usuario"}</p>
                        <p className="text-neutral-500 text-xs truncate max-w-xs">
                          {ticket.guest_email || ticket.profile?.email}
                        </p>
                        {ticket.guest_phone && (
                          <p className="text-neutral-600 text-xs">{ticket.guest_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge badge-neutral">{methodLabel}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-white whitespace-nowrap">
                        ${formatPrice(ticket.raffle?.ticket_price)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={statusBadgeClass}>{statusLabel}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-500">
                        {formatDistanceToNow(new Date(ticket.purchased_at), { addSuffix: true, locale: es })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <DeleteTicketButton
                        ticketId={ticket.id}
                        raffleId={ticket.raffle_id}
                        ticketNumber={ticket.ticket_number}
                        paymentStatus={ticket.payment_status}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-neutral-500">
              {searchQuery ? "No se encontraron ventas con ese criterio" : "No hay ventas registradas"}
            </p>
          </div>
        )}

        {totalPages > 1 && filteredTickets.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07]">
            <p className="text-sm text-neutral-500">
              Mostrando {formatCount(from + 1)}-{formatCount(Math.min(to, filteredTickets.length))} de {formatCount(filteredTickets.length)}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="editorial-button-secondary px-4 py-2 text-xs"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  const isActive = currentPage === pageNum
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        isActive
                          ? "border-b-2 border-white text-white pb-1 px-2 text-xs font-semibold tracking-widest"
                          : "border-b-2 border-transparent text-neutral-500 hover:text-white pb-1 px-2 text-xs font-semibold tracking-widest transition-colors"
                      }
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="editorial-button-secondary px-4 py-2 text-xs"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
