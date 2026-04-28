"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Copy, Check } from "lucide-react"
import { createCryptoPayment, verifyCryptoPayment } from "@/app/actions/crypto"
import Image from "next/image"

interface CryptoCheckoutProps {
  raffleId: string
  ticketCount: number
  selectedSize?: string
  guestInfo?: { name: string; email: string; phone: string } | null
  onClose: () => void
  onSuccess: () => void
}

export function CryptoCheckout({ raffleId, ticketCount, selectedSize, guestInfo, onClose, onSuccess }: CryptoCheckoutProps) {
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const data = await createCryptoPayment(raffleId, ticketCount, guestInfo, selectedSize)
        setPaymentData(data)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchPayment()
  }, [raffleId, ticketCount, guestInfo, selectedSize])

  const handleCopy = () => {
    if (paymentData?.cryptoAddress) {
      navigator.clipboard.writeText(paymentData.cryptoAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVerifyPayment = async () => {
    setIsVerifying(true)
    try {
      await verifyCryptoPayment(paymentData.paymentId, raffleId, ticketCount, guestInfo)
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsVerifying(false)
    }
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-red-500/20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-red-400">Error</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-orange-500/20">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
            Pago con Crypto
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!paymentData ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 glass-card rounded-xl border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Total:</span>
                <span className="text-white font-bold text-lg">${paymentData.amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Boletos:</span>
                <span className="text-white font-semibold">{ticketCount}</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-400 mb-4">Escanea el código QR o copia la dirección</p>
              <div className="inline-block p-4 glass-card rounded-xl border border-white/10">
                <Image
                  src={paymentData.qrCode || "/placeholder.svg"}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-400">Dirección de pago:</p>
              <div className="flex gap-2">
                <div className="flex-1 p-3 glass-card rounded-xl border border-white/10 font-mono text-xs text-slate-300 break-all">
                  {paymentData.cryptoAddress}
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="icon"
                  className="glass-button border-orange-500/20 bg-transparent"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 glass-card rounded-xl border border-orange-500/20 bg-orange-500/5">
              <p className="text-sm text-slate-300 text-center">
                Después de enviar el pago, haz clic en el botón de abajo para verificar y completar tu compra
              </p>
            </div>

            <Button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="w-full glass-button rounded-xl h-12 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700"
            >
              {isVerifying ? "Verificando..." : "He completado el pago"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
