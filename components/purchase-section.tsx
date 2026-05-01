"use client";

import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { createBankTransferTickets } from "@/app/actions/bank-transfer";
import { getBankAccounts } from "@/app/actions/payments";
import {
  Minus,
  Plus,
  Upload,
  CheckCircle2,
  Copy,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { swal } from "@/lib/swal";

const GOLD = "#ffffff";
const MIN_TICKETS = 1;

const BANK_LOGOS: Record<string, string> = {
  banreservas:
    "https://rifarito.s3.amazonaws.com/uploads/bank/logo/44/Banreservas_logocc.png",
  popular:
    "https://rifarito.s3.amazonaws.com/uploads/bank/logo/65/banco-popular-dominicano-logocc.png",
  bhd: "https://play-lh.googleusercontent.com/JAOE-AgdNZScrMi5p8h37BpAqE_0LABed6tydcpsAazCdScUTkFPdD9YIubmmwaP8Q=w240-h480-rw",
};

function resolveBankLogo(bankName: string, existing?: string): string {
  if (existing) return existing;
  const lower = bankName.toLowerCase();
  for (const [key, url] of Object.entries(BANK_LOGOS)) {
    if (lower.includes(key)) return url;
  }
  return "";
}

interface PurchaseSectionProps {
  raffleId: string;
  userId?: string;
  ticketPrice: number;
  ticketsRemaining: number;
  minTickets?: number;
  sizeOptions?: string | string[] | null;
  raffleName?: string;
}

export function PurchaseSection({
  raffleId,
  userId,
  ticketPrice,
  ticketsRemaining,
  raffleName = "",
}: PurchaseSectionProps) {
  const router = useRouter();

  const [ticketCount, setTicketCount] = useState(MIN_TICKETS);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeBankId, setActiveBankId] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [termsAccepted, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = ticketPrice * ticketCount;

  useEffect(() => {
    setLoadingBanks(true);
    setBanksError(null);
    getBankAccounts()
      .then((accounts) => {
        const list = accounts || [];
        setBankAccounts(list);
        if (list.length > 0) setActiveBankId(list[0].id);
      })
      .catch((err) => {
        console.error("[v0] Error loading bank accounts:", err);
        setBanksError("No se pudieron cargar las cuentas bancarias.");
      })
      .finally(() => setLoadingBanks(false));
  }, []);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      swal.error("Archivo inválido", "Solo se aceptan imágenes");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      swal.error("Archivo muy grande", "Máximo 10MB");
      return;
    }
    setScreenshot(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((e) => ({ ...e, screenshot: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Requerido";
    if (!lastName.trim()) e.lastName = "Requerido";
    if (!email.trim() || !email.includes("@")) e.email = "Correo inválido";
    if (!phone.trim()) e.phone = "Requerido";
    if (!screenshot) e.screenshot = "Adjunta el comprobante de pago";
    if (!termsAccepted) e.terms = "Debes aceptar los términos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    let screenshotUrl: string;
    try {
      const ext = screenshot!.name.split(".").pop() || "png";
      const filename = `transfers/transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const blob = await upload(filename, screenshot!, {
        access: "private",
        handleUploadUrl: "/api/upload",
        contentType: screenshot!.type,
      });
      screenshotUrl = blob.url;
    } catch (err: any) {
      console.error("[v0] Error uploading screenshot:", err);
      setSubmitting(false);
      swal.error(
        "No se pudo subir el comprobante",
        err?.message || "Verifica tu conexión e intenta nuevamente",
      );
      return;
    }

    try {
      const result = await createBankTransferTickets({
        raffleId,
        ticketCount,
        guestName: `${firstName.trim()} ${lastName.trim()}`,
        guestEmail: email.trim(),
        guestPhone: phone.trim(),
        screenshotUrl,
      });

      if (result.success) {
        const nums = (result.tickets || [])
          .map((t: any) => `#${String(t.ticket_number).padStart(4, "0")}`)
          .join(", ");

        if (previewUrl) {
          try {
            URL.revokeObjectURL(previewUrl);
          } catch {}
        }

        flushSync(() => {
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setScreenshot(null);
          setPreviewUrl(null);
          setTerms(false);
          setErrors({});
          setTicketCount(MIN_TICKETS);
          setSubmitting(false);
        });
        if (fileRef.current) fileRef.current.value = "";

        const titleMsg = nums
          ? `${ticketCount} boleto${ticketCount !== 1 ? "s" : ""} registrado${ticketCount !== 1 ? "s" : ""}: ${nums}`
          : `${ticketCount} boleto${ticketCount !== 1 ? "s" : ""} registrado${ticketCount !== 1 ? "s" : ""}`;

        await swal.success(
          titleMsg,
          "Tu comprobante está pendiente de verificación. Te notificaremos por email.",
        );
      }
    } catch (err: any) {
      console.error("[v0] Error registering tickets:", err);
      swal.error(
        "No se pudo registrar la compra",
        err?.message || "Intenta nuevamente en unos segundos",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full h-11 px-3 bg-transparent border text-white text-sm placeholder:text-neutral-700 outline-none transition-colors ${
      errors[field]
        ? "border-red-500/60"
        : "border-white/10 focus:border-[#ffffff]/50"
    }`;

  return (
    <div className="space-y-8">
      {/* ── Step 1: Quantity ── */}
      <div>
        <p className="text-xs tracking-widest uppercase text-neutral-500 mb-4">
          Cantidad de boletos
        </p>
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => setTicketCount((c) => Math.max(MIN_TICKETS, c - 1))}
            disabled={ticketCount <= MIN_TICKETS}
            className="w-10 h-10 border flex items-center justify-center disabled:opacity-30 transition-all hover:border-white/30"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={ticketCount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "")
              if (raw === "") {
                setTicketCount(MIN_TICKETS)
                return
              }
              const n = Number.parseInt(raw, 10)
              if (Number.isNaN(n)) return
              setTicketCount(
                Math.max(MIN_TICKETS, Math.min(ticketsRemaining, n)),
              )
            }}
            onBlur={(e) => {
              const n = Number.parseInt(e.target.value, 10)
              if (Number.isNaN(n) || n < MIN_TICKETS) setTicketCount(MIN_TICKETS)
            }}
            aria-label="Cantidad de boletos"
            className="text-4xl font-black text-white w-20 text-center tabular-nums bg-transparent border-0 outline-none focus:bg-white/5 transition-colors p-0"
          />
          <button
            onClick={() =>
              setTicketCount((c) => Math.min(ticketsRemaining, c + 1))
            }
            disabled={ticketCount >= ticketsRemaining}
            className="w-10 h-10 border flex items-center justify-center disabled:opacity-30 transition-all hover:border-white/30"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
          <div className="flex gap-1.5 ml-1 flex-wrap">
            {[1, 5, 10, 20, 50]
              .filter((n) => n <= ticketsRemaining)
              .map((n) => (
                <button
                  key={n}
                  onClick={() => setTicketCount(Math.min(n, ticketsRemaining))}
                  className="px-2.5 py-1 text-xs border transition-all"
                  style={{
                    borderColor:
                      ticketCount === n ? GOLD : "rgba(255,255,255,0.1)",
                    color: ticketCount === n ? GOLD : "rgba(255,255,255,0.35)",
                    backgroundColor:
                      ticketCount === n ? `${GOLD}10` : "transparent",
                  }}
                >
                  {n}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* ── Step 2: Banks ── */}
      <div>
        <p className="text-xs tracking-widest uppercase text-neutral-500 mb-4">
          Bancos disponibles
        </p>
        {loadingBanks ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : bankAccounts.length === 0 ? (
          <p className="text-neutral-600 text-sm">Sin cuentas configuradas</p>
        ) : (
          <div className="space-y-2">
            {bankAccounts.map((acc) => {
              const logo = resolveBankLogo(acc.bank_name, acc.bank_logo);
              const isActive = activeBankId === acc.id;
              return (
                <button
                  type="button"
                  key={acc.id}
                  onClick={() => setActiveBankId(acc.id)}
                  aria-pressed={isActive}
                  className="w-full text-left border p-4 transition-all"
                  style={{
                    borderColor: isActive ? GOLD : "rgba(255,255,255,0.07)",
                    backgroundColor: isActive ? `${GOLD}08` : "transparent",
                    opacity: isActive ? 1 : 0.45,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {logo ? (
                      <div className="w-10 h-10 bg-white flex items-center justify-center p-1.5 shrink-0">
                        <img
                          src={logo}
                          alt={acc.bank_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : null}
                    <span className="text-white font-bold text-sm flex-1">
                      {acc.bank_name}
                    </span>
                    <span
                      className="text-[10px] tracking-widest uppercase shrink-0"
                      style={{ color: isActive ? GOLD : "rgba(255,255,255,0.35)" }}
                    >
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {[
                      {
                        label: "Titular",
                        value: acc.account_holder,
                        key: `h-${acc.id}`,
                        copyable: false,
                      },
                      {
                        label: "Cuenta",
                        value: acc.account_number,
                        key: `n-${acc.id}`,
                        copyable: true,
                      },
                      acc.account_type && {
                        label: "Tipo",
                        value: acc.account_type,
                        key: `t-${acc.id}`,
                        copyable: false,
                      },
                    ]
                      .filter(Boolean)
                      .map((row: any) => (
                        <div
                          key={row.key}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-neutral-600 shrink-0">
                            {row.label}:
                          </span>
                          <span className="text-white font-mono flex-1 text-right truncate">
                            {row.value}
                          </span>
                          {row.copyable ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBankId(acc.id);
                                copyText(row.value, row.key);
                              }}
                              className="shrink-0 w-6 h-6 flex items-center justify-center transition-opacity hover:opacity-70"
                            >
                              {copied === row.key ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                              )}
                            </button>
                          ) : (
                            <span className="shrink-0 w-6 h-6" />
                          )}
                        </div>
                      ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Step 3: Personal info ── */}
      <div>
        <p className="text-xs tracking-widest uppercase text-neutral-500 mb-4">
          Tus datos
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <input
              className={inputCls("firstName")}
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrors((v) => ({ ...v, firstName: "" }));
              }}
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              className={inputCls("lastName")}
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setErrors((v) => ({ ...v, lastName: "" }));
              }}
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <input
              type="email"
              className={inputCls("email")}
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((v) => ({ ...v, email: "" }));
              }}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <input
              type="tel"
              className={inputCls("phone")}
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((v) => ({ ...v, phone: "" }));
              }}
            />
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Total ── */}
      <div className="border-t border-b border-white/5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-neutral-600">
              Total a pagar
            </p>
            <p className="text-xs text-neutral-700 mt-0.5">
              {ticketCount} boleto{ticketCount !== 1 ? "s" : ""} × $
              {ticketPrice.toFixed(2)}
            </p>
          </div>
          <p className="text-3xl font-black" style={{ color: GOLD }}>
            ${total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ── Promo description (below total) ── */}
      <div className="space-y-5">
        {/* Fun promo text */}
        <div
          className="border p-5 space-y-3 text-sm leading-relaxed"
          style={{ borderColor: `${GOLD}25`, backgroundColor: `${GOLD}06` }}
        >
          <p className="text-white font-semibold">
            😥 ¿Con cuánto puedes ser ganador?
          </p>
          <p className="font-black text-lg" style={{ color: GOLD }}>
            💰 Solo ${ticketPrice.toFixed(0)} pesitos 💰
          </p>
          <div className="h-px bg-white/5" />

          <p className="text-white font-semibold">
            🤔 ¿Cuándo te llevarás el premio para tu casa?
          </p>
          <p className="font-bold" style={{ color: GOLD }}>
            🥳 ¡Desde que completemos el 100%! 🥳
          </p>

          <p className="font-bold text-base" style={{ color: GOLD }}>
            🍀🍀 Buena Suerte 🍀🍀
          </p>
        </div>

        {/* Important notes */}
        <div
          className="border p-5 space-y-2 text-xs leading-relaxed"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p
            className="text-white font-black text-sm tracking-wide uppercase mb-3"
            style={{ color: GOLD }}
          >
            ⚠️ Importante
          </p>
          {[
        
            "Todas las cuentas son corrientes.",
            "Verificamos entre 24 y 48 horas.",
            "Términos y condiciones aplican.",
          ].map((line, i) => (
            <p key={i} className="text-neutral-400 flex gap-2">
              <span style={{ color: GOLD }} className="shrink-0">
                —
              </span>
              {line}
            </p>
          ))}
          <p className="text-white font-bold pt-1" style={{ color: GOLD }}>
            Making Money Style
          </p>
        </div>
      </div>

      {/* ── Upload comprobante ── */}
      <div>
        <p className="text-xs tracking-widest uppercase text-neutral-500 mb-3">
          Comprobante de pago
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Comprobante"
              className="w-full max-h-48 object-contain border border-white/10"
            />
            <button
              onClick={() => {
                setScreenshot(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/80 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors hover:border-[#ffffff]/40 group"
            style={{
              borderColor: errors.screenshot
                ? "#f87171"
                : "rgba(255,255,255,0.1)",
            }}
          >
            <ImageIcon className="w-8 h-8 text-neutral-700 group-hover:text-neutral-500 transition-colors" />
            <div className="text-center">
              <p className="text-white text-sm font-semibold">
                Subir comprobante
              </p>
              <p className="text-neutral-600 text-xs mt-1">
                PNG, JPG — máx. 10MB
              </p>
            </div>
          </button>
        )}
        {errors.screenshot && (
          <p className="text-red-400 text-xs mt-2">{errors.screenshot}</p>
        )}
      </div>

      {/* ── T&C ── */}
      <div>
       <label className="flex items-start gap-3 cursor-pointer group select-none">
          {/* Checkbox Visual - Ahora con borde blanco sólido y más contraste */}
          <div
            className="w-5 h-5 border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200"
            style={{
              // Si hay error es rojo, si está aceptado es Dorado, si no, BLANCO PURO
              borderColor: errors.terms ? "#f87171" : termsAccepted ? GOLD : "#ffffff",
              backgroundColor: termsAccepted ? `${GOLD}30` : "rgba(255,255,255,0.05)",
            }}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={termsAccepted}
              onChange={() => {
                setTerms(!termsAccepted);
                setErrors((v) => ({ ...v, terms: "" }));
              }}
            />
            {termsAccepted && (
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GOLD }} />
            )}
          </div>
        
          {/* Texto Informativo - Cambiado de neutral-500 (gris) a blanco/90 */}
          <span className="text-xs text-white/90 leading-relaxed">
            Acepto los{" "}
            <a
              href="/terms"
              target="_blank"
              className="underline font-medium hover:brightness-125 transition-all"
              style={{ color: GOLD }}
            >
              términos y condiciones
            </a>{" "}
            del sorteo. <span className="text-white/60">Entiendo que el pago quedará pendiente de verificación.</span>
          </span>
        </label>
        {errors.terms && (
          <p className="text-red-400 text-xs mt-2">{errors.terms}</p>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full h-14 font-black text-sm tracking-widest uppercase transition-opacity hover:opacity-85 disabled:opacity-50 flex items-center justify-center gap-3"
        style={{ backgroundColor: GOLD, color: "#000" }}
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
          </>
        ) : (
          <>
            Confirmar {ticketCount} Boleto{ticketCount !== 1 ? "s" : ""} — $
            {total.toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
}
