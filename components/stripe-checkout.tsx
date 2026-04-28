"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createStripeCheckout } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  raffleId: string
  ticketCount: number
  selectedSize?: string
  guestInfo?: { name: string; email: string; phone: string } | null
  onClose: () => void
  onSuccess: () => void
}

export function StripeCheckout({ raffleId, ticketCount, selectedSize, guestInfo, onClose, onSuccess }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const secret = await createStripeCheckout(raffleId, ticketCount, guestInfo, selectedSize)
      setClientSecret(secret)
      return secret
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [raffleId, ticketCount, guestInfo, selectedSize])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card rounded-2xl p-6 max-w-2xl w-full border border-cyan-500/20 my-8">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Pago con Tarjeta
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )
}
