"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { createPayPalOrder, verifyPayPalPayment } from "@/app/actions/paypal"
import Script from "next/script"

interface PayPalCheckoutProps {
  raffleId: string
  ticketCount: number
  selectedSize?: string
  guestInfo?: { name: string; email: string; phone: string } | null
  onClose: () => void
  onSuccess: () => void
}

export function PayPalCheckout({ raffleId, ticketCount, selectedSize, guestInfo, onClose, onSuccess }: PayPalCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await createPayPalOrder(raffleId, ticketCount, guestInfo, selectedSize)
        setOrderData(data)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchOrder()
  }, [raffleId, ticketCount, guestInfo, selectedSize])

  const handlePayPalLoad = () => {
    if (!window.paypal || !orderData) return

    window.paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: orderData.amount,
                  currency_code: orderData.currency,
                },
                description: orderData.description,
              },
            ],
          })
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture()
          await verifyPayPalPayment(order.id, raffleId, ticketCount, guestInfo)
          onSuccess()
        },
        onError: (err: any) => {
          setError("Error al procesar el pago con PayPal")
        },
      })
      .render("#paypal-button-container")

    setIsLoading(false)
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
    <>
      <Script src="https://www.paypal.com/sdk/js?client-id=test&currency=USD" onLoad={handlePayPalLoad} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-purple-500/20">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Pago con PayPal
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {orderData && (
            <div className="mb-6 p-4 glass-card rounded-xl border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Total:</span>
                <span className="text-white font-bold text-lg">${orderData.amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Boletos:</span>
                <span className="text-white font-semibold">{ticketCount}</span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div id="paypal-button-container" />
          )}
        </div>
      </div>
    </>
  )
}
