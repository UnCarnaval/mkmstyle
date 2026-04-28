import { createServerClient } from "@/lib/supabase/server"
import {
  sendTicketConfirmationEmail,
  sendMultipleTicketsConfirmationEmail,
  sendPaymentRejectedEmail,
  sendPurchasePendingEmail,
  sendOrderReceivedEmail,
} from "@/lib/emails"

interface QueueEmailParams {
  toEmail: string
  toName: string
  subject: string
  emailType: "single_ticket" | "multiple_tickets" | "payment_rejected" | "pending_payment" | "order_received"
  data: any
  scheduledFor?: Date
}

export async function queueEmail(params: QueueEmailParams) {
  const supabase = await createServerClient()

  // Generate HTML based on email type
  const htmlContent = ""

  try {
    switch (params.emailType) {
      case "single_ticket":
        const singleResult = await sendTicketConfirmationEmail({
          email: params.toEmail,
          name: params.toName,
          raffleName: params.data.raffleName,
          ticketNumber: params.data.ticketNumber,
          ticketHash: params.data.ticketHash,
          amount: params.data.amount,
        })
        if (singleResult.success) {
          return { success: true }
        }
        break

      case "multiple_tickets":
        const multiResult = await sendMultipleTicketsConfirmationEmail({
          email: params.toEmail,
          name: params.toName,
          raffleName: params.data.raffleName,
          tickets: params.data.tickets,
          totalAmount: params.data.totalAmount,
        })
        if (multiResult.success) {
          return { success: true }
        }
        break

      case "payment_rejected":
        const rejectResult = await sendPaymentRejectedEmail({
          email: params.toEmail,
          name: params.toName,
          raffleName: params.data.raffleName,
          ticketCount: params.data.ticketCount,
          totalAmount: params.data.totalAmount,
        })
        if (rejectResult.success) {
          return { success: true }
        }
        break

      case "pending_payment":
        const pendingResult = await sendPurchasePendingEmail({
          email: params.toEmail,
          name: params.toName,
          raffleName: params.data.raffleName,
          ticketCount: params.data.ticketCount,
          totalAmount: params.data.totalAmount,
          ticketNumbers: params.data.ticketNumbers || [],
        })
        if (pendingResult.success) {
          return { success: true }
        }
        break

      case "order_received":
        const orderResult = await sendOrderReceivedEmail({
          email: params.toEmail,
          name: params.toName,
          raffleName: params.data.raffleName,
          ticketCount: params.data.ticketCount,
          totalAmount: params.data.totalAmount,
          bankReference: params.data.referenceNumber || params.data.bankReference,
        })
        if (orderResult.success) {
          return { success: true }
        }
        break
    }

    // If direct send failed, queue it
    const { error } = await supabase.from("email_queue").insert({
      to_email: params.toEmail,
      to_name: params.toName,
      subject: params.subject,
      html_content: JSON.stringify({ type: params.emailType, data: params.data }),
      scheduled_for: params.scheduledFor || new Date(),
    })

    if (error) {
      console.error("[v0] Error queueing email:", error)
      return { success: false, error: error.message }
    }

    return { success: true, queued: true }
  } catch (error: any) {
    console.error("[v0] Error in queueEmail:", error)
    return { success: false, error: error.message }
  }
}

// Process email queue (can be called by a cron job)
export async function processEmailQueue() {
  const supabase = await createServerClient()

  // Get pending emails
  const { data: emails } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .lt("attempts", 3)
    .order("created_at", { ascending: true })
    .limit(10)

  if (!emails || emails.length === 0) {
    return { processed: 0 }
  }

  let processed = 0

  for (const email of emails) {
    try {
      // Mark as sending
      await supabase
        .from("email_queue")
        .update({ status: "sending", attempts: email.attempts + 1 })
        .eq("id", email.id)

      // Parse data
      const emailData = JSON.parse(email.html_content)

      // Send based on type
      let result

      switch (emailData.type) {
        case "single_ticket":
          result = await sendTicketConfirmationEmail({
            email: email.to_email,
            name: email.to_name,
            ...emailData.data,
          })
          break
        case "multiple_tickets":
          result = await sendMultipleTicketsConfirmationEmail({
            email: email.to_email,
            name: email.to_name,
            ...emailData.data,
          })
          break
        case "payment_rejected":
          result = await sendPaymentRejectedEmail({
            email: email.to_email,
            name: email.to_name,
            ...emailData.data,
          })
          break
        case "pending_payment":
          result = await sendPurchasePendingEmail({
            email: email.to_email,
            name: email.to_name,
            raffleName: emailData.data.raffleName,
            ticketCount: emailData.data.ticketCount,
            totalAmount: emailData.data.totalAmount,
            ticketNumbers: emailData.data.ticketNumbers || [],
          })
          break
        case "order_received":
          result = await sendOrderReceivedEmail({
            email: email.to_email,
            name: email.to_name,
            raffleName: emailData.data.raffleName,
            ticketCount: emailData.data.ticketCount,
            totalAmount: emailData.data.totalAmount,
            bankReference: emailData.data.referenceNumber || emailData.data.bankReference,
          })
          break
      }

      if (result?.success) {
        // Mark as sent
        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", email.id)
        processed++
      } else {
        // Mark as failed if max attempts reached
        if (email.attempts + 1 >= email.max_attempts) {
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: result?.error || "Unknown error",
            })
            .eq("id", email.id)
        } else {
          // Reset to pending for retry
          await supabase
            .from("email_queue")
            .update({
              status: "pending",
              error_message: result?.error || "Unknown error",
              scheduled_for: new Date(Date.now() + 60000).toISOString(), // Retry in 1 minute
            })
            .eq("id", email.id)
        }
      }

      // Rate limit: wait 2 seconds between emails
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error: any) {
      console.error("[v0] Error processing email:", email.id, error)

      // Mark as failed if max attempts
      if (email.attempts + 1 >= email.max_attempts) {
        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", email.id)
      } else {
        await supabase
          .from("email_queue")
          .update({
            status: "pending",
            error_message: error.message,
            scheduled_for: new Date(Date.now() + 60000).toISOString(),
          })
          .eq("id", email.id)
      }
    }
  }

  return { processed }
}
