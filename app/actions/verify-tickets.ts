"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function verifyTicketsByEmail(email: string) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  try {
    console.log("[v0] Verifying tickets for email:", email)

    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("id, ticket_number, payment_status, purchased_at, raffle_id")
      .eq("guest_email", email)
      .in("payment_status", ["completed", "pending"])
      .order("purchased_at", { ascending: false })

    if (ticketsError) {
      console.error("[v0] Error fetching tickets:", ticketsError)
      return { success: false, error: ticketsError.message, data: null }
    }

    console.log("[v0] Found tickets:", tickets?.length || 0)

    if (!tickets || tickets.length === 0) {
      return { success: true, data: [], email }
    }

    const raffleIds = [...new Set(tickets.map((t: any) => t.raffle_id).filter(Boolean))]
    console.log("[v0] Fetching raffles:", raffleIds)

    const { data: raffles, error: rafflesError } = await adminSupabase
      .from("raffles")
      .select("id, title, description, image_url, status, winner_ticket_id, draw_date")
      .in("id", raffleIds)

    if (rafflesError) {
      console.error("[v0] Error fetching raffles:", rafflesError)
      return { success: false, error: rafflesError.message, data: null }
    }

    console.log("[v0] Found raffles:", raffles?.length || 0)

    const foundRaffleIds = new Set(raffles?.map((r: any) => r.id) || [])
    const missingRaffleIds = raffleIds.filter((id) => !foundRaffleIds.has(id))
    if (missingRaffleIds.length > 0) {
      console.log("[v0] Missing raffles (not found in DB):", missingRaffleIds)
    }

    const raffleMap = new Map(raffles?.map((r: any) => [r.id, r]) || [])

    const groupedByRaffle = tickets.reduce((acc: any, ticket: any) => {
      const raffle = raffleMap.get(ticket.raffle_id)

      if (!raffle) {
        console.log("[v0] Ticket without raffle:", ticket.id, "raffle_id:", ticket.raffle_id)
        return acc
      }

      const raffleId = raffle.id

      if (!acc[raffleId]) {
        acc[raffleId] = {
          raffle: raffle,
          tickets: [],
          isWinner: false,
          approvedCount: 0,
          pendingCount: 0,
        }
      }

      acc[raffleId].tickets.push({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        purchased_at: ticket.purchased_at,
        payment_status: ticket.payment_status,
      })

      if (ticket.payment_status === "completed") {
        acc[raffleId].approvedCount = (acc[raffleId].approvedCount || 0) + 1
      } else if (ticket.payment_status === "pending") {
        acc[raffleId].pendingCount = (acc[raffleId].pendingCount || 0) + 1
      }

      if (raffle.winner_ticket_id && raffle.winner_ticket_id === ticket.id) {
        console.log("[v0] WINNER FOUND! Ticket:", ticket.id, "Raffle:", raffleId, "Status:", raffle.status)
        acc[raffleId].isWinner = true
        acc[raffleId].raffle.winner_ticket_id = raffle.winner_ticket_id
      }

      return acc
    }, {})

    const rafflesList = Object.values(groupedByRaffle || {})

    console.log("[v0] Grouped into raffles:", rafflesList.length)
    console.log("[v0] Raffles with winners:", rafflesList.filter((r: any) => r.isWinner).length)

    return {
      success: true,
      data: rafflesList,
      email,
    }
  } catch (error: any) {
    console.error("[v0] Exception in verifyTicketsByEmail:", error.message)
    return { success: false, error: error.message, data: null }
  }
}
