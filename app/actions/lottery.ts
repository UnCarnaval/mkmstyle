"use server"

import { createServerClient } from "@/lib/supabase/server"
import { sendWinnerNotificationEmail } from "@/lib/emails"

export async function selectWinner(raffleId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos para realizar esta acción")
  }

  const { data: raffle, error: raffleError } = await supabase.from("raffles").select("*").eq("id", raffleId).single()

  if (raffleError || !raffle) {
    throw new Error("Sorteo no encontrado")
  }

  if (raffle.status !== "active") {
    throw new Error("El sorteo no está activo")
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("*")
    .eq("raffle_id", raffleId)
    .eq("payment_status", "completed")

  if (ticketsError || !tickets || tickets.length === 0) {
    throw new Error("No hay boletos confirmados para este sorteo")
  }

  const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)]

  const { error: updateError } = await supabase
    .from("raffles")
    .update({
      status: "completed",
      winner_ticket_id: winnerTicket.id,
    })
    .eq("id", raffleId)

  if (updateError) {
    console.error("[v0] Error updating raffle:", updateError)
    throw new Error("Error al actualizar el sorteo: " + updateError.message)
  }

  try {
    if (winnerTicket.user_id) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", winnerTicket.user_id).single()

      if (profile) {
        await sendWinnerNotificationEmail({
          email: profile.email || "",
          name: profile.full_name || "",
          raffleName: raffle.title,
          ticketNumber: winnerTicket.ticket_number,
          prize: raffle.title,
        })
      }
    } else {
      await sendWinnerNotificationEmail({
        email: winnerTicket.guest_email || "",
        name: winnerTicket.guest_name || "",
        raffleName: raffle.title,
        ticketNumber: winnerTicket.ticket_number,
        prize: raffle.title,
      })
    }
  } catch (emailError) {
    console.error("[v0] Error sending winner email:", emailError)
  }

  return {
    success: true,
    winner: winnerTicket,
  }
}

export async function selectWinnerManual(raffleId: string, ticketNumber: number) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos para realizar esta acción")
  }

  const { data: raffle, error: raffleError } = await supabase.from("raffles").select("*").eq("id", raffleId).single()

  if (raffleError || !raffle) {
    throw new Error("Sorteo no encontrado")
  }

  if (raffle.status !== "active") {
    throw new Error("El sorteo no está activo")
  }

  const { data: ticketsArray, error: ticketError } = await supabase
    .from("tickets")
    .select("*")
    .eq("raffle_id", raffleId)
    .eq("ticket_number", ticketNumber)
    .eq("payment_status", "completed")
    .limit(1)

  if (ticketError) {
    console.error("[v0] Error fetching ticket:", ticketError)
    throw new Error("Error al buscar el boleto")
  }

  const winnerTicket = ticketsArray?.[0]

  if (!winnerTicket) {
    throw new Error("No se encontró un boleto con ese número o no está pagado")
  }

  const { error: updateError } = await supabase
    .from("raffles")
    .update({
      status: "completed",
      winner_ticket_id: winnerTicket.id,
    })
    .eq("id", raffleId)

  if (updateError) {
    console.error("[v0] Error updating raffle:", updateError)
    throw new Error("Error al actualizar el sorteo: " + updateError.message)
  }

  try {
    if (winnerTicket.user_id) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", winnerTicket.user_id).single()

      if (profile) {
        await sendWinnerNotificationEmail({
          email: profile.email || "",
          name: profile.full_name || "",
          raffleName: raffle.title,
          ticketNumber: winnerTicket.ticket_number,
          prize: raffle.title,
        })
      }
    } else {
      await sendWinnerNotificationEmail({
        email: winnerTicket.guest_email || "",
        name: winnerTicket.guest_name || "",
        raffleName: raffle.title,
        ticketNumber: winnerTicket.ticket_number,
        prize: raffle.title,
      })
    }
  } catch (emailError) {
    console.error("[v0] Error sending winner email:", emailError)
  }

  return {
    success: true,
    winner: winnerTicket,
  }
}

export async function checkAndDrawAutomatically(raffleId: string) {
  const supabase = await createServerClient()

  const { data: raffle } = await supabase.from("raffles").select("*").eq("id", raffleId).single()

  if (!raffle) return

  const isComplete = raffle.tickets_sold >= raffle.total_tickets || new Date(raffle.end_date) <= new Date()

  if (isComplete && raffle.status === "active") {
    console.log("[v0] Raffle is complete, automatically selecting winner:", raffleId)
    await selectWinner(raffleId)
  }
}
