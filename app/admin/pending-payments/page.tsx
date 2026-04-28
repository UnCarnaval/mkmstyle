import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PendingPaymentsList } from "@/components/pending-payments-list"

export default async function PendingPaymentsPage() {
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

  console.log("[v0] Fetching pending tickets...")
  const { data: pendingTickets, error } = await supabase
    .from("tickets")
    .select(`
      *,
      raffle:raffles!raffle_id (
        id,
        title,
        ticket_price
      )
    `)
    .eq("payment_method", "bank_transfer")
    .eq("payment_status", "pending")
    .order("purchased_at", { ascending: false })

  console.log("[v0] Pending tickets result:", {
    count: pendingTickets?.length || 0,
    error: error?.message,
    tickets: pendingTickets?.slice(0, 2),
  })

  if (error) {
    console.error("[v0] Error fetching tickets:", error)
  }

  const groupedPurchases = pendingTickets?.reduce(
    (acc, ticket) => {
      // Composite key: protege contra purchase_group_id duplicados entre compras distintas.
      const groupKey = [
        ticket.purchase_group_id || ticket.id,
        ticket.raffle_id,
        (ticket.guest_email || ticket.user_id || "").toLowerCase(),
      ].join("::")
      if (!acc[groupKey]) {
        acc[groupKey] = {
          id: groupKey,
          tickets: [],
          raffle: ticket.raffle,
          guest_name: ticket.guest_name,
          guest_email: ticket.guest_email,
          guest_phone: ticket.guest_phone,
          bank_reference: ticket.bank_reference,
          screenshot_url: ticket.screenshot_url,
          purchased_at: ticket.purchased_at,
        }
      }
      acc[groupKey].tickets.push(ticket)
      return acc
    },
    {} as Record<string, any>,
  )

  const purchasesList = Object.values(groupedPurchases || {}) as any[]
  console.log("[v0] Grouped purchases:", purchasesList.length)

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-10" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Aprobaciones</p>
          <h1 className="editorial-heading">
            Pagos <span className="text-white">Pendientes</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Verifica y aprueba transferencias bancarias pendientes</p>
        </header>

        <PendingPaymentsList purchases={purchasesList} />
      </div>
    </div>
  )
}
