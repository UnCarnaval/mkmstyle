import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { RaffleForm } from "@/components/raffle-form"
import { DollarSign, TrendingUp } from "lucide-react"

export default async function AdminRaffleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "new") {
    redirect("/admin/raffles/new")
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

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

  const { data: raffle } = await supabase.from("raffles").select("*").eq("id", id).single()

  if (!raffle) {
    notFound()
  }

  const { data: ticketSales } = await supabase
    .from("tickets")
    .select("payment_method, payment_status")
    .eq("raffle_id", id)
    .eq("payment_status", "completed")

  const totalRevenue = (raffle?.tickets_sold || 0) * (raffle?.ticket_price || 0)
  const pendingRevenue = ticketSales?.filter((t) => t.payment_status === "pending").length || 0
  const revenueByMethod = ticketSales?.reduce(
    (acc, ticket) => {
      acc[ticket.payment_method] = (acc[ticket.payment_method] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-10" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Edición</p>
          <h1 className="editorial-heading">
            Editar <span className="text-white">Sorteo</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Modifica los detalles del sorteo</p>
        </header>

        <div className="grid md:grid-cols-3 gap-px bg-white/5 mb-10">
          <div className="bg-[#080808] p-6 group hover:bg-[#0d0d0d] transition-colors">
            <div className="w-10 h-10 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 blur-xl rounded-full bg-white/10 opacity-60 group-hover:opacity-100 transition-opacity" />
              <DollarSign className="w-5 h-5 relative z-10 text-white" />
            </div>
            <p className="editorial-eyebrow mb-2">Ingresos</p>
            <p className="text-3xl font-black text-white mb-1">${totalRevenue.toFixed(2)}</p>
            <p className="text-neutral-500 text-sm">{raffle?.tickets_sold || 0} boletos vendidos</p>
          </div>

          <div className="bg-[#080808] p-6 group hover:bg-[#0d0d0d] transition-colors">
            <div className="w-10 h-10 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 blur-xl rounded-full bg-white/10 opacity-60 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="w-5 h-5 relative z-10 text-white" />
            </div>
            <p className="editorial-eyebrow mb-2">Pendientes</p>
            <p className="text-3xl font-black text-white mb-1">
              ${(pendingRevenue * (raffle?.ticket_price || 0)).toFixed(2)}
            </p>
            <p className="text-neutral-500 text-sm">{pendingRevenue} pagos por confirmar</p>
          </div>

          <div className="bg-[#080808] p-6">
            <p className="editorial-eyebrow mb-3">Métodos</p>
            <div className="space-y-2">
              {Object.entries(revenueByMethod || {}).map(([method, count]) => (
                <div key={method} className="flex justify-between items-baseline border-b border-white/[0.07] pb-1.5 last:border-b-0 last:pb-0">
                  <span className="text-neutral-400 text-xs uppercase tracking-wider capitalize">{method.replace("_", " ")}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(revenueByMethod || {}).length === 0 && (
                <p className="text-neutral-500 text-sm">Sin ventas aún</p>
              )}
            </div>
          </div>
        </div>

        <RaffleForm raffle={raffle} />
      </div>
    </div>
  )
}
