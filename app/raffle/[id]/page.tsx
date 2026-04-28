import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { RafflePurchaseClient } from "@/components/raffle-purchase-client"

export default async function RafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: raffle } = await supabase.from("raffles").select("*").eq("id", id).single()
  if (!raffle) notFound()

  const [{ data: { user } }, { data: allRaffles }, { count: pendingCount }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("raffles").select("*").eq("status", "active").neq("id", id),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("raffle_id", id)
      .eq("payment_status", "pending"),
  ])

  const otherRaffles = [...(allRaffles ?? [])].sort(() => Math.random() - 0.5).slice(0, 4)

  // Reservamos cupo con pendientes + completados para que la UI no muestre "disponible"
  // boletos que están a la espera de aprobación administrativa.
  const raffleWithReserved = { ...raffle, pending_count: pendingCount || 0 }

  return <RafflePurchaseClient raffle={raffleWithReserved} userId={user?.id} otherRaffles={otherRaffles} />
}
