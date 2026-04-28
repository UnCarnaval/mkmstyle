import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard-stats"
import { UserTickets } from "@/components/user-tickets"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      *,
      raffles (
        id,
        title,
        image_url,
        ticket_price,
        draw_date,
        status
      )
    `)
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const totalSpent =
    tickets?.reduce((acc, ticket) => {
      return acc + (ticket.raffles?.ticket_price || 0)
    }, 0) || 0

  const activeTickets = tickets?.filter((t) => t.raffles?.status === "active").length || 0

  return (
    <div className="min-h-screen bg-[#080808] py-16 sm:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-12" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Tu cuenta</p>
          <h1 className="editorial-heading">
            Mi <span className="text-white">Dashboard</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">
            Bienvenido, {profile?.full_name || user.email}
          </p>
        </header>

        <DashboardStats
          totalTickets={tickets?.length || 0}
          activeTickets={activeTickets}
          totalSpent={totalSpent}
        />

        <section className="mt-16" data-aos="fade-up">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="editorial-eyebrow mb-2">Historial</p>
              <h2 className="editorial-heading">
                Mis <span className="text-white">Boletos</span>
              </h2>
            </div>
            <Link
              href="/sorteos"
              className="text-neutral-400 hover:text-white text-sm font-semibold tracking-widest uppercase flex items-center gap-2 group"
            >
              Ver sorteos
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <UserTickets tickets={tickets || []} />
        </section>
      </div>
    </div>
  )
}
