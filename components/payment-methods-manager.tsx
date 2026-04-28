"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Wallet, Bitcoin, Building2, Loader2 } from "lucide-react"
import { togglePaymentMethod } from "@/app/actions/payment-settings"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PaymentMethod {
  id: string
  provider: string
  is_enabled: boolean
  display_name: string
  description: string
}

const PAYMENT_ICONS = {
  stripe: CreditCard,
  paypal: Wallet,
  crypto: Bitcoin,
  bank_transfer: Building2,
}

const DEFAULT_METHODS: PaymentMethod[] = [
  {
    id: "stripe",
    provider: "stripe",
    is_enabled: false,
    display_name: "Stripe",
    description: "Tarjeta debito/credito",
  },
  {
    id: "paypal",
    provider: "paypal",
    is_enabled: false,
    display_name: "PayPal",
    description: "Pago rapido y seguro",
  },
  {
    id: "crypto",
    provider: "crypto",
    is_enabled: false,
    display_name: "Criptomonedas",
    description: "Bitcoin, USDT, ETH",
  },
  {
    id: "bank_transfer",
    provider: "bank_transfer",
    is_enabled: false,
    display_name: "Transferencia Bancaria",
    description: "Verificacion manual",
  },
]

export function PaymentMethodsManager({ initialMethods }: { initialMethods: PaymentMethod[] }) {
  const merged = DEFAULT_METHODS.map((def) => {
    const fromDB = initialMethods.find((m) => m.provider === def.provider)
    return fromDB ?? def
  })

  const [methods, setMethods] = useState(merged)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleToggle = async (provider: string, currentStatus: boolean) => {
    setLoading(provider)
    try {
      await togglePaymentMethod(provider, !currentStatus)
      setMethods((prev) => prev.map((m) => (m.provider === provider ? { ...m, is_enabled: !currentStatus } : m)))
      toast.success(`Metodo de pago ${!currentStatus ? "activado" : "desactivado"}`)
      router.refresh()
    } catch (error) {
      toast.error("Error al actualizar el metodo de pago")
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-px bg-white/5 md:grid-cols-2">
      {methods.map((method) => {
        const Icon = PAYMENT_ICONS[method.provider as keyof typeof PAYMENT_ICONS]

        return (
          <div
            key={method.provider}
            className={`bg-[#0d0d0d] p-5 transition-colors ${
              method.is_enabled ? "" : "opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 border border-white/[0.07] bg-[#080808] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{method.display_name}</p>
                  <p className="text-xs text-neutral-500 truncate">{method.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {loading === method.provider && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <div className="flex flex-col items-center gap-1">
                  <Switch
                    checked={method.is_enabled}
                    onCheckedChange={() => handleToggle(method.provider, method.is_enabled)}
                    disabled={loading === method.provider}
                    className="data-[state=checked]:bg-white"
                  />
                  <span
                    className={`text-[0.65rem] font-semibold tracking-widest uppercase ${
                      method.is_enabled ? "text-[#22c55e]" : "text-neutral-500"
                    }`}
                  >
                    {method.is_enabled ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
