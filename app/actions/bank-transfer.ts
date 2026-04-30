"use server"

import { createServerClient } from "@/lib/supabase/server"
import { queueEmail } from "@/lib/email-queue"
import { notifyPurchaseTelegram } from "@/lib/telegram"

export async function createBankTransferTickets({
  raffleId,
  ticketCount,
  guestName,
  guestEmail,
  guestPhone,
  bankReference,
  screenshotUrl,
}: {
  raffleId: string
  ticketCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  bankReference?: string
  screenshotUrl?: string
}) {
  const supabase = await createServerClient()

  const { data: raffle } = await supabase.from("raffles").select("*").eq("id", raffleId).single()

  if (!raffle) {
    throw new Error("Sorteo no encontrado")
  }

  // Reservamos cupo también con compras pendientes para no sobrevender mientras
  // el admin revisa los comprobantes. tickets_sold solo cuenta los aprobados.
  const { count: pendingCount } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("raffle_id", raffleId)
    .eq("payment_status", "pending")

  const reserved = (raffle.tickets_sold || 0) + (pendingCount || 0)
  const available = raffle.total_tickets - reserved
  if (available < ticketCount) {
    throw new Error(
      `Solo quedan ${Math.max(0, available)} boleto${available === 1 ? "" : "s"} disponible${available === 1 ? "" : "s"}, pero solicitaste ${ticketCount}.`,
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const purchaseGroupId = crypto.randomUUID()

  const { data: takenRows, error: takenErr } = await supabase
    .from("tickets")
    .select("ticket_number")
    .eq("raffle_id", raffleId)

  if (takenErr) {
    console.error("[v0] Error fetching taken ticket numbers:", takenErr)
    throw new Error("No se pudieron consultar los boletos disponibles")
  }

  const taken = new Set<number>((takenRows || []).map((r: any) => r.ticket_number))
  const availableCount = raffle.total_tickets - taken.size
  if (availableCount < ticketCount) {
    throw new Error(
      `Solo quedan ${Math.max(0, availableCount)} boleto${availableCount === 1 ? "" : "s"} disponible${availableCount === 1 ? "" : "s"}, pero solicitaste ${ticketCount}.`,
    )
  }

  const pickedNumbers: number[] = []
  const pickedSet = new Set<number>()
  const sparseThreshold = Math.max(50, ticketCount * 20)

  if (availableCount <= sparseThreshold) {
    const available: number[] = []
    for (let n = 1; n <= raffle.total_tickets; n++) {
      if (!taken.has(n)) available.push(n)
    }
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[available[i], available[j]] = [available[j], available[i]]
    }
    pickedNumbers.push(...available.slice(0, ticketCount))
  } else {
    while (pickedNumbers.length < ticketCount) {
      const candidate = Math.floor(Math.random() * raffle.total_tickets) + 1
      if (!taken.has(candidate) && !pickedSet.has(candidate)) {
        pickedNumbers.push(candidate)
        pickedSet.add(candidate)
      }
    }
  }

  const ticketsToCreate = pickedNumbers.map((ticketNumber) => ({
    raffle_id: raffleId,
    user_id: user?.id || null,
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone,
    ticket_number: ticketNumber,
    payment_method: "bank_transfer",
    payment_status: "pending",
    bank_reference: bankReference || null,
    screenshot_url: screenshotUrl,
    purchase_group_id: purchaseGroupId,
  }))

  const { data: tickets, error } = await supabase.from("tickets").insert(ticketsToCreate).select()

  if (error) {
    console.error("[v0] Error creating tickets:", error)
    throw new Error(`Error al crear los boletos: ${error.message}`)
  }

  let emailSent = false
  try {
    const ticketNumbers = (tickets ?? []).map((t: any) => t.ticket_number)
    const totalAmount = raffle.ticket_price * ticketCount

    const orderResult = await queueEmail({
      toEmail: guestEmail,
      toName: guestName,
      subject: `📋 Orden Recibida - ${raffle.title}`,
      emailType: "order_received",
      data: {
        raffleName: raffle.title,
        ticketCount,
        totalAmount,
        bankReference: bankReference || "No proporcionado",
        referenceNumber: bankReference || "No proporcionado",
      },
    })

    const pendingResult = await queueEmail({
      toEmail: guestEmail,
      toName: guestName,
      subject: `⏳ Pago en Verificación - ${raffle.title}`,
      emailType: "pending_payment",
      data: {
        raffleName: raffle.title,
        ticketCount,
        totalAmount,
        ticketNumbers,
      },
    })

    emailSent = Boolean(orderResult?.success || pendingResult?.success)
  } catch (emailError: any) {
    console.error("[v0] Error queueing confirmation email:", emailError?.message ?? emailError)
  }

  try {
    await notifyPurchaseTelegram({
      raffleName: raffle.title,
      buyerName: guestName,
      buyerEmail: guestEmail,
      buyerPhone: guestPhone,
      ticketCount,
      totalAmount: raffle.ticket_price * ticketCount,
      paymentMethod: "bank_transfer",
      paymentStatus: "pending",
      ticketNumbers: (tickets ?? []).map((t: any) => t.ticket_number),
      bankReference,
      screenshotUrl,
    })
  } catch (telegramError: any) {
    console.error("[v0] Error sending Telegram notification:", telegramError?.message ?? telegramError)
  }

  return {
    success: true,
    tickets,
    purchaseGroupId,
    emailSent,
    notifiedEmail: guestEmail,
  }
}

export async function createBankTransferTicket(params: {
  raffleId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  bankReference?: string
  screenshotUrl?: string
}) {
  const result = await createBankTransferTickets({
    ...params,
    ticketCount: 1,
  })

  return {
    success: result.success,
    ticket: result.tickets[0],
  }
}
