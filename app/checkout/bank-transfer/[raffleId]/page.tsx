import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BankTransferCheckoutPage } from "@/components/bank-transfer-checkout-page"

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ raffleId: string }>
  searchParams: Promise<{
    ticketCount?: string
    name?: string
    email?: string
    phone?: string
  }>
}) {
  const { raffleId } = await params
  const search = await searchParams

  const supabase = await createServerClient()

  const { data: raffle } = await supabase.from("raffles").select("*").eq("id", raffleId).single()

  if (!raffle) {
    redirect("/")
  }

  const ticketCount = Number.parseInt(search.ticketCount || "1")
  const guestInfo =
    search.name && search.email && search.phone
      ? {
          name: search.name,
          email: search.email,
          phone: search.phone,
        }
      : undefined

  return (
    <BankTransferCheckoutPage raffleId={raffleId} raffle={raffle} ticketCount={ticketCount} guestInfo={guestInfo} />
  )
}
