const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "noreply@news.dinamicapro.com";
const BRAND = "MAKING MONEY STYLE";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://makingmoneystyle.com";

const emailQueue: Map<string, number> = new Map();
const EMAIL_DELAY_MS = 2000;

async function waitForRateLimit(email: string) {
  const now = Date.now();
  const lastSent = emailQueue.get(email) || 0;
  const timeSinceLastEmail = now - lastSent;

  if (timeSinceLastEmail < EMAIL_DELAY_MS) {
    const waitTime = EMAIL_DELAY_MS - timeSinceLastEmail;
    console.log(
      `[v0] Rate limiting: waiting ${waitTime}ms before sending to ${email}`,
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  emailQueue.set(email, Date.now());

  for (const [key, value] of emailQueue.entries()) {
    if (Date.now() - value > 60000) {
      emailQueue.delete(key);
    }
  }
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await waitForRateLimit(to);

  console.log("[v0] sendEmail called - to:", to, "subject:", subject);
  console.log("[v0] RESEND_API_KEY exists:", !!RESEND_API_KEY);

  if (!RESEND_API_KEY) {
    console.log("[v0] RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const payload = {
      from: `${BRAND} <${RESEND_FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("[v0] Resend API response status:", response.status);

    if (!response.ok) {
      console.error("[v0] Email send error:", responseData);
      return {
        success: false,
        error: responseData.message || "Error sending email",
      };
    }

    console.log("[v0] Email sent successfully to:", to, "ID:", responseData.id);
    return { success: true, id: responseData.id };
  } catch (error: any) {
    console.error("[v0] Email error:", error);
    return { success: false, error: error.message };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Design system tokens — black canvas, white primary, brighter grays for
// readable email rendering across clients (Gmail/Outlook compress contrast).
// ────────────────────────────────────────────────────────────────────────────
const T = {
  bg: "#000000",
  surface: "#0a0a0a",
  surfaceElevated: "#1a1a1a",
  border: "rgba(255, 255, 255, 0.20)",
  borderSoft: "rgba(255, 255, 255, 0.12)",
  textPrimary: "#ffffff",
  textSecondary: "#d4d4d4",
  textLabel: "#a8a8a8",
  textMuted: "#8a8a8a",
  textFaint: "#6b6b6b",
  accent: "#ffffff",
  danger: "#f87171",
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace',
};

interface ShellOptions {
  eyebrow: string;
  title: string;
  intro?: string;
  bodyHtml: string;
  preheader?: string;
}

function renderShell({
  eyebrow,
  title,
  intro,
  bodyHtml,
  preheader,
}: ShellOptions): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${T.bg};font-family:${T.font};color:${T.textPrimary};-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.bg};padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:${T.surface};border:1px solid ${T.border};">
          <tr>
            <td style="padding:36px 36px 28px 36px;text-align:center;border-bottom:1px solid ${T.borderSoft};">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <div style="font-size:13px;letter-spacing:0.32em;color:#ffffff;text-transform:uppercase;font-weight:700;">${BRAND}</div>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 0 36px;">
              <div style="font-size:11px;letter-spacing:0.28em;color:${T.textLabel};text-transform:uppercase;font-weight:700;margin-bottom:14px;">${eyebrow}</div>
              <h1 style="margin:0;font-size:26px;line-height:1.25;color:${T.textPrimary};font-weight:800;letter-spacing:-0.01em;">${title}</h1>
              ${intro ? `<p style="margin:18px 0 0 0;font-size:15px;line-height:1.65;color:${T.textSecondary};">${intro}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 40px 36px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px;border-top:1px solid ${T.borderSoft};">
              <div style="font-size:11px;letter-spacing:0.24em;color:${T.textLabel};text-transform:uppercase;font-weight:700;">${BRAND}</div>
              <div style="font-size:12px;color:${T.textMuted};margin-top:6px;line-height:1.6;">Sorteos premium en línea</div>
            </td>
          </tr>
        </table>
        <div style="max-width:560px;margin-top:20px;font-size:11px;color:${T.textMuted};text-align:center;line-height:1.6;letter-spacing:0.04em;">
          Este correo es automático, por favor no respondas.<br>
          © ${new Date().getFullYear()} ${BRAND}. Todos los derechos reservados.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ────────────────────────────────────────────────────────────────────────────
// Reusable building blocks
// ────────────────────────────────────────────────────────────────────────────

function row(label: string, value: string, valueStyle = "") {
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid ${T.borderSoft};font-size:13px;color:${T.textLabel};letter-spacing:0.04em;">${label}</td>
      <td style="padding:14px 0;border-bottom:1px solid ${T.borderSoft};font-size:14px;color:${T.textPrimary};text-align:right;font-weight:600;${valueStyle}">${value}</td>
    </tr>`;
}

function totalRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:18px 0 0 0;font-size:11px;color:${T.textLabel};letter-spacing:0.24em;text-transform:uppercase;font-weight:700;">${label}</td>
      <td style="padding:18px 0 0 0;font-size:24px;color:${T.textPrimary};text-align:right;font-weight:800;letter-spacing:-0.01em;">${value}</td>
    </tr>`;
}

function dataTable(rowsHtml: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rowsHtml}</table>`;
}

function note(text: string, accent: "neutral" | "danger" = "neutral") {
  const borderColor = accent === "danger" ? T.danger : T.textLabel;
  const textColor = accent === "danger" ? T.danger : T.textSecondary;
  return `
    <div style="margin-top:24px;padding:16px 18px;border-left:2px solid ${borderColor};background:${T.surfaceElevated};">
      <p style="margin:0;font-size:13px;line-height:1.6;color:${textColor};">${text}</p>
    </div>`;
}

function hasRealHash(hash?: string) {
  if (!hash) return false;
  const v = String(hash).trim().toUpperCase();
  return v.length > 0 && v !== "N/A" && v !== "NULL" && v !== "UNDEFINED";
}

function ticketBlock(label: string, big: string, small?: string) {
  const hashHtml = hasRealHash(small)
    ? `
      <div style="margin-top:18px;font-size:11px;color:#e5e5e5;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;">Código único</div>
      <div style="margin-top:8px;font-size:18px;color:#ffffff;font-family:${T.font};letter-spacing:0.12em;font-weight:700;">${small}</div>`
    : "";
  return `
    <div style="margin-top:24px;padding:32px 24px;border:2px solid rgba(255,255,255,0.35);background:#262626;text-align:center;">
      <div style="font-size:11px;color:#e5e5e5;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;">${label}</div>
      <div style="margin-top:14px;font-size:42px;color:#ffffff;font-weight:700;font-family:${T.font};letter-spacing:0.04em;line-height:1;">${big}</div>
      ${hashHtml}
    </div>`;
}

function ticketsList(
  tickets: Array<{ ticketNumber: number; ticketHash: string }>,
) {
  return tickets
    .map((t) => {
      const numStr = `#${t.ticketNumber.toString().padStart(4, "0")}`;
      const hashRow = hasRealHash(t.ticketHash)
        ? `<div style="margin-top:8px;font-family:${T.font};font-size:13px;color:#e5e5e5;letter-spacing:0.06em;">Código: <span style="color:#ffffff;font-weight:700;letter-spacing:0.12em;">${t.ticketHash}</span></div>`
        : "";
      return `
        <tr>
          <td style="padding:18px 20px;border:2px solid rgba(255,255,255,0.35);background:#262626;color:#ffffff;">
            <div style="font-family:${T.font};font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.04em;line-height:1;">${numStr}</div>
            ${hashRow}
          </td>
        </tr>
        <tr><td style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>`;
    })
    .join("");
}

function ctaButton(href: string, label: string) {
  return `
    <div style="margin-top:28px;text-align:center;">
      <a href="${href}" style="display:inline-block;padding:14px 28px;background:${T.accent};color:#000000;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;">${label}</a>
    </div>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Email templates
// ────────────────────────────────────────────────────────────────────────────

export async function sendTicketConfirmationEmail({
  email,
  name,
  raffleName,
  ticketNumber,
  ticketHash,
  amount,
}: {
  email: string;
  name: string;
  raffleName: string;
  ticketNumber: number;
  ticketHash: string;
  amount: number;
}) {
  const body = `
    ${ticketBlock("Tu boleto", `#${ticketNumber.toString().padStart(4, "0")}`, ticketHash)}
    <div style="margin-top:24px;color:white;">
      ${dataTable(
        row("Sorteo", raffleName) +
          row("Monto pagado", `$${amount.toFixed(2)}`),
      )}
    </div>
    ${note("Guarda este correo como comprobante oficial de tu participación. Te notificaremos cuando se realice el sorteo.")}
  `;

  const html = renderShell({
    preheader: `Boleto confirmado para ${raffleName}`,
    eyebrow: "Boleto confirmado",
    title: `Hola ${name}, tu participación está activa.`,
    intro:
      "Tu pago fue verificado. Tu boleto ya está registrado para participar en el sorteo.",
    bodyHtml: body,
  });

  return sendEmail({
    to: email,
    subject: `Boleto confirmado — ${raffleName}`,
    html,
  });
}

export async function sendMultipleTicketsConfirmationEmail({
  email,
  name,
  raffleName,
  tickets,
  totalAmount,
}: {
  email: string;
  name: string;
  raffleName: string;
  tickets: Array<{ ticketNumber: number; ticketHash: string }>;
  totalAmount: number;
}) {
  const body = `
    <div style="font-size:11px;color:${T.textLabel};letter-spacing:0.28em;text-transform:uppercase;font-weight:700;margin-bottom:14px;">
      Tus boletos (${tickets.length})
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${ticketsList(tickets)}
    </table>
    <div style="margin-top:24px;">
      ${dataTable(
        row("Sorteo", raffleName) +
          totalRow("Total pagado", `$${totalAmount.toFixed(2)}`),
      )}
    </div>
    ${note("Guarda este correo como comprobante oficial. Cuantos más boletos, más oportunidades de ganar.")}
  `;

  const html = renderShell({
    preheader: `${tickets.length} boletos confirmados para ${raffleName}`,
    eyebrow: `${tickets.length} boletos confirmados`,
    title: `Hola ${name}, tus boletos están activos.`,
    intro:
      "Todos tus boletos fueron confirmados y ya están registrados para participar en el sorteo.",
    bodyHtml: body,
  });

  return sendEmail({
    to: email,
    subject: `${tickets.length} boletos confirmados — ${raffleName}`,
    html,
  });
}

export async function sendOrderReceivedEmail({
  email,
  name,
  raffleName,
  ticketCount,
  totalAmount,
  bankReference,
}: {
  email: string;
  name: string;
  raffleName: string;
  ticketCount: number;
  totalAmount: number;
  bankReference: string;
}) {
  const body = `
    <div style="margin-top:0;">
      ${dataTable(
        row("Sorteo", raffleName) +
          row("Boletos", `${ticketCount} boleto${ticketCount > 1 ? "s" : ""}`) +
          row(
            "Referencia bancaria",
            `<span style="font-family:${T.mono};">${bankReference}</span>`,
          ) +
          totalRow("Total a verificar", `$${totalAmount.toFixed(2)}`),
      )}
    </div>
    ${note("Verificaremos tu pago y te enviaremos un correo con los boletos confirmados en un máximo de 24 a 48 horas. Asegúrate de que tu transferencia incluya la referencia bancaria indicada.")}
  `;

  const html = renderShell({
    preheader: `Recibimos tu orden de ${raffleName}`,
    eyebrow: "Orden recibida",
    title: `Hola ${name}, registramos tu orden.`,
    intro:
      "Recibimos tu compra. Una vez verifiquemos la transferencia bancaria, activaremos tus boletos.",
    bodyHtml: body,
  });

  return sendEmail({
    to: email,
    subject: `Orden recibida — ${raffleName}`,
    html,
  });
}

export async function sendPurchasePendingEmail({
  email,
  name,
  raffleName,
  ticketCount,
  totalAmount,
  ticketNumbers = [],
}: {
  email: string;
  name: string;
  raffleName: string;
  ticketCount: number;
  totalAmount: number;
  ticketNumbers?: number[];
}) {
  const ticketsText = ticketNumbers.length
    ? ticketNumbers
        .map((n) => `#${n.toString().padStart(4, "0")}`)
        .join("  ·  ")
    : `${ticketCount} boleto${ticketCount > 1 ? "s" : ""}`;

  const body = `
    <div style="padding:22px;border:1px solid ${T.border};background:${T.surfaceElevated};text-align:center; color:white;">
      <div style="font-size:11px;color:${T.textLabel};letter-spacing:0.28em;text-transform:uppercase;font-weight:700;">Boletos reservados</div>
      <div style="margin-top:10px;font-family:${T.mono};font-size:18px;color:white !important;font-weight:700;letter-spacing:0.04em;">${ticketsText}</div>
    </div>
    <div style="margin-top:24px;">
      ${dataTable(
        row("Sorteo", raffleName) +
          row(
            "Cantidad",
            `${ticketCount} boleto${ticketCount > 1 ? "s" : ""}`,
          ) +
          totalRow("Total", `$${totalAmount.toFixed(2)}`),
      )}
    </div>
    ${note("Verificación en proceso. Te enviaremos un correo cuando el pago sea confirmado y tus boletos queden activos. Tiempo estimado: 24 a 48 horas.")}
  `;

  const html = renderShell({
    preheader: `Pago en verificación para ${raffleName}`,
    eyebrow: "Pago en verificación",
    title: `Hola ${name}, estamos verificando tu pago.`,
    intro:
      "Recibimos tu solicitud y estamos validando la transferencia. Te avisaremos en cuanto se confirme.",
    bodyHtml: body,
  });

  return sendEmail({
    to: email,
    subject: `Pago en verificación — ${raffleName}`,
    html,
  });
}

export async function sendPaymentRejectedEmail({
  email,
  name,
  raffleName,
  ticketCount,
  totalAmount,
  reason,
}: {
  email: string;
  name: string;
  raffleName: string;
  ticketCount: number;
  totalAmount: number;
  reason?: string;
}) {
  const body = `
    <div style="margin-top:0;">
      ${dataTable(
        row("Sorteo", raffleName) +
          row("Boletos", `${ticketCount} boleto${ticketCount > 1 ? "s" : ""}`) +
          row(
            "Estado",
            `<span style="color:${T.danger};text-transform:uppercase;letter-spacing:0.08em;">Rechazado</span>`,
          ) +
          totalRow("Monto", `$${totalAmount.toFixed(2)}`),
      )}
    </div>
    ${reason ? note(`Motivo: ${reason}`, "danger") : ""}
    ${note(
      `Qué puedes hacer:<br>
       — Verificar que los datos de tu transferencia sean correctos.<br>
       — Realizar una nueva compra desde el sitio.<br>
       — Contactarnos si necesitas ayuda.`,
    )}
    ${ctaButton(SITE_URL, "Intentar nuevamente")}
  `;

  const html = renderShell({
    preheader: `No pudimos verificar tu pago de ${raffleName}`,
    eyebrow: "Pago rechazado",
    title: `Hola ${name}, no pudimos verificar tu pago.`,
    intro:
      "Tu compra fue marcada como rechazada porque no logramos validar la transferencia.",
    bodyHtml: body,
  });

  return sendEmail({
    to: email,
    subject: `Pago rechazado — ${raffleName}`,
    html,
  });
}

export async function sendCancellationEmail({
  email,
  name,
  raffleName,
  ticketCount,
  totalAmount,
  reason,
}: {
  email: string;
  name: string;
  raffleName: string;
  ticketCount: number;
  totalAmount: number;
  reason?: string;
}) {
  const body = `
    <div style="margin-top:0;">
      ${dataTable(
        row("Sorteo", raffleName) +
          row("Boletos", `${ticketCount} boleto${ticketCount > 1 ? "s" : ""}`) +
          row(
            "Estado",
            `<span style="color:${T.danger};text-transform:uppercase;letter-spacing:0.08em;">Cancelado</span>`,
          ) +
          totalRow("Monto", `$${totalAmount.toFixed(2)}`),
      )}
    </div>
    ${reason ? note(`Motivo: ${reason}`, "danger") : ""}
    ${ctaButton(SITE_URL, "Realizar nueva compra")}
  `;

  const html = renderShell({
    preheader: `Tu compra de ${raffleName} fue cancelada`,
    eyebrow: "Compra cancelada",
    title: `Hola ${name}, tu compra fue cancelada.`,
    intro: "Lamentamos informarte que tu compra ha sido cancelada.",
    bodyHtml: body,
  });

  return sendEmail({
    to: email,
    subject: `Compra cancelada — ${raffleName}`,
    html,
  });
}

export async function sendWinnerNotificationEmail({
  email,
  name,
  raffleName,
  ticketNumber,
  ticketCode,
  prizeImageUrl,
}: {
  email: string;
  name: string;
  raffleName: string;
  ticketNumber: string;
  ticketCode: string;
  prizeImageUrl?: string;
}) {
  const image = prizeImageUrl
    ? `<div style="margin-top:0;margin-bottom:24px;">
         <img src="${prizeImageUrl}" alt="${raffleName}" style="width:100%;height:auto;display:block;border:1px solid ${T.borderSoft};" />
       </div>`
    : "";

  const body = `
    ${image}
    ${ticketBlock("Boleto ganador", `#${ticketNumber.toString().padStart(4, "0")}`, ticketCode)}
    <div style="margin-top:24px;">
      ${dataTable(row("Sorteo", raffleName))}
    </div>
    ${note("Nos pondremos en contacto contigo en breve para coordinar la entrega de tu premio. Guarda este correo como comprobante oficial.")}
  `;

  const html = renderShell({
    preheader: `Eres el ganador del sorteo ${raffleName}`,
    eyebrow: "Ganador",
    title: `${name}, ganaste el sorteo.`,
    intro: "Tu boleto ha sido seleccionado como el ganador. Felicidades.",
    bodyHtml: body,
  });

  return sendEmail({
    to: email,
    subject: `Eres el ganador — ${raffleName}`,
    html,
  });
}
