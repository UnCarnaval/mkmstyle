import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, DollarSign, Ticket, Users, TrendingUp, XCircle } from "lucide-react"
import { formatPrice, formatCount, formatCompact, formatPriceCompact } from "@/lib/utils"

export const revalidate = 0

export default async function AdminPage() {
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

  const { data: raffles } = await supabase.from("raffles").select("*").order("created_at", { ascending: false })

  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      *,
      raffle:raffles!raffle_id(
        ticket_price
      )
    `)
    .eq("payment_status", "completed")

  const { data: profiles } = await supabase.from("profiles").select("*")

  const activeRaffles = raffles?.filter((r) => r.status === "active").length || 0
  const cancelledRaffles = raffles?.filter((r) => r.status === "cancelled").length || 0
  const totalTicketsSold = tickets?.length || 0
  const totalRevenue =
    tickets?.reduce((acc, ticket: any) => {
      return acc + (ticket.raffle?.ticket_price || 0)
    }, 0) || 0
  const totalUsers = profiles?.length || 0

  console.log("[v0] Admin stats:", {
    activeRaffles,
    cancelledRaffles,
    totalTicketsSold,
    totalRevenue,
    totalUsers,
    ticketsData: tickets?.length,
  })

  const recentRaffles = raffles?.slice(0, 10) ?? []

  const stats = [
    {
      label: "Sorteos",
      title: "Activos",
      value: formatCompact(activeRaffles),
      fullValue: formatCount(activeRaffles),
      icon: TrendingUp,
    },
    {
      label: "Sorteos",
      title: "Cancelados",
      value: formatCompact(cancelledRaffles),
      fullValue: formatCount(cancelledRaffles),
      icon: XCircle,
    },
    {
      label: "Boletos",
      title: "Vendidos",
      value: formatCompact(totalTicketsSold),
      fullValue: formatCount(totalTicketsSold),
      icon: Ticket,
    },
    {
      label: "Ingresos",
      title: "Total acumulado",
      value: `$${formatPriceCompact(totalRevenue)}`,
      fullValue: `$${formatPrice(totalRevenue)}`,
      icon: DollarSign,
    },
    {
      label: "Usuarios",
      title: "Registrados",
      value: formatCompact(totalUsers),
      fullValue: formatCount(totalUsers),
      icon: Users,
    },
  ]

  const quickLinks = [
    { href: "/admin/raffles", eyebrow: "Catálogo", title: "Gestionar Sorteos", body: "Ver, editar y eliminar sorteos existentes" },
    { href: "/admin/sales", eyebrow: "Historial", title: "Ver Ventas", body: "Historial completo de todas las ventas" },
    { href: "/admin/settings", eyebrow: "Plataforma", title: "Configurar Pagos", body: "Métodos de pago y configuración general" },
  ]

  function statusBadge(status: string) {
    if (status === "active") return { class: "badge badge-success", label: "Activo" }
    if (status === "completed") return { class: "badge badge-neutral", label: "Finalizado" }
    return { class: "badge badge-danger", label: "Cancelado" }
  }

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6" data-aos="fade-up">
          <header>
            <p className="editorial-eyebrow mb-2">Resumen</p>
            <h1 className="editorial-heading">
              Panel <span className="text-white">Admin</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-3">Gestiona sorteos, pagos y estadísticas</p>
          </header>
          <Link href="/admin/raffles/new" className="editorial-button-primary">
            <Plus className="w-4 h-4" />
            Crear Sorteo
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5 mb-12">
          {stats.map(({ label, title, value, fullValue, icon: Icon }, i) => (
            <div
              key={`${label}-${title}`}
              className="bg-[#080808] p-5 sm:p-6 group hover:bg-[#0d0d0d] transition-colors min-w-0"
              data-aos="fade-up"
              data-aos-delay={i * 75}
            >
              <div className="w-10 h-10 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 blur-xl rounded-full opacity-60 bg-white/10 group-hover:opacity-100 transition-opacity" />
                <Icon className="w-5 h-5 relative z-10 text-white" />
              </div>
              <p className="editorial-eyebrow mb-2">{label}</p>
              <h3
                className="text-2xl sm:text-3xl font-black text-white mb-1 truncate"
                title={fullValue}
              >
                {value}
              </h3>
              <p className="text-neutral-500 text-xs sm:text-sm truncate">{title}</p>
              <div className="mt-4 h-px bg-gradient-to-r from-white/40 to-transparent" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 mb-12">
          {quickLinks.map(({ href, eyebrow, title, body }, i) => (
            <Link
              key={href}
              href={href}
              className="bg-[#080808] hover:bg-[#0d0d0d] p-8 group transition-colors"
              data-aos="fade-up"
              data-aos-delay={i * 75}
            >
              <p className="editorial-eyebrow mb-3">{eyebrow}</p>
              <h3 className="text-xl font-black text-white mb-2 flex items-center gap-3">
                {title}
                <span className="text-neutral-600 group-hover:text-white transition-colors group-hover:translate-x-1 inline-block">→</span>
              </h3>
              <p className="text-neutral-500 text-sm">{body}</p>
            </Link>
          ))}
        </div>

        <section className="editorial-card" data-aos="fade-up">
          <div className="px-6 sm:px-8 py-5 border-b border-white/[0.07]">
            <p className="editorial-eyebrow mb-1">Catálogo</p>
            <h2 className="text-xl font-black text-white">Sorteos Recientes</h2>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {recentRaffles.length === 0 ? (
              <p className="px-6 sm:px-8 py-8 text-neutral-500 text-sm">No hay sorteos creados aún.</p>
            ) : (
              recentRaffles.map((raffle) => {
                const badge = statusBadge(raffle.status)
                return (
                  <Link
                    key={raffle.id}
                    href={`/admin/raffles/${raffle.id}`}
                    className="flex items-center gap-4 px-6 sm:px-8 py-4 hover:bg-[#121212] transition-colors"
                  >
                    <img
                      src={raffle.image_url || "/placeholder.svg"}
                      alt={raffle.title}
                      className="w-16 h-16 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{raffle.title}</h3>
                      <p className="text-xs text-neutral-500">
                        {formatCount(raffle.tickets_sold)} / {formatCount(raffle.total_tickets)} vendidos
                      </p>
                    </div>
                    <span className={badge.class}>{badge.label}</span>
                  </Link>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
