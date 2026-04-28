"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createRaffle(formData: FormData) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "No tienes permisos de administrador" }
  }

  const title = formData.get("title") as string
  const description = ""
  const image_url = formData.get("image_url") as string
  const ticket_price = Number.parseFloat(formData.get("ticket_price") as string)
  const total_tickets = Number.parseInt(formData.get("total_tickets") as string)
  const draw_date = formData.get("draw_date") as string
  const min_tickets_per_purchase = Number.parseInt(formData.get("min_tickets_per_purchase") as string) || 1
  const size_options_raw = formData.get("size_options") as string
  const size_options = size_options_raw ? size_options_raw.split(",").map(s => s.trim()).filter(s => s) : null

  const { error } = await supabase.from("raffles").insert({
    title,
    description,
    image_url,
    ticket_price,
    total_tickets,
    draw_date,
    min_tickets_per_purchase,
    size_options,
    status: "active",
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true }
}

export async function updateRaffle(raffleId: string, formData: FormData) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "No tienes permisos de administrador" }
  }

  const title = formData.get("title") as string
  const image_url = formData.get("image_url") as string
  const ticket_price = Number.parseFloat(formData.get("ticket_price") as string)
  const total_tickets = Number.parseInt(formData.get("total_tickets") as string)
  const draw_date = formData.get("draw_date") as string
  const status = formData.get("status") as string
  const min_tickets_per_purchase = Number.parseInt(formData.get("min_tickets_per_purchase") as string) || 1
  const size_options_raw = formData.get("size_options") as string
  const size_options = size_options_raw ? size_options_raw.split(",").map(s => s.trim()).filter(s => s) : null

  const { error } = await supabase
    .from("raffles")
    .update({
      title,
      image_url,
      ticket_price,
      total_tickets,
      draw_date,
      status,
      min_tickets_per_purchase,
      size_options,
      updated_at: new Date().toISOString(),
    })
    .eq("id", raffleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/sorteos")
  revalidatePath("/admin")
  revalidatePath("/admin/raffles")
  revalidatePath(`/raffle/${raffleId}`)
  return { success: true }
}

export async function deleteRaffle(raffleId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "No tienes permisos de administrador" }
  }

  const { error } = await supabase.from("raffles").delete().eq("id", raffleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/sorteos")
  revalidatePath("/admin")
  revalidatePath("/admin/raffles")
  return { success: true }
}

export async function cancelRaffle(raffleId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "No tienes permisos de administrador" }
  }

  const { error } = await supabase
    .from("raffles")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", raffleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/sorteos")
  revalidatePath("/admin")
  revalidatePath("/admin/raffles")
  revalidatePath(`/raffle/${raffleId}`)
  return { success: true }
}

export async function updatePaymentSettings(provider: string, isEnabled: boolean, config: any) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "No tienes permisos de administrador" }
  }

  const { error } = await supabase
    .from("payment_settings")
    .update({
      is_enabled: isEnabled,
      config,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("provider", provider)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

export async function deleteTicket(ticketId: string, raffleId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autorizado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos de administrador")
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .eq("raffle_id", raffleId)
    .single()

  if (ticketError || !ticket) {
    throw new Error("Boleto no encontrado")
  }

  const { error: deleteError } = await supabase.from("tickets").delete().eq("id", ticketId)

  if (deleteError) {
    throw new Error("Error al eliminar el boleto: " + deleteError.message)
  }

  if (ticket.payment_status === "completed") {
    const { data: raffle, error: raffleError } = await supabase
      .from("raffles")
      .select("tickets_sold")
      .eq("id", raffleId)
      .single()

    if (!raffleError && raffle) {
      const { error: updateError } = await supabase
        .from("raffles")
        .update({
          tickets_sold: Math.max(0, raffle.tickets_sold - 1),
        })
        .eq("id", raffleId)

      if (updateError) {
        console.error("[v0] Error updating raffle tickets_sold:", updateError)
      }
    }
  }

  revalidatePath("/admin/sales")
  revalidatePath(`/admin/raffles/${raffleId}`)
  revalidatePath("/admin/raffles")
  revalidatePath("/admin")

  return { success: true }
}
