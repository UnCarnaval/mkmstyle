"use server"

import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"

export async function createStripeCheckout(
  raffleId: string,
  ticketCount = 1,
  guestInfo?: { name: string; email: string; phone: string } | null,
) {
  const supabase = await createServerClient()

  const { data: raffle, error } = await supabase.from("raffles").select("*").eq("id", raffleId).single()

  if (error || !raffle) {
    throw new Error("Sorteo no encontrado")
  }

  const { count: pendingCount } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("raffle_id", raffleId)
    .eq("payment_status", "pending")
  const reserved = (raffle.tickets_sold || 0) + (pendingCount || 0)
  if (reserved + ticketCount > raffle.total_tickets) {
    throw new Error(`Solo quedan ${Math.max(0, raffle.total_tickets - reserved)} boletos disponibles.`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !guestInfo) {
    throw new Error("Debes iniciar sesión o proporcionar información de contacto")
  }

  if (!stripe) {
    throw new Error("Stripe no está configurado")
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${raffle.title} - ${ticketCount} Boleto${ticketCount > 1 ? "s" : ""}`,
            description: raffle.description || raffle.title,
          },
          unit_amount: Math.round(raffle.ticket_price * 100),
        },
        quantity: ticketCount,
      },
    ],
    mode: "payment",
    metadata: {
      raffle_id: raffleId,
      user_id: user?.id || "",
      ticket_count: ticketCount.toString(),
      guest_name: guestInfo?.name || "",
      guest_email: guestInfo?.email || "",
      guest_phone: guestInfo?.phone || "",
      is_guest: (!user).toString(),
    },
  })

  return session.client_secret
}

export async function verifyStripePayment(sessionId: string) {
  if (!stripe) {
    throw new Error("Stripe no está configurado")
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status === "paid") {
    const supabase = await createServerClient()
    const { raffle_id, user_id, ticket_count, is_guest, guest_name, guest_email, guest_phone } = session.metadata!

    const { data: raffle } = await supabase.from("raffles").select("total_tickets").eq("id", raffle_id).single()

    if (!raffle) {
      throw new Error("Sorteo no encontrado")
    }

    let ticketNumber: number
    let attempts = 0
    let isUnique = false

    while (!isUnique && attempts < 100) {
      ticketNumber = Math.floor(Math.random() * raffle.total_tickets) + 1

      const { data: existingTicket } = await supabase
        .from("tickets")
        .select("id")
        .eq("raffle_id", raffle_id)
        .eq("ticket_number", ticketNumber!)
        .single()

      if (!existingTicket) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      throw new Error("No se pudo generar un número de boleto único")
    }

    const { data, error } = await supabase.rpc("insert_ticket", {
      p_raffle_id: raffle_id,
      p_user_id: is_guest === "true" ? null : user_id,
      p_guest_name: is_guest === "true" ? guest_name : null,
      p_guest_email: is_guest === "true" ? guest_email : null,
      p_guest_phone: is_guest === "true" ? guest_phone : null,
      p_payment_method: "stripe",
      p_ticket_number: ticketNumber,
    })

    if (error) {
      throw new Error("Error al crear el boleto")
    }

    return { success: true, ticket: data }
  }

  return { success: false }
}
