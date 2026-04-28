import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SalesSearchFilter } from "@/components/sales-search-filter"
import { formatPrice, formatCount } from "@/lib/utils"

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || "all"

  const supabase = await createServerClient()

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

  let query = supabase.from("tickets").select(
    `
      *,
      raffle:raffles!raffle_id (
        id,
        title,
        image_url,
        ticket_price
      ),
      profile:profiles!user_id (
        full_name,
        email
      )
    `,
    { count: "exact" },
  )

  if (statusFilter !== "all") {
    query = query.eq("payment_status", statusFilter)
  }

  const { count: totalCount, error: countError } = await query

  let dataQuery = supabase
    .from("tickets")
    .select(`
      *,
      raffle:raffles!raffle_id (
        id,
        title,
        image_url,
        ticket_price
      ),
      profile:profiles!user_id (
        full_name,
        email
      )
    `)
    .order("purchased_at", { ascending: false })

  if (statusFilter !== "all") {
    dataQuery = dataQuery.eq("payment_status", statusFilter)
  }

  const { data: tickets, error: ticketsError } = await dataQuery

  const { data: completedTickets } = await supabase
    .from("tickets")
    .select(`
      raffle:raffles!raffle_id (ticket_price)
    `)
    .eq("payment_status", "completed")

  const totalRevenue =
    completedTickets?.reduce((acc, ticket: any) => {
      return acc + (ticket.raffle?.ticket_price || 0)
    }, 0) || 0

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-8" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Historial</p>
          <h1 className="editorial-heading">
            <span className="text-white">Ventas</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">
            Total de ventas: {formatCount(totalCount || 0)} · Ingresos: ${formatPrice(totalRevenue)}
          </p>
        </header>

        <div className="flex gap-6 mb-8 border-b border-white/[0.07]">
          {[
            { value: "all", label: "Todos" },
            { value: "completed", label: "Completados" },
            { value: "pending", label: "Pendientes" },
          ].map((filter) => {
            const isActive = statusFilter === filter.value
            return (
              <Link
                key={filter.value}
                href={`/admin/sales?status=${filter.value}`}
                className={
                  isActive
                    ? "border-b-2 border-white text-white pb-3 px-1 text-xs tracking-widest uppercase font-semibold"
                    : "border-b-2 border-transparent text-neutral-500 hover:text-white pb-3 px-1 text-xs tracking-widest uppercase font-semibold transition-colors"
                }
              >
                {filter.label}
              </Link>
            )
          })}
        </div>

        <SalesSearchFilter tickets={tickets || []} totalCount={totalCount || 0} />
      </div>
    </div>
  )
}
