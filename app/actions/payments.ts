"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { queueEmail } from "@/lib/email-queue"

export async function approveGroupPayment(ticketIds: string[]) {
  console.log("[v0] ========== APPROVE GROUP PAYMENT START ==========")
  console.log("[v0] Ticket IDs to approve:", ticketIds)

  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("[v0] Current user:", user?.id)

    if (!user) {
      console.log("[v0] ERROR: No authenticated user")
      return { error: "No autenticado" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    console.log("[v0] Profile:", profile, "Error:", profileError)

    if (profile?.role !== "admin") {
      console.log("[v0] ERROR: User is not admin, role:", profile?.role)
      return { error: "No tienes permisos para realizar esta accion" }
    }

    console.log("[v0] Fetching tickets...")
    const { data: tickets, error: fetchError } = await supabase
      .from("tickets")
      .select(`
        *,
        raffle:raffles!raffle_id (
          id,
          title,
          ticket_price
        ),
        profile:profiles!user_id (
          full_name,
          email
        )
      `)
      .in("id", ticketIds)

    console.log("[v0] Fetch result - tickets:", tickets?.length, "error:", fetchError)

    if (fetchError) {
      console.error("[v0] ERROR fetching tickets:", fetchError)
      return { error: "Error al obtener boletos: " + fetchError.message }
    }

    if (!tickets || tickets.length === 0) {
      console.log("[v0] ERROR: No tickets found")
      return { error: "Boletos no encontrados" }
    }

    console.log("[v0] Updating ticket status to completed...")
    const { data: updateData, error: updateError } = await supabase
      .from("tickets")
      .update({
        payment_status: "completed",
        purchased_at: new Date().toISOString(),
      })
      .in("id", ticketIds)
      .eq("payment_status", "pending")
      .eq("payment_method", "bank_transfer")
      .select()

    console.log("[v0] Update result - data:", updateData, "error:", updateError)

    if (updateError) {
      console.error("[v0] ERROR updating tickets:", updateError)
      return { error: "Error al aprobar los pagos: " + updateError.message }
    }

    console.log("[v0] Tickets updated successfully, count:", updateData?.length)

    try {
      const firstTicket = tickets[0] as any
      const email = firstTicket.guest_email || firstTicket.profile?.email || ""
      const name = firstTicket.guest_name || firstTicket.profile?.full_name || "Cliente"

      console.log("[v0] Queueing confirmation email to:", email, "name:", name)

      if (email && firstTicket.raffle) {
        if (tickets.length > 1) {
          console.log("[v0] Queueing multiple tickets email...")
          await queueEmail({
            toEmail: email,
            toName: name,
            subject: `✓ ${tickets.length} Boletos Confirmados - ${firstTicket.raffle.title}`,
            emailType: "multiple_tickets",
            data: {
              raffleName: firstTicket.raffle.title,
              tickets: tickets.map((t: any) => ({
                ticketNumber: t.ticket_number,
                ticketHash: t.ticket_hash || "N/A",
              })),
              totalAmount: firstTicket.raffle.ticket_price * tickets.length,
            },
          })
        } else {
          console.log("[v0] Queueing single ticket email...")
          await queueEmail({
            toEmail: email,
            toName: name,
            subject: `✓ Boleto Confirmado - ${firstTicket.raffle.title}`,
            emailType: "single_ticket",
            data: {
              raffleName: firstTicket.raffle.title,
              ticketNumber: firstTicket.ticket_number,
              ticketHash: firstTicket.ticket_hash || "N/A",
              amount: firstTicket.raffle.ticket_price,
            },
          })
        }
      }
    } catch (emailError: any) {
      console.error("[v0] Email queueing error (non-blocking):", emailError.message)
    }

    revalidatePath("/admin/pending-payments")
    revalidatePath("/admin/sales")

    console.log("[v0] ========== APPROVE GROUP PAYMENT SUCCESS ==========")
    return { success: true, updatedCount: updateData?.length || 0 }
  } catch (error: any) {
    console.error("[v0] UNEXPECTED ERROR in approveGroupPayment:", error)
    return { error: "Error inesperado: " + error.message }
  }
}

export async function rejectGroupPayment(ticketIds: string[]) {
  console.log("[v0] ========== REJECT GROUP PAYMENT START ==========")
  console.log("[v0] Ticket IDs to reject:", ticketIds)

  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("[v0] Current user:", user?.id)

    if (!user) {
      return { error: "No autenticado" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return { error: "No tienes permisos para realizar esta accion" }
    }

    console.log("[v0] Fetching tickets before deletion...")
    const { data: tickets, error: fetchError } = await supabase
      .from("tickets")
      .select(`
        *,
        raffle:raffles!raffle_id (
          id,
          title,
          ticket_price
        ),
        profile:profiles!user_id (
          full_name,
          email
        )
      `)
      .in("id", ticketIds)

    console.log("[v0] Fetch result - tickets:", tickets?.length, "error:", fetchError)

    if (fetchError) {
      console.error("[v0] ERROR fetching tickets:", fetchError)
      return { error: "Error al obtener boletos: " + fetchError.message }
    }

    console.log("[v0] Deleting tickets...")
    const { data: deleteData, error: deleteError } = await supabase
      .from("tickets")
      .delete()
      .in("id", ticketIds)
      .eq("payment_status", "pending")
      .eq("payment_method", "bank_transfer")
      .select()

    console.log("[v0] Delete result - data:", deleteData, "error:", deleteError)

    if (deleteError) {
      console.error("[v0] ERROR deleting tickets:", deleteError)
      return { error: "Error al rechazar los pagos: " + deleteError.message }
    }

    if (tickets && tickets.length > 0) {
      try {
        const firstTicket = tickets[0] as any
        const email = firstTicket.guest_email || firstTicket.profile?.email || ""
        const name = firstTicket.guest_name || firstTicket.profile?.full_name || "Cliente"

        console.log("[v0] Queueing cancellation email to:", email, "name:", name)

        if (email && firstTicket.raffle) {
          await queueEmail({
            toEmail: email,
            toName: name,
            subject: `✕ Pago Rechazado - ${firstTicket.raffle.title}`,
            emailType: "payment_rejected",
            data: {
              raffleName: firstTicket.raffle.title,
              ticketCount: tickets.length,
              totalAmount: firstTicket.raffle.ticket_price * tickets.length,
            },
          })
        }
      } catch (emailError: any) {
        console.error("[v0] Cancellation email queueing error (non-blocking):", emailError.message)
      }
    }

    revalidatePath("/admin/pending-payments")
    revalidatePath("/admin/sales")

    console.log("[v0] ========== REJECT GROUP PAYMENT SUCCESS ==========")
    return { success: true, deletedCount: deleteData?.length || 0 }
  } catch (error: any) {
    console.error("[v0] UNEXPECTED ERROR in rejectGroupPayment:", error)
    return { error: "Error inesperado: " + error.message }
  }
}

export async function approvePayment(ticketId: string) {
  return approveGroupPayment([ticketId])
}

export async function rejectPayment(ticketId: string) {
  return rejectGroupPayment([ticketId])
}

export async function getBankAccounts() {
  const supabase = await createServerClient()

  const { data: accounts } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  return accounts || []
}

export async function createBankAccount(data: {
  bankName: string
  accountHolder: string
  accountNumber: string
  accountType: string
  bankLogo?: string
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos")
  }

  const { data: accountData, error } = await supabase
    .from("bank_accounts")
    .insert({
      bank_name: data.bankName,
      account_holder: data.accountHolder,
      account_number: data.accountNumber,
      account_type: data.accountType,
      bank_logo: data.bankLogo || null,
    })
    .select()
    .single()

  if (error) throw new Error("Error al crear cuenta bancaria")

  return { success: true, account: accountData }
}

export async function updateBankAccount(
  id: string,
  data: {
    bankName: string
    accountHolder: string
    accountNumber: string
    accountType: string
    isActive: boolean
    bankLogo?: string
  },
) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos")
  }

  const { error } = await supabase
    .from("bank_accounts")
    .update({
      bank_name: data.bankName,
      account_holder: data.accountHolder,
      account_number: data.accountNumber,
      account_type: data.accountType,
      is_active: data.isActive,
      bank_logo: data.bankLogo || null,
    })
    .eq("id", id)

  if (error) throw new Error("Error al actualizar cuenta bancaria")

  return { success: true }
}

export async function deleteBankAccount(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos")
  }

  const { error } = await supabase.from("bank_accounts").delete().eq("id", id)

  if (error) throw new Error("Error al eliminar cuenta bancaria")

  return { success: true }
}

export async function getAllBankAccounts() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos")
  }

  const { data: accounts } = await supabase.from("bank_accounts").select("*").order("created_at", { ascending: false })

  return accounts || []
}
