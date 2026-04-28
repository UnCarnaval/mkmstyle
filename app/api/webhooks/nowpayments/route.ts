import { createServerClient } from "@/lib/supabase/server"
import { sendTicketConfirmationEmail } from "@/lib/emails"
import { notifyPurchaseTelegram } from "@/lib/telegram"

export async function POST(req: Request) {
  const body = await req.json()

  console.log("[v0] NowPayments webhook event:", body.payment_status)

  if (body.payment_status === "finished") {
    const { raffle_id, user_id, is_guest, guest_name, guest_email, guest_phone } = body.order_description
      ? JSON.parse(body.order_description)
      : {}

    const supabase = await createServerClient()

    const ticketNumber = Math.floor(Math.random() * 10000)
    const { data: ticket, error } = await supabase.rpc("insert_ticket", {
      p_raffle_id: raffle_id,
      p_user_id: is_guest ? null : user_id,
      p_guest_name: is_guest ? guest_name : null,
      p_guest_email: is_guest ? guest_email : null,
      p_guest_phone: is_guest ? guest_phone : null,
      p_payment_method: "crypto",
      p_ticket_number: ticketNumber,
    })

    if (error) {
      console.error("[v0] Error inserting ticket:", error)
      return new Response("Error creating ticket", { status: 500 })
    }

    const { data: raffle } = await supabase.from("raffles").select("*").eq("id", raffle_id).single()

    if (raffle) {
      await sendTicketConfirmationEmail({
        email: guest_email || "",
        name: guest_name || "",
        raffleName: raffle.title,
        ticketNumber,
        amount: body.price_amount,
      })

      try {
        await notifyPurchaseTelegram({
          raffleName: raffle.title,
          buyerName: guest_name || null,
          buyerEmail: guest_email || null,
          buyerPhone: guest_phone || null,
          ticketCount: 1,
          totalAmount: body.price_amount,
          paymentMethod: "crypto",
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
