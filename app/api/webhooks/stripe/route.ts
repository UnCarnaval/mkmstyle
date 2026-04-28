import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"
import { sendTicketConfirmationEmail } from "@/lib/emails"
import { notifyPurchaseTelegram } from "@/lib/telegram"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("[v0] Webhook signature verification failed:", err)
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  console.log("[v0] Stripe webhook event:", event.type)

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const { raffle_id, user_id, ticket_count, is_guest, guest_name, guest_email, guest_phone } = session.metadata!

    const supabase = await createServerClient()

    const ticketNumber = Math.floor(Math.random() * 10000)
    const { data: ticket, error } = await supabase.rpc("insert_ticket", {
      p_raffle_id: raffle_id,
      p_user_id: is_guest === "true" ? null : user_id,
      p_guest_name: is_guest === "true" ? guest_name : null,
      p_guest_email: is_guest === "true" ? guest_email : null,
      p_guest_phone: is_guest === "true" ? guest_phone : null,
      p_payment_method: "stripe",
      p_ticket_number: ticketNumber,
    })

    if (error) {
      console.error("[v0] Error inserting ticket:", error)
      return new Response("Error creating ticket", { status: 500 })
    }

    const { data: raffle } = await supabase.from("raffles").select("*").eq("id", raffle_id).single()

    if (raffle) {
      await sendTicketConfirmationEmail({
        email: is_guest === "true" ? guest_email : session.customer_email || "",
        name: is_guest === "true" ? guest_name : "",
        raffleName: raffle.title,
        ticketNumber,
        amount: session.amount_total! / 100,
      })

      try {
        await notifyPurchaseTelegram({
          raffleName: raffle.title,
          buyerName: is_guest === "true" ? guest_name : null,
          buyerEmail: is_guest === "true" ? guest_email : session.customer_email || null,
          buyerPhone: is_guest === "true" ? guest_phone : null,
          ticketCount: Number(ticket_count) || 1,
          totalAmount: session.amount_total! / 100,
          paymentMethod: "stripe",
          paymentStatus: "completed",
          ticketNumbers: [ticketNumber],
        })
      } catch (telegramError: any) {
        console.error("[v0] Error sending Telegram notification:", telegramError?.message ?? telegramError)
      }
    }

    console.log("[v0] Ticket created successfully:", ticket)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
