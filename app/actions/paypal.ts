"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function createPayPalOrder(
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

  const totalAmount = (raffle.ticket_price * ticketCount).toFixed(2)

  return {
    amount: totalAmount,
    currency: "USD",
    description: `${raffle.title} - ${ticketCount} Boleto${ticketCount > 1 ? "s" : ""}`,
    raffleId,
    userId: user?.id || null,
    ticketCount,
  }
}

export async function verifyPayPalPayment(
  orderId: string,
  raffleId: string,
  ticketCount: number,
  guestInfo?: { name: string; email: string; phone: string } | null,
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !guestInfo) {
    throw new Error("Usuario no autenticado")
  }

  const { data: raffle } = await supabase.from("raffles").select("total_tickets").eq("id", raffleId).single()

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
      .eq("raffle_id", raffleId)
      .eq("ticket_number", ticketNumber)
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
    p_raffle_id: raffleId,
    p_user_id: user?.id || null,
    p_guest_name: guestInfo?.name || null,
    p_guest_email: guestInfo?.email || null,
    p_guest_phone: guestInfo?.phone || null,
    p_payment_method: "paypal",
    p_ticket_number: ticketNumber,
  })

  if (error) {
    throw new Error("Error al crear el boleto")
  }

  return { success: true, ticket: data }
}
