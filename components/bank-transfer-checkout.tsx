"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Copy, CheckCircle2, X, Upload, Loader2 } from "lucide-react"
import { createBankTransferTickets } from "@/app/actions/bank-transfer"
import { getBankAccounts } from "@/app/actions/payments"
import { swal } from "@/lib/swal"
import { cn } from "@/lib/utils"

interface BankTransferCheckoutProps {
  raffleId: string
  raffleName: string
  ticketPrice: number
  ticketCount?: number
  onClose: () => void
  guestInfo?: {
    name: string
    email: string
    phone: string
  }
}

export function BankTransferCheckout({
  raffleId,
  raffleName,
  ticketPrice,
  ticketCount = 1,
  onClose,
  guestInfo,
}: BankTransferCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [banksError, setBanksError] = useState<string | null>(null)
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: guestInfo?.name || "",
    email: guestInfo?.email || "",
    phone: guestInfo?.phone || "",
    reference: "",
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setLoadingBanks(true)
    setBanksError(null)
    getBankAccounts()
      .then((accounts) => {
        const list = accounts || []
        setBankAccounts(list)
        if (list.length > 0) setSelectedBankId(list[0].id)
      })
      .catch((err) => {
        console.error("[v0] Error loading bank accounts:", err)
        setBanksError("No se pudieron cargar las cuentas bancarias. Recarga la página.")
      })
      .finally(() => setLoadingBanks(false))
  }, [])

  const selectedBank = bankAccounts.find((a) => a.id === selectedBankId) ?? null

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setScreenshot(file)
    } else {
      swal.error("Selección inválida", "Por favor selecciona una imagen válida")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.reference.trim()) {
      swal.error("Campo requerido", "Por favor ingresa el número de referencia de la transferencia")
      return
    }

    if (!screenshot) {
      swal.error("Comprobante requerido", "Por favor adjunta el comprobante de transferencia")
      return
    }

    if (screenshot.size > 10 * 1024 * 1024) {
      swal.error("Archivo muy grande", "La imagen no puede superar los 10MB")
      return
    }

    setLoading(true)
    setUploading(true)

    let screenshotUrl: string
    try {
      const ext = screenshot.name.split(".").pop() || "png"
      const filename = `transfers/transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const blob = await upload(filename, screenshot, {
        access: "private",
        handleUploadUrl: "/api/upload",
        contentType: screenshot.type,
      })
      screenshotUrl = blob.url
    } catch (error: any) {
      console.error("[v0] Error uploading screenshot:", error)
      setLoading(false)
      setUploading(false)
      swal.error("No se pudo subir el comprobante", error?.message || "Verifica tu conexión e intenta nuevamente")
      return
    }

    setUploading(false)

    try {
      const result = await createBankTransferTickets({
        raffleId,
        ticketCount,
        guestName: formData.name,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        bankReference: formData.reference,
        screenshotUrl,
      })

      if (result.success && result.tickets.length > 0) {
        const ticketNumbers = result.tickets.map((t) => `#${t.ticket_number.toString().padStart(4, "0")}`).join(", ")

        setFormData({
          name: guestInfo?.name || "",
          email: guestInfo?.email || "",
          phone: guestInfo?.phone || "",
          reference: "",
        })
        setScreenshot(null)
        const fileInput = document.getElementById("screenshot") as HTMLInputElement | null
        if (fileInput) fileInput.value = ""

        swal.success(
          "Revisa tu correo 📩", // Título
          `(bandeja de entrada o spam) para dar seguimiento a tu boleto.\n\n` +
          `${ticketCount > 1 ? 'Boletos #' : 'Boleto #'} ${ticketNumbers}\n\n` +
          "#Makingmoneyfamily❤️", // Descripción
          15000 // Tiempo en milisegundos (15 segundos)
        )
      }
    } catch (error: any) {
      console.error("[v0] Error registering tickets:", error)
      swal.error("No se pudo registrar la compra", error?.message || "Intenta nuevamente en unos segundos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:flex md:items-center md:justify-center md:p-6">
      <div className="h-full w-full overflow-y-auto md:h-auto md:max-h-[90vh] md:w-full md:max-w-2xl">
        <Card className="min-h-full md:min-h-0 bg-slate-900/95 backdrop-blur-xl border-slate-800 md:rounded-2xl rounded-none">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 md:static md:mx-0 md:px-0 md:py-0 z-10 border-b border-slate-800 md:border-none">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Transferencia Bancaria
                  </h2>
                  <p className="text-slate-400 mt-1 text-sm sm:text-base">{raffleName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 pt-2 md:pt-0">
              <div className="p-4 sm:p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <p className="text-sm text-cyan-300 mb-2">Monto a transferir:</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">${(ticketPrice * ticketCount).toFixed(2)}</p>
                {ticketCount > 1 && (
                  <p className="text-xs sm:text-sm text-cyan-400 mt-1">
                    {ticketCount} boletos x ${ticketPrice.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm font-semibold text-slate-300">Cuentas disponibles:</h3>
                {loadingBanks ? (
                  <div className="space-y-3">
                    {[0, 1].map((i) => (
                      <Card key={i} className="p-4 bg-slate-800/50 border-slate-700 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700" />
                          <div className="h-4 w-32 bg-slate-700 rounded" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-slate-700 rounded" />
                          <div className="h-3 w-3/4 bg-slate-700 rounded" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : banksError ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
                    {banksError}
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-200">
                    No hay cuentas bancarias configuradas. Contacta al administrador.
                  </div>
                ) : null}
                {!loadingBanks && bankAccounts.length > 0 && (
                  <>
                    <div className="flex gap-3 overflow-x-auto py-2 -mx-1 px-1">
                      {bankAccounts.map((account) => {
                        const isSelected = selectedBankId === account.id
                        return (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => setSelectedBankId(account.id)}
                            className={cn(
                              "relative flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 transition-all flex-shrink-0",
                              isSelected
                                ? "border-cyan-400 opacity-100 bg-white"
                                : "border-slate-700 opacity-40 hover:opacity-70 bg-slate-800/40",
                            )}
                            aria-pressed={isSelected}
                            aria-label={`Seleccionar ${account.bank_name}`}
                          >
                            {account.bank_logo ? (
                              <div className="w-full h-full p-1 flex items-center justify-center">
                                <img
                                  src={account.bank_logo}
                                  alt={account.bank_name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <>
                                <Building2 className="w-6 h-6 text-cyan-400" />
                                <span className="text-[10px] text-slate-300 mt-1 truncate max-w-full px-1">
                                  {account.bank_name}
                                </span>
                              </>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-cyan-400 bg-slate-900 rounded-full" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {selectedBank && (
                      <Card className="p-3 sm:p-4 bg-slate-800/50 border-slate-700">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                          {selectedBank.bank_logo ? (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
                              <img
                                src={selectedBank.bank_logo || "/placeholder.svg"}
                                alt={selectedBank.bank_name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-white text-sm sm:text-base">{selectedBank.bank_name}</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Titular:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm flex-1 break-words">
                                {selectedBank.account_holder}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedBank.account_holder, `holder-${selectedBank.id}`)}
                                className="flex-shrink-0 h-8 w-8 p-0"
                              >
                                {copiedField === `holder-${selectedBank.id}` ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Número de cuenta:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-mono text-sm flex-1 break-all">
                                {selectedBank.account_number}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedBank.account_number, `account-${selectedBank.id}`)}
                                className="flex-shrink-0 h-8 w-8 p-0"
                              >
                                {copiedField === `account-${selectedBank.id}` ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Tipo:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm flex-1">{selectedBank.account_type}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedBank.account_type, `type-${selectedBank.id}`)}
                                className="flex-shrink-0 h-8 w-8 p-0"
                              >
                                {copiedField === `type-${selectedBank.id}` ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-700">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white text-sm">
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white text-sm">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-white text-sm">
                    Número de Referencia / Comprobante
                  </Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ej: 123456789"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-400">
                    Ingresa el número de referencia o comprobante de tu transferencia
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot" className="text-white text-sm">
                    Comprobante de Transferencia
                  </Label>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 sm:p-6 text-center hover:border-cyan-500/50 transition-colors">
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="screenshot" className="cursor-pointer block">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-slate-500" />
                      {screenshot ? (
                        <p className="text-cyan-400 font-medium text-sm break-all px-2">{screenshot.name}</p>
                      ) : (
                        <>
                          <p className="text-slate-300 font-medium mb-1 text-sm sm:text-base">
                            Haz clic para subir el comprobante
                          </p>
                          <p className="text-xs text-slate-500">PNG, JPG o JPEG (max. 10MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || uploading || loadingBanks || bankAccounts.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-11 sm:h-12 text-sm sm:text-base"
                >
                  {uploading ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Subiendo comprobante…</span>
                  ) : loading ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Registrando…</span>
                  ) : (
                    "Confirmar Transferencia"
                  )}
                </Button>
              </form>

              <div className="p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 md:mb-0">
                <p className="text-xs sm:text-sm text-amber-200 leading-relaxed">
                  Tu{ticketCount > 1 ? "s" : ""} boleto{ticketCount > 1 ? "s" : ""} quedar
                  {ticketCount > 1 ? "án" : "á"} pendiente{ticketCount > 1 ? "s" : ""} de verificación. Te notificaremos
                  por email cuando tu pago sea confirmado.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
