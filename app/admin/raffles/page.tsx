import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Edit } from "lucide-react"
import { DeleteRaffleButton } from "@/components/delete-raffle-button"
import { formatPrice, formatCount } from "@/lib/utils"

export const revalidate = 0

type RaffleStatus = "all" | "active" | "completed" | "cancelled"

const STATUS_TABS: { value: RaffleStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "completed", label: "Finalizados" },
  { value: "cancelled", label: "Cancelados" },
]

export default async function AdminRafflesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusParam = (params.status as RaffleStatus) || "all"
  const statusFilter: RaffleStatus = STATUS_TABS.some((t) => t.value === statusParam)
    ? statusParam
    : "all"

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  const { data: statusRows, error: statusErr } = await supabase.from("raffles").select("status")
  if (statusErr) {
    console.error("[v0] Error loading raffle status counts:", statusErr)
  }
  const counts = {
    all: statusRows?.length ?? 0,
    active: statusRows?.filter((r: any) => r.status === "active").length ?? 0,
    completed: statusRows?.filter((r: any) => r.status === "completed").length ?? 0,
    cancelled: statusRows?.filter((r: any) => r.status === "cancelled").length ?? 0,
  }

  const baseQuery = supabase.from("raffles").select("*")
  const filteredQuery = statusFilter !== "all" ? baseQuery.eq("status", statusFilter) : baseQuery
  const { data: rafflesRaw, error: rafflesErr } = await filteredQuery.order("created_at", {
    ascending: false,
  })

  if (rafflesErr) {
    console.error("[v0] Error loading admin raffles:", rafflesErr)
  }

  const winnerTicketIds = (rafflesRaw ?? [])
    .map((r: any) => r.winner_ticket_id)
    .filter((id: string | null): id is string => Boolean(id))

  let winnersById: Record<string, any> = {}
  if (winnerTicketIds.length > 0) {
    const { data: winners, error: winnersErr } = await supabase
      .from("tickets")
      .select(`
        id,
        ticket_number,
        ticket_hash,
        guest_name,
        guest_email,
        user:user_id(full_name, email)
      `)
      .in("id", winnerTicketIds)

    if (winnersErr) {
      console.error("[v0] Error loading winner tickets:", winnersErr)
    }

    winnersById = (winners ?? []).reduce((acc: Record<string, any>, w: any) => {
      acc[w.id] = w
      return acc
    }, {})
  }

  const raffles = (rafflesRaw ?? []).map((r: any) => ({
    ...r,
    winner_ticket: r.winner_ticket_id ? winnersById[r.winner_ticket_id] ?? null : null,
  }))

  console.log("[v0] /admin/raffles fetched", {
    statusFilter,
    counts,
    rendered: raffles.length,
  })

  function statusBadge(status: string) {
    if (status === "active") return { class: "badge badge-success", label: "Activo" }
    if (status === "completed") return { class: "badge badge-neutral", label: "Finalizado" }
    return { class: "badge badge-danger", label: "Cancelado" }
  }

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-10" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Catálogo</p>
          <h1 className="editorial-heading">
            Gestión <span className="text-white">Sorteos</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">
            {formatCount(counts.all)} sorteos · {formatCount(counts.active)} activos · {formatCount(counts.completed)} finalizados · {formatCount(counts.cancelled)} cancelados
          </p>
        </header>

        <div className="flex gap-6 mb-8 border-b border-white/[0.07] overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value
            const tabCount = counts[tab.value]
            return (
              <Link
                key={tab.value}
                href={`/admin/raffles?status=${tab.value}`}
                className={
                  isActive
                    ? "border-b-2 border-white text-white pb-3 px-1 text-xs tracking-widest uppercase font-semibold whitespace-nowrap"
                    : "border-b-2 border-transparent text-neutral-500 hover:text-white pb-3 px-1 text-xs tracking-widest uppercase font-semibold transition-colors whitespace-nowrap"
                }
              >
                {tab.label} <span className="text-neutral-600">({formatCount(tabCount)})</span>
              </Link>
            )
          })}
        </div>

        <div className="space-y-4">
          {(!raffles || raffles.length === 0) ? (
            <div className="editorial-card p-12 text-center">
              <p className="text-neutral-500 text-sm">
                {statusFilter === "all"
                  ? "No hay sorteos creados aún."
                  : `No hay sorteos con estado "${STATUS_TABS.find((t) => t.value === statusFilter)?.label.toLowerCase()}".`}
              </p>
            </div>
          ) : (
            raffles.map((raffle) => {
              const badge = statusBadge(raffle.status)
              return (
                <article key={raffle.id} className="editorial-card p-5 sm:p-6" data-aos="fade-up">
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <img
                      src={raffle.image_url || "/placeholder.svg"}
                      alt={raffle.title}
                      className="w-full sm:w-32 h-48 sm:h-32 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="editorial-eyebrow mb-1 text-neutral-400">Sorteo</p>
                          <h3 className="text-lg sm:text-xl font-black text-white mb-1">{raffle.title}</h3>
                          <p className="text-neutral-500 text-xs sm:text-sm line-clamp-2">{raffle.description || raffle.title}</p>
                        </div>
                        <span className={badge.class}>{badge.label}</span>
                      </div>

                      {raffle.status === "completed" && raffle.winner_ticket && (
                        <div className="mt-4 mb-4 p-4 bg-[#121212] border border-white/[0.07]">
                          <p className="editorial-eyebrow mb-3 text-neutral-400">Ganador del sorteo</p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Nombre</p>
                              <p className="text-white font-semibold">
                                {raffle.winner_ticket.user?.full_name || raffle.winner_ticket.guest_name || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Email</p>
                              <p className="text-white font-semibold truncate">
                                {raffle.winner_ticket.user?.email || raffle.winner_ticket.guest_email || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Boleto</p>
                              <p className="text-white font-mono font-bold">
                                #{raffle.winner_ticket.ticket_number.toString().padStart(4, "0")}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider">Código</p>
                              <p className="text-white font-mono text-xs">{raffle.winner_ticket.ticket_hash}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider mb-1">Precio</p>
                          <p className="text-white font-semibold">${formatPrice(raffle.ticket_price)}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider mb-1">Vendidos</p>
                          <p className="text-white font-semibold">
                            {formatCount(raffle.tickets_sold)} / {formatCount(raffle.total_tickets)}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500 text-[0.65rem] uppercase tracking-wider mb-1">Progreso</p>
                          <p className="text-white font-semibold">
                            {((raffle.tickets_sold / raffle.total_tickets) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-5">
                        <Link
                          href={`/admin/raffles/${raffle.id}`}
                          className="editorial-button-secondary px-4 py-2 text-xs"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                        {raffle.status !== "cancelled" && (
                          <DeleteRaffleButton raffleId={raffle.id} />
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
