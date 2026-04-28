"use client";

import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBankTransferTickets } from "@/app/actions/bank-transfer";
import { getBankAccounts } from "@/app/actions/payments";
import { verifyTicketsByEmail } from "@/app/actions/verify-tickets";
import { upload } from "@vercel/blob/client";
import {
  ArrowLeft,
  Minus,
  Plus,
  Copy,
  CheckCircle2,
  ImageIcon,
  X,
  Loader2,
  Search,
  Trophy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { swal } from "@/lib/swal";
import { RaffleCard } from "@/components/raffle-card";

const GOLD = "#ffffff";
const MIN = 1;

const PAYPAL_URL = "https://www.paypal.com/paypalme/makingmoneystyle";

const KNOWN_BANKS = [
  {
    key: "banreservas",
    name: "Banreservas",
    logo: "https://rifarito.s3.amazonaws.com/uploads/bank/logo/44/Banreservas_logocc.png",
  },
  {
    key: "banreservas-usd",
    name: "Banreservas",
    logo: "https://rifarito.s3.amazonaws.com/uploads/bank/logo/44/Banreservas_logocc.png",
    badge: "USD",
    label: "Cuenta en Dólares",
    staticAccount: {
      account_number: "9606997933",
      account_type: "Cuenta Corriente",
    },
  },
  {
    key: "popular",
    name: "Banco Popular",
    logo: "https://rifarito.s3.amazonaws.com/uploads/bank/logo/65/banco-popular-dominicano-logocc.png",
  },
  {
    key: "bhd",
    name: "Banco BHD",
    logo: "https://play-lh.googleusercontent.com/JAOE-AgdNZScrMi5p8h37BpAqE_0LABed6tydcpsAazCdScUTkFPdD9YIubmmwaP8Q=w240-h480-rw",
  },
  {
    key: "paypal",
    name: "PayPal",
    logo: "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg",
    badge: "USD",
    label: "PayPal",
    isPaypal: true,
    paypalUrl: PAYPAL_URL,
    staticAccount: {
      account_number: "makingmoneystyle",
      account_type: "PayPal.me",
    },
  },
];

interface Raffle {
  id: string;
  title: string;
  image_url: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  pending_count?: number;
  description?: string;
  status: string;
}

export function RafflePurchaseClient({
  raffle,
  userId,
  otherRaffles = [],
}: {
  raffle: Raffle;
  userId?: string;
  otherRaffles?: any[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const reserved = raffle.tickets_sold + (raffle.pending_count || 0);
  const ticketsRemaining = Math.max(0, raffle.total_tickets - reserved);
  const progress = (raffle.tickets_sold / raffle.total_tickets) * 100;
  const isSoldOut = ticketsRemaining === 0;

  // Form state
  const [count, setCount] = useState(MIN);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeBankKey, setActiveBankKey] = useState<string | null>(null);

  // Banks
  const [dbAccounts, setDbAccounts] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Verify section
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResults, setVerifyResults] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");

  const total = raffle.ticket_price * count;

  useEffect(() => {
    getBankAccounts()
      .then(setDbAccounts)
      .finally(() => setLoadingBanks(false));
  }, []);

  // Map DB account to known bank by name (static entries skip DB lookup)
  const mergedBanks = KNOWN_BANKS.map((kb) => {
    if ("staticAccount" in kb) return { ...kb, account: kb.staticAccount };
    const match = dbAccounts.find(
      (a) =>
        a.bank_name?.toLowerCase().includes(kb.key) ||
        kb.key.includes(a.bank_name?.toLowerCase().split(" ")[0] ?? "___"),
    );
    return { ...kb, account: match ?? null };
  });

  useEffect(() => {
    if (activeBankKey) return;
    const firstAvailable = mergedBanks.find((b) => b.account);
    if (firstAvailable) setActiveBankKey(firstAvailable.key);
  }, [mergedBanks, activeBankKey]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      swal.error("Archivo inválido", "Solo imágenes");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      swal.error("Muy grande", "Máximo 10MB");
      return;
    }
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
    setErrors((e) => ({ ...e, screenshot: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Requerido";
    if (!lastName.trim()) e.lastName = "Requerido";
    if (!email.trim() || !email.includes("@")) e.email = "Correo inválido";
    if (!phone.trim()) e.phone = "Requerido";
    if (!screenshot) e.screenshot = "Adjunta el comprobante";
    if (!terms) e.terms = "Acepta los términos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const ext = screenshot!.name.split(".").pop() || "png";
      const filename = `transfers/transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const blob = await upload(filename, screenshot!, {
        access: "private",
        handleUploadUrl: "/api/upload",
        contentType: screenshot!.type,
      });
      const screenshotUrl = blob.url;
      const result = await createBankTransferTickets({
        raffleId: raffle.id,
        ticketCount: count,
        guestName: `${firstName.trim()} ${lastName.trim()}`,
        guestEmail: email.trim(),
        guestPhone: phone.trim(),
        screenshotUrl,
      });
      if (result.success) {
        const nums = (result.tickets || [])
          .map((t: any) => `#${String(t.ticket_number).padStart(4, "0")}`)
          .join(", ");
        const notified = result.notifiedEmail || email.trim();
        const emailMsg = result.emailSent
          ? `Hemos enviado un correo de confirmación a ${notified}.`
          : `Recibirás un correo de confirmación en ${notified} apenas se procese.`;
        const submittedCount = count;

        if (preview) {
          try {
            URL.revokeObjectURL(preview);
          } catch {}
        }

        flushSync(() => {
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setScreenshot(null);
          setPreview(null);
          setTerms(false);
          setErrors({});
          setCount(MIN);
          setSubmitting(false);
        });
        if (fileRef.current) fileRef.current.value = "";

        const titleMsg = nums
          ? `${submittedCount} boleto${submittedCount !== 1 ? "s" : ""} registrado${submittedCount !== 1 ? "s" : ""}: ${nums}`
          : `${submittedCount} boleto${submittedCount !== 1 ? "s" : ""} registrado${submittedCount !== 1 ? "s" : ""}`;

        await swal.success(titleMsg, `Pendiente de verificación. ${emailMsg}`);
      }
    } catch (err: any) {
      swal.error("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmail.includes("@")) {
      setVerifyError("Correo inválido");
      return;
    }
    setVerifyError("");
    setVerifyLoading(true);
    try {
      const r = await verifyTicketsByEmail(verifyEmail.toLowerCase().trim());
      if (!r.success) {
        setVerifyError(r.error || "Error");
        setVerifyResults(null);
      } else setVerifyResults(r);
    } catch {
      setVerifyError("Error inesperado");
    } finally {
      setVerifyLoading(false);
    }
  };

  const inp = (field: string) =>
    `w-full h-11 px-3 bg-[#0d0d0d] border text-white text-sm placeholder:text-neutral-700 outline-none transition-colors ${
      errors[field]
        ? "border-red-500/60"
        : "border-white/10 focus:border-[#ffffff]/50"
    }`;

  const sectionLabel = (text: string) => (
    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-500 mb-4">
      {text}
    </p>
  );

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="container mx-auto max-w-5xl px-5 sm:px-8 py-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-white transition-colors text-xs mb-8 group tracking-widest uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Volver
        </Link>

        {/* ════════════════════════════════════
            TOP ROW: Image (left) + Info (right)
            Same height — imagen fills left col
            ════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* LEFT — Image */}
          <div className="overflow-hidden" style={{ minHeight: 380 }}>
            <img
              src={raffle.image_url || "/placeholder.svg"}
              alt={raffle.title}
              className="w-full h-full object-cover"
              style={{ minHeight: 380 }}
            />
          </div>

          {/* RIGHT — Title / Progress / Price / Qty / Importante */}
          <div className="flex flex-col gap-4">
            {/* Title + progress */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight mb-3">
                {raffle.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-white/8 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: GOLD }}
                  />
                </div>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: GOLD }}
                >
                  {raffle.tickets_sold}
                </span>
              </div>
              <p className="text-neutral-700 text-xs mt-1">
                {raffle.tickets_sold} / {raffle.total_tickets} boletos
              </p>
            </div>

            {/* Price */}
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs tracking-widest uppercase text-neutral-600 mb-1">
                Precio
              </p>
              <p className="text-3xl font-black text-white">
                ${raffle.ticket_price.toFixed(2)}
              </p>
              <p className="text-neutral-600 text-xs mt-0.5">por boleto</p>
            </div>

            {/* Quantity */}
            {!isSoldOut && (
              <div className="border-t border-white/5 pt-4">
                <p className="text-xs tracking-widest uppercase text-neutral-600 mb-3">
                  Cantidad
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => setCount((c) => Math.max(MIN, c - 1))}
                    disabled={count <= MIN}
                    className="w-9 h-9 border flex items-center justify-center disabled:opacity-30 hover:border-white/30 transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.12)" }}
                  >
                    <Minus className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={count}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "")
                      if (raw === "") {
                        setCount(MIN)
                        return
                      }
                      const n = Number.parseInt(raw, 10)
                      if (Number.isNaN(n)) return
                      setCount(Math.max(MIN, Math.min(ticketsRemaining, n)))
                    }}
                    onBlur={(e) => {
                      const n = Number.parseInt(e.target.value, 10)
                      if (Number.isNaN(n) || n < MIN) setCount(MIN)
                    }}
                    aria-label="Cantidad de boletos"
                    className="text-3xl font-black text-white w-16 text-center tabular-nums bg-transparent border-0 outline-none focus:bg-white/5 transition-colors p-0"
                  />
                  <button
                    onClick={() =>
                      setCount((c) => Math.min(ticketsRemaining, c + 1))
                    }
                    disabled={count >= ticketsRemaining}
                    className="w-9 h-9 border flex items-center justify-center disabled:opacity-30 hover:border-white/30 transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.12)" }}
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                  <div className="flex gap-1 ml-1 flex-wrap">
                    {[1, 5, 10, 20, 50]
                      .filter((n) => n <= ticketsRemaining)
                      .map((n) => (
                        <button
                          key={n}
                          onClick={() => setCount(n)}
                          className="px-2 py-1 text-xs border transition-all"
                          style={{
                            borderColor:
                              count === n ? GOLD : "rgba(255,255,255,0.1)",
                            color: count === n ? GOLD : "rgba(255,255,255,0.3)",
                            backgroundColor:
                              count === n ? `${GOLD}12` : "transparent",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Importante box — fills remaining height */}
            <div
              className="flex-1 border p-5 space-y-3 overflow-y-auto"
              style={{
                borderColor: `${GOLD}30`,
                backgroundColor: `${GOLD}07`,
                minHeight: 180,
              }}
            >
              <p
                className="text-xs font-black tracking-widest uppercase"
                style={{ color: GOLD }}
              >
                ⚠️ Importante
              </p>

              {/* Promo */}
              <div className="space-y-1.5 text-sm">
                <p className="text-white font-semibold text-xs">
                  😥 ¿Con cuánto puedes ganar?
                </p>
                <p className="font-black" style={{ color: GOLD }}>
                  💰 Solo ${raffle.ticket_price.toFixed(0)} pesitos 💰
                </p>
                <p className="text-neutral-600 text-xs">
                  (Compra mínima de {MIN} boletos)
                </p>
                <p className="text-white font-semibold text-xs pt-1">
                  🤔 ¿Cuándo recibirás el premio?
                </p>
                <p className="font-bold text-xs" style={{ color: GOLD }}>
                  🥳 ¡Cuando completemos el 100%! 🥳
                </p>
                <p className="font-bold text-sm" style={{ color: GOLD }}>
                  🍀🍀 Buena Suerte 🍀🍀
                </p>
              </div>

              <div className="h-px bg-white/5" />

              {/* Important notes */}
              <div className="space-y-1.5 text-xs text-neutral-500">
                {[  
                  "Todas las cuentas son corrientes.",
                  "Verificamos entre 24 y 48 horas.",
                  "Términos y condiciones aplican.",
                ].map((line, i) => (
                  <p key={i} className="flex gap-1.5">
                    <span style={{ color: GOLD }} className="shrink-0">
                      —
                    </span>
                    {line}
                  </p>
                ))}
                <p className="font-bold pt-1" style={{ color: GOLD }}>
                  Making Money Style
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════
            FULL-WIDTH SECTIONS BELOW
            ════════════════════════════════════ */}

        {isSoldOut ? (
          <div className="border border-white/10 p-10 text-center mb-8">
            <p className="text-neutral-400 font-bold">Sorteo agotado</p>
            <p className="text-neutral-600 text-xs mt-1">
              Todos los boletos han sido vendidos
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tus Datos */}
            <div>
              {sectionLabel("Tus Datos")}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={inp("firstName")}
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setErrors((v) => ({ ...v, firstName: "" }));
                    }}
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    className={inp("lastName")}
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setErrors((v) => ({ ...v, lastName: "" }));
                    }}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    className={inp("email")}
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
                    className={inp("phone")}
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

            {/* Bancos disponibles */}
            <div>
              {sectionLabel("Bancos disponibles")}
              {loadingBanks ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-neutral-900 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* Mobile: horizontal strip + details panel */}
                  <div className="sm:hidden">
                    <div className="flex gap-2.5 overflow-x-auto pt-3 pb-2 px-1 snap-x snap-mandatory">
                      {mergedBanks.map((bank) => {
                        const isSelectable = !!bank.account;
                        const isActive =
                          isSelectable && activeBankKey === bank.key;
                        return (
                          <button
                            type="button"
                            key={bank.key}
                            onClick={() =>
                              isSelectable && setActiveBankKey(bank.key)
                            }
                            disabled={!isSelectable}
                            aria-pressed={isActive}
                            className="relative shrink-0 snap-start h-14 w-20 transition-all"
                            style={{
                              opacity: !isSelectable
                                ? 0.3
                                : isActive
                                  ? 1
                                  : 0.5,
                              cursor: isSelectable ? "pointer" : "not-allowed",
                            }}
                          >
                            <div
                              className="bg-white h-full w-full flex items-center justify-center px-2 border rounded-xl overflow-hidden"
                              style={{
                                borderColor: isActive
                                  ? GOLD
                                  : "rgba(255,255,255,0.08)",
                              }}
                            >
                              <img
                                src={bank.logo}
                                alt={bank.name}
                                className="h-8 w-auto object-contain"
                              />
                            </div>
                            {"badge" in bank && (
                              <span
                                className="absolute -top-2 -right-2 text-[9px] font-black px-1.5 py-0.5 tracking-widest rounded-md shadow-md ring-1 ring-black/40"
                                style={{
                                  backgroundColor: "#22c55e",
                                  color: "#000",
                                }}
                              >
                                {bank.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      const bank = mergedBanks.find(
                        (b) => b.key === activeBankKey,
                      );
                      if (!bank || !bank.account) return null;
                      const isPaypal = "isPaypal" in bank && bank.isPaypal;
                      const rows = [
                        bank.account.account_holder && {
                          label: "Titular",
                          value: bank.account.account_holder as string,
                          key: `mh-${bank.key}`,
                          copyable: false,
                        },
                        bank.account.account_type && {
                          label: "Tipo de cuenta",
                          value: bank.account.account_type as string,
                          key: `mt-${bank.key}`,
                          copyable: false,
                        },
                        {
                          label: isPaypal ? "Usuario" : "Número de cuenta",
                          value: bank.account.account_number as string,
                          key: `mn-${bank.key}`,
                          copyable: true,
                        },
                      ].filter(Boolean) as {
                        label: string;
                        value: string;
                        key: string;
                        copyable: boolean;
                      }[];

                      return (
                        <div
                          className="mt-3 border p-4 space-y-3"
                          style={{
                            borderColor: `${GOLD}30`,
                            backgroundColor: "#0d0d0d",
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-white text-sm font-bold">
                              {bank.name}
                            </p>
                            {"label" in bank && (
                              <span
                                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0"
                                style={{
                                  backgroundColor: "#22c55e",
                                  color: "#000",
                                }}
                              >
                                {bank.label}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-xs">
                            {rows.map((row) => (
                              <div
                                key={row.key}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="text-neutral-600 shrink-0 uppercase tracking-wider text-[10px]">
                                  {row.label}
                                </span>
                                <span className="text-white font-mono flex-1 text-right truncate">
                                  {row.value}
                                </span>
                                {row.copyable ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyText(row.value, row.key)
                                    }
                                    className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
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
                          {isPaypal && "paypalUrl" in bank && (
                            <a
                              href={bank.paypalUrl as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-center px-3 py-2 text-[11px] font-black tracking-widest uppercase transition-opacity hover:opacity-85"
                              style={{ backgroundColor: GOLD, color: "#000" }}
                            >
                              Pagar en PayPal
                            </a>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Desktop / tablet: grid */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {mergedBanks.map((bank) => {
                    const isSelectable = !!bank.account;
                    const isActive =
                      isSelectable && activeBankKey === bank.key;
                    return (
                      <div
                        key={bank.key}
                        role={isSelectable ? "button" : undefined}
                        tabIndex={isSelectable ? 0 : undefined}
                        aria-pressed={isSelectable ? isActive : undefined}
                        aria-disabled={!isSelectable}
                        onClick={() =>
                          isSelectable && setActiveBankKey(bank.key)
                        }
                        onKeyDown={(e) => {
                          if (!isSelectable) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveBankKey(bank.key);
                          }
                        }}
                        className="border p-4 flex flex-col gap-3 text-left transition-all outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                        style={{
                          borderColor: isActive
                            ? GOLD
                            : "badge" in bank
                              ? `${GOLD}30`
                              : "rgba(255,255,255,0.08)",
                          backgroundColor: isActive ? `${GOLD}08` : "#0d0d0d",
                          opacity: !isSelectable ? 1 : isActive ? 1 : 0.45,
                          cursor: isSelectable ? "pointer" : "default",
                        }}
                      >
                        {/* Logo */}
                        <div className="relative bg-white h-12 flex items-center justify-center px-3">
                          <img
                            src={bank.logo}
                            alt={bank.name}
                            className="h-8 w-auto object-contain"
                          />
                          {"badge" in bank && (
                            <span
                              className="absolute top-1 right-1 text-[9px] font-black px-1 py-0.5 tracking-wider"
                              style={{ backgroundColor: GOLD, color: "#000" }}
                            >
                              {bank.badge}
                            </span>
                          )}
                        </div>

                        {/* Account details */}
                        {bank.account ? (
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              {"label" in bank ? (
                                <p
                                  className="text-[10px] font-bold uppercase tracking-widest"
                                  style={{ color: GOLD }}
                                >
                                  {bank.label}
                                </p>
                              ) : (
                                <span />
                              )}
                              <span
                                className="text-[9px] tracking-widest uppercase shrink-0"
                                style={{
                                  color: isActive
                                    ? GOLD
                                    : "rgba(255,255,255,0.35)",
                                }}
                              >
                                {isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            {[
                              ...("account_holder" in bank.account &&
                              bank.account.account_holder
                                ? [
                                    {
                                      label: "Titular",
                                      value: bank.account
                                        .account_holder as string,
                                      key: `h-${bank.key}`,
                                      copyable: false,
                                    },
                                  ]
                                : []),
                              {
                                label:
                                  "isPaypal" in bank && bank.isPaypal
                                    ? "Usuario"
                                    : "Cuenta",
                                value: bank.account.account_number as string,
                                key: `n-${bank.key}`,
                                copyable: true,
                              },
                            ].map((row) => (
                              <div
                                key={row.key}
                                className="flex items-center justify-between gap-1"
                              >
                                <span className="text-neutral-600 shrink-0">
                                  {row.label}:
                                </span>
                                <span className="text-white font-mono flex-1 text-right truncate text-[11px]">
                                  {row.value}
                                </span>
                                {row.copyable ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveBankKey(bank.key);
                                      copyText(row.value, row.key);
                                    }}
                                    className="shrink-0 w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
                                  >
                                    {copied === row.key ? (
                                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-neutral-600" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="shrink-0 w-5 h-5" />
                                )}
                              </div>
                            ))}
                            {bank.account.account_type && (
                              <p className="text-neutral-700 text-[11px]">
                                {bank.account.account_type}
                              </p>
                            )}
                            {"isPaypal" in bank &&
                              bank.isPaypal &&
                              "paypalUrl" in bank && (
                                <a
                                  href={bank.paypalUrl as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="block text-center mt-1 px-2 py-1.5 text-[10px] font-black tracking-widest uppercase transition-opacity hover:opacity-85"
                                  style={{
                                    backgroundColor: GOLD,
                                    color: "#000",
                                  }}
                                >
                                  Pagar en PayPal
                                </a>
                              )}
                          </div>
                        ) : (
                          <p className="text-neutral-700 text-xs text-center">
                            {bank.name}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                </>
              )}
            </div>

            {/* Comprobante de pago */}
            <div>
              {sectionLabel("Comprobante de pago")}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              {preview ? (
                <div className="relative border border-white/10">
                  <img
                    src={preview}
                    alt="Comprobante"
                    className="w-full max-h-56 object-contain"
                  />
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/80 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border py-6 flex items-center justify-center gap-4 transition-colors hover:border-[#ffffff]/30 group"
                  style={{
                    borderColor: errors.screenshot
                      ? "#f87171"
                      : "rgba(255,255,255,0.1)",
                    backgroundColor: "#0d0d0d",
                  }}
                >
                  <ImageIcon className="w-6 h-6 text-neutral-700 group-hover:text-neutral-500 transition-colors" />
                  <div className="text-left">
                    <p className="text-white text-sm font-semibold">
                      Subir comprobante
                    </p>
                    <p className="text-neutral-600 text-xs">
                      PNG, JPG — máx. 10MB
                    </p>
                  </div>
                </button>
              )}
              {errors.screenshot && (
                <p className="text-red-400 text-xs mt-2">{errors.screenshot}</p>
              )}
            </div>

            {/* Total + T&C + Button */}
            <div className="space-y-5 border-t border-white/5 pt-6">
              {/* Total */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-widest uppercase text-neutral-600">
                    Total a pagar
                  </p>
                  <p className="text-neutral-700 text-xs">
                    {count} × ${raffle.ticket_price.toFixed(2)}
                  </p>
                </div>
                <p className="text-3xl font-black" style={{ color: GOLD }}>
                  ${total.toFixed(2)}
                </p>
              </div>

              {/* T&C */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    className="w-5 h-5 border shrink-0 mt-0.5 flex items-center justify-center transition-colors cursor-pointer"
                    style={{
                      borderColor: errors.terms
                        ? "#f87171"
                        : terms
                          ? GOLD
                          : "rgba(255,255,255,0.2)",
                      backgroundColor: terms ? `${GOLD}20` : "transparent",
                    }}
                    onClick={() => {
                      setTerms((t) => !t);
                      setErrors((v) => ({ ...v, terms: "" }));
                    }}
                  >
                    {terms && (
                      <CheckCircle2
                        className="w-3 h-3"
                        style={{ color: GOLD }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 leading-relaxed select-none">
                    Acepto los{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="underline hover:opacity-70 transition-opacity"
                      style={{ color: GOLD }}
                    >
                      términos y condiciones
                    </a>{" "}
                    del sorteo. Entiendo que mi pago quedará pendiente de
                    verificación.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-400 text-xs mt-2">{errors.terms}</p>
                )}
              </div>

              {/* Submit */}
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
                    Confirmar {count} Boleto{count !== 1 ? "s" : ""} — $
                    {total.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            VALIDATE TICKET SECTION
            ════════════════════════════════════ */}
        <div className="mt-16 pt-10 border-t border-white/5">
          <div className="max-w-lg mx-auto text-center mb-8">
            <p
              className="text-xs font-semibold tracking-[0.4em] uppercase mb-2"
              style={{ color: GOLD }}
            >
              ¿Ya compraste?
            </p>
            <h2 className="text-2xl font-black text-white">
              Verifica tus <span style={{ color: GOLD }}>boletos</span>
            </h2>
            <p className="text-neutral-600 text-xs mt-2">
              Ingresa el correo con el que compraste
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <form onSubmit={handleVerify} className="flex mb-2">
              <input
                type="email"
                value={verifyEmail}
                onChange={(e) => {
                  setVerifyEmail(e.target.value);
                  setVerifyError("");
                }}
                placeholder="tu@correo.com"
                className="flex-1 h-11 px-4 bg-[#0d0d0d] border border-r-0 text-white text-sm placeholder:text-neutral-700 outline-none transition-colors border-white/10 focus:border-[#ffffff]/50"
                disabled={verifyLoading}
              />
              <button
                type="submit"
                disabled={verifyLoading}
                className="h-11 px-5 text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ backgroundColor: GOLD, color: "#000" }}
              >
                {verifyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </form>
            {verifyError && (
              <p className="text-red-400 text-xs mb-3">{verifyError}</p>
            )}

            {verifyResults && (
              <div className="mt-6 space-y-2">
                <p className="text-neutral-600 text-xs tracking-widest uppercase mb-4">
                  {verifyResults.data?.length ?? 0} sorteo
                  {verifyResults.data?.length !== 1 ? "s" : ""} encontrado
                  {verifyResults.data?.length !== 1 ? "s" : ""}
                </p>
                {verifyResults.data?.length === 0 ? (
                  <div className="border border-white/5 p-8 text-center">
                    <p className="text-neutral-500 text-sm">
                      No se encontraron boletos
                    </p>
                  </div>
                ) : (
                  verifyResults.data?.map((item: any) => (
                    <div
                      key={item.raffle.id}
                      className="flex items-center gap-4 border p-4"
                      style={{
                        borderColor: item.isWinner
                          ? `${GOLD}33`
                          : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="w-12 h-12 shrink-0 overflow-hidden">
                        <img
                          src={item.raffle.image_url || "/placeholder.svg"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-xs line-clamp-1">
                          {item.raffle.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.isWinner && (
                            <span
                              className="text-xs font-bold flex items-center gap-1"
                              style={{ color: GOLD }}
                            >
                              <Trophy className="w-3 h-3" />
                              Ganador
                            </span>
                          )}
                          {item.approvedCount > 0 && (
                            <span
                              className="text-xs flex items-center gap-1"
                              style={{ color: "#22c55e" }}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {item.approvedCount} aprobado
                              {item.approvedCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {item.pendingCount > 0 && (
                            <span
                              className="text-xs flex items-center gap-1"
                              style={{ color: "#f59e0b" }}
                            >
                              <AlertCircle className="w-3 h-3" />
                              {item.pendingCount} pendiente
                              {item.pendingCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tickets.slice(0, 8).map((t: any) => {
                            const isWinnerTicket =
                              item.raffle.winner_ticket_id === t.id;
                            const isPending = t.payment_status === "pending";
                            const borderColor = isWinnerTicket
                              ? GOLD
                              : isPending
                                ? "rgba(245,158,11,0.4)"
                                : "rgba(255,255,255,0.1)";
                            const textColor = isWinnerTicket
                              ? GOLD
                              : isPending
                                ? "#f59e0b"
                                : "rgba(255,255,255,0.4)";
                            return (
                              <span
                                key={t.id}
                                className="px-1.5 py-0.5 text-[10px] font-mono border"
                                style={{ borderColor, color: textColor }}
                                title={
                                  isPending
                                    ? "Pendiente de aprobación"
                                    : "Aprobado"
                                }
                              >
                                #{t.ticket_number}
                                {isPending ? " ⏳" : ""}
                              </span>
                            );
                          })}
                          {item.tickets.length > 8 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-neutral-600 border border-white/5">
                              +{item.tickets.length - 8}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════
            OTHER RAFFLES SECTION
            ════════════════════════════════════ */}
        {otherRaffles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/5">
            <div className="mb-8">
              <p
                className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
                style={{ color: GOLD }}
              >
                Disponibles ahora
              </p>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Más <span style={{ color: GOLD }}>Sorteos</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherRaffles.map((r) => (
                <RaffleCard key={r.id} raffle={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
