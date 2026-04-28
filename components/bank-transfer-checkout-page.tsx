"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Copy, CheckCircle2, ArrowLeft, Upload } from "lucide-react"
import { createBankTransferTickets } from "@/app/actions/bank-transfer"
import { getBankAccounts } from "@/app/actions/payments"
import { swal } from "@/lib/swal"
import { useRouter } from "next/navigation"

interface BankTransferCheckoutPageProps {
  raffleId: string
  raffle: any
  ticketCount: number
  guestInfo?: {
    name: string
    email: string
    phone: string
  }
}

export function BankTransferCheckoutPage({ raffleId, raffle, ticketCount, guestInfo }: BankTransferCheckoutPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
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
    getBankAccounts().then(setBankAccounts)
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    swal.success("Copiado al portapapeles")
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

    if (!screenshot) {
      swal.error("Comprobante requerido", "Por favor adjunta el comprobante de transferencia")
      return
    }

    setLoading(true)
    setUploading(true)

    try {
      const formDataFile = new FormData()
      formDataFile.append("file", screenshot)

      const uploadResponse = await fetch(`/api/upload`, {
        method: "POST",
        body: formDataFile,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Error al subir el comprobante")
      }

      const { url: screenshotUrl } = await uploadResponse.json()

      const result = await createBankTransferTickets({
        raffleId,
        ticketCount,
        guestName: formData.name,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        bankReference: formData.reference,
        screenshotUrl,
      })

      if (result.success) {
        const ticketNumbers = (result.tickets || [])
          .map((t: any) => `#${t.ticket_number.toString().padStart(4, "0")}`)
          .join(", ")

        flushSync(() => {
          setFormData({ name: "", email: "", phone: "", reference: "" })
          setScreenshot(null)
          setLoading(false)
          setUploading(false)
        })
        const fileInput = document.getElementById("screenshot") as HTMLInputElement | null
        if (fileInput) fileInput.value = ""

        const titleMsg = ticketNumbers
          ? ticketCount > 1
            ? `${ticketCount} boletos registrados: ${ticketNumbers}`
            : `Boleto registrado: ${ticketNumbers}`
          : ticketCount > 1
            ? `${ticketCount} boletos registrados`
            : "Boleto registrado"

        await swal.success(
          titleMsg,
          "Tu pago está pendiente de verificación. Te notificaremos por email cuando sea aprobado.",
          8000,
        )
      }
    } catch (error: any) {
      console.error("[v0] Error in bank transfer:", error)
      swal.error("Error al procesar", error.message)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const totalAmount = raffle.ticket_price * ticketCount

  return (
    <div
      className="min-h-screen bg-[#080808] py-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <button type="button" onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver al sorteo
        </button>

        <div className="bg-[#111111] border border-neutral-800 rounded-2xl">
          <div className="p-5 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Transferencia Bancaria
              </h1>
              <p className="text-neutral-500 mt-1 text-sm">{raffle.title}</p>
            </div>

            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Monto a transferir</p>
                <p className="text-3xl font-black text-amber-400">${totalAmount.toFixed(2)}</p>
                {ticketCount > 1 && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {ticketCount} boletos x ${raffle.ticket_price.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">Boletos</p>
                <p className="text-4xl font-black text-white">{ticketCount}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Cuentas disponibles</h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex-shrink-0 bg-[#181818] border border-neutral-800 rounded-xl p-4 w-64"
                  >
                    {/* Bank header */}
                    <div className="flex items-center gap-2 mb-3">
                      {account.bank_logo ? (
                        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
                          <img
                            src={account.bank_logo}
                            alt={account.bank_name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                      <span className="font-semibold text-white text-sm truncate">{account.bank_name}</span>
                    </div>

                    {/* Account details */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-neutral-500">Titular</p>
                        <p className="text-xs text-neutral-200 font-medium leading-tight">{account.account_holder}</p>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Cuenta</p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-neutral-200 font-mono flex-1 truncate">{account.account_number}</p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(account.account_number, `account-${account.id}`)}
                            className="flex-shrink-0 p-1 rounded hover:bg-neutral-700 transition-colors"
                          >
                            {copiedField === `account-${account.id}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-neutral-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-neutral-500">Tipo</p>
                        <p className="text-xs text-neutral-200">{account.account_type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-5 border-t border-neutral-800">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    required
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 h-11 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 h-11 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Telefono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 809 000 0000"
                    required
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 h-11 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reference" className="text-neutral-400 text-xs font-medium uppercase tracking-wide">
                    Referencia <span className="text-neutral-600 normal-case">(opcional)</span>
                  </Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Ej: 123456789"
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 h-11 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="screenshot" className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Comprobante de transferencia</Label>
                <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-amber-500/50 transition-colors cursor-pointer">
                  <input id="screenshot" type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
                  <label htmlFor="screenshot" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                    {screenshot ? (
                      <div>
                        <p className="text-amber-400 font-medium text-sm break-all">{screenshot.name}</p>
                        <p className="text-xs text-neutral-600 mt-1">{(screenshot.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-neutral-400 text-sm font-medium">Haz clic para subir el comprobante</p>
                        <p className="text-xs text-neutral-600 mt-1">PNG, JPG o JPEG (max. 10MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-200 leading-relaxed">
                  Tu{ticketCount > 1 ? "s" : ""} boleto{ticketCount > 1 ? "s" : ""} quedar{ticketCount > 1 ? "an" : "a"} pendiente{ticketCount > 1 ? "s" : ""} de verificacion. Te notificaremos por email cuando tu pago sea confirmado.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black h-13 text-base font-black rounded-xl transition-colors"
              >
                {uploading ? "Subiendo comprobante..." : loading ? "Registrando..." : "Confirmar Transferencia"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
