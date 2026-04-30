const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "8701009135:AAFxkKLIwEqK2Z-INfgI6bCA0mbLfvfb_pQ"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7801026001"

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("[v0] Telegram credentials missing, skipping notification")
    return false
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error("[v0] Telegram sendMessage failed:", res.status, detail)
      return false
    }

    return true
  } catch (err: any) {
    console.error("[v0] Telegram sendMessage error:", err?.message || err)
    return false
  }
}

async function fetchImageBytes(
  photoUrl: string,
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  // Private blobs (transfers/) require the private token via Vercel Blob SDK
  if (/\/transfers\//.test(photoUrl)) {
    const token = process.env.BLOB_READ_WRITE_TOKEN_PRIVATE
    if (!token) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN_PRIVATE missing, cannot fetch private blob")
      return null
    }
    try {
      const { get } = await import("@vercel/blob")
      const result = await get(photoUrl, { access: "private", token })
      if (!result?.stream) return null
      const reader = result.stream.getReader()
      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) chunks.push(value)
      }
      const total = chunks.reduce((n, c) => n + c.byteLength, 0)
      const buffer = new Uint8Array(total)
      let offset = 0
      for (const c of chunks) { buffer.set(c, offset); offset += c.byteLength }
      return { buffer: buffer.buffer, contentType: result.blob.contentType || "image/png" }
    } catch (e: any) {
      console.error("[v0] fetchImageBytes private blob error:", e?.message ?? e)
      return null
    }
  }

  // Public URL — fetch directly
  try {
    const res = await fetch(photoUrl)
    if (!res.ok) return null
    return { buffer: await res.arrayBuffer(), contentType: res.headers.get("content-type") || "image/png" }
  } catch (e: any) {
    console.error("[v0] fetchImageBytes public url error:", e?.message ?? e)
    return null
  }
}

export async function sendTelegramPhoto(photoUrl: string, caption: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("[v0] Telegram credentials missing, skipping notification")
    return false
  }

  // Telegram caption limit is 1024 chars
  const safeCaption = caption.length > 1024 ? caption.slice(0, 1021) + "…" : caption

  try {
    const image = await fetchImageBytes(photoUrl)
    if (!image) {
      console.error("[v0] Could not fetch image bytes, falling back to text message")
      return sendTelegramMessage(caption)
    }

    const ext = image.contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
    const form = new FormData()
    form.append("chat_id", TELEGRAM_CHAT_ID)
    form.append("caption", safeCaption)
    form.append("parse_mode", "HTML")
    form.append("photo", new Blob([image.buffer], { type: image.contentType }), `comprobante.${ext}`)

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: form,
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error("[v0] Telegram sendPhoto failed:", res.status, detail)
      return sendTelegramMessage(caption)
    }

    return true
  } catch (err: any) {
    console.error("[v0] Telegram sendPhoto error:", err?.message || err)
    return sendTelegramMessage(caption)
  }
}

const escapeHtml = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

const fmt = (n: number) =>
  new Intl.NumberFormat("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export async function notifyPurchaseTelegram(params: {
  raffleName: string
  buyerName?: string | null
  buyerEmail?: string | null
  buyerPhone?: string | null
  ticketCount: number
  totalAmount?: number | null
  paymentMethod: string
  paymentStatus: "pending" | "completed" | "failed"
  ticketNumbers?: (number | string)[]
  bankReference?: string | null
  screenshotUrl?: string | null
}): Promise<boolean> {
  const statusLabel =
    params.paymentStatus === "completed"
      ? "✅ Aprobado"
      : params.paymentStatus === "pending"
      ? "⏳ Pendiente de verificación"
      : "❌ Fallido"

  const methodLabel =
    {
      bank_transfer: "Transferencia bancaria",
      card: "Tarjeta (Stripe)",
      stripe: "Tarjeta (Stripe)",
      paypal: "PayPal",
      crypto: "Cripto (NowPayments)",
    }[params.paymentMethod] || params.paymentMethod

  const lines: string[] = []
  lines.push("🎟️ <b>Nueva compra</b>")
  lines.push("")
  lines.push(`<b>Sorteo:</b> ${escapeHtml(params.raffleName)}`)
  lines.push(`<b>Estado:</b> ${statusLabel}`)
  lines.push(`<b>Método:</b> ${escapeHtml(methodLabel)}`)
  lines.push(`<b>Boletos:</b> ${params.ticketCount}`)
  if (params.totalAmount != null) {
    lines.push(`<b>Total:</b> RD$ ${fmt(params.totalAmount)}`)
  }
  if (params.buyerName) lines.push(`<b>Nombre:</b> ${escapeHtml(params.buyerName)}`)
  if (params.buyerEmail) lines.push(`<b>Correo:</b> ${escapeHtml(params.buyerEmail)}`)
  if (params.buyerPhone) lines.push(`<b>Teléfono:</b> ${escapeHtml(params.buyerPhone)}`)
  if (params.bankReference) lines.push(`<b>Referencia:</b> ${escapeHtml(params.bankReference)}`)
  if (params.ticketNumbers && params.ticketNumbers.length > 0) {
    const preview = params.ticketNumbers.slice(0, 20).map((n) => `#${n}`).join(", ")
    const more = params.ticketNumbers.length > 20 ? ` … (+${params.ticketNumbers.length - 20})` : ""
    lines.push(`<b>Números:</b> ${preview}${more}`)
  }

  const text = lines.join("\n")

  if (params.screenshotUrl) {
    return sendTelegramPhoto(params.screenshotUrl, text)
  }

  return sendTelegramMessage(text)
}
