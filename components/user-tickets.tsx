import Link from "next/link"

interface Ticket {
  id: string
  ticket_number: number
  payment_method: string
  payment_status: string
  purchased_at: string
  raffles: {
    id: string
    title: string
    image_url: string
    ticket_price: number
    draw_date: string
    status: string
  } | null
}

interface UserTicketsProps {
  tickets: Ticket[]
}

const METHOD_LABEL: Record<string, string> = {
  card: "Tarjeta",
  bank_transfer: "Transferencia",
  paypal: "PayPal",
  crypto: "Crypto",
}

function methodLabel(method: string) {
  return METHOD_LABEL[method] ?? method
}

function fmtDate(d: string | undefined) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-ES")
}

function resolveStatus(ticket: Ticket): { label: string; badgeClass: string } {
  const raffleStatus = ticket.raffles?.status
  const paymentStatus = ticket.payment_status

  if (raffleStatus === "cancelled") return { label: "Cancelado", badgeClass: "badge badge-neutral" }
  if (raffleStatus === "completed") return { label: "Finalizado", badgeClass: "badge badge-neutral" }
  if (paymentStatus === "pending") return { label: "Pendiente", badgeClass: "badge badge-warning" }
  if (paymentStatus === "failed") return { label: "Rechazado", badgeClass: "badge badge-danger" }
  return { label: "Activo", badgeClass: "badge badge-success" }
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-neutral-500 uppercase tracking-wider mb-0.5 text-[0.65rem]">{label}</dt>
      <dd className="text-white font-semibold">{value}</dd>
    </div>
  )
}

export function UserTickets({ tickets }: UserTicketsProps) {
  if (tickets.length === 0) {
    return (
      <div className="editorial-card p-12 text-center">
        <p className="editorial-eyebrow mb-3">Sin actividad</p>
        <h3 className="text-2xl font-black text-white mb-3">No tienes boletos todavía</h3>
        <p className="text-neutral-500 mb-6 text-sm">
          Participa en un sorteo para ver tus boletos aquí
        </p>
        <Link href="/sorteos" className="editorial-button-secondary">
          Ver sorteos
          <span>→</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-px bg-white/5 border border-white/[0.07]">
      {tickets.map((ticket) => {
        const status = resolveStatus(ticket)
        return (
          <article
            key={ticket.id}
            className="bg-[#0d0d0d] hover:bg-[#121212] transition-colors p-5 sm:p-6"
          >
            <div className="flex flex-col md:flex-row gap-5">
              <div className="w-full md:w-40 h-24 overflow-hidden flex-shrink-0">
                <img
                  src={ticket.raffles?.image_url || "/placeholder.svg"}
                  alt={ticket.raffles?.title || "Sorteo"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="editorial-eyebrow mb-2 text-neutral-400">
                  Boleto · #{ticket.ticket_number}
                </p>
                <h3 className="text-lg font-black text-white truncate mb-3">
                  {ticket.raffles?.title}
                </h3>

                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs">
                  <Cell label="Precio" value={`$${ticket.raffles?.ticket_price.toFixed(2) ?? "—"}`} />
                  <Cell label="Método" value={methodLabel(ticket.payment_method)} />
                  <Cell label="Comprado" value={fmtDate(ticket.purchased_at)} />
                  <Cell label="Sorteo" value={fmtDate(ticket.raffles?.draw_date)} />
                </dl>
              </div>

              <div className="flex md:flex-col items-start gap-3">
                <span className={status.badgeClass}>{status.label}</span>
                <Link
                  href={`/raffle/${ticket.raffles?.id}`}
                  className="text-xs font-semibold tracking-widest uppercase text-neutral-400 hover:text-white inline-flex items-center gap-2 group"
                >
                  Ver sorteo
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
