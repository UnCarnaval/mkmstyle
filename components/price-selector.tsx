"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PriceSelectorProps {
  priceUSD: number
  quantity: number
  onSizeChange?: (size: string) => void
  sizeOptions?: string | string[] | null
}

export function PriceSelector({
  priceUSD,
  quantity,
  onSizeChange,
  sizeOptions,
}: PriceSelectorProps) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")

  // Parse sizes - handle both array and string formats
  const sizes = Array.isArray(sizeOptions)
    ? sizeOptions.map(s => String(s).trim()).filter(s => s)
    : sizeOptions && typeof sizeOptions === "string"
    ? sizeOptions
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    : []

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        )
        const data = await response.json()
        setExchangeRate(data.rates.DOP || 59)
      } catch (error) {
        console.error("Error fetching exchange rate:", error)
        setExchangeRate(59)
      } finally {
        setLoading(false)
      }
    }

    fetchExchangeRate()
  }, [])

  const totalUSD = priceUSD * quantity
  const totalDOP = exchangeRate ? totalUSD * exchangeRate : totalUSD * 59

  const handleSizeChange = (size: string) => {
    setSelectedSize(size)
    onSizeChange?.(size)
  }

  return (
    <div className="space-y-4">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Selecciona tu talla
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                className={`py-2.5 px-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedSize === size
                    ? "bg-amber-500 text-black ring-2 ring-amber-400"
                    : "bg-neutral-800 border border-neutral-700 text-neutral-300 hover:border-amber-500/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Precio por boleto:</span>
          <span className="text-neutral-200 font-medium">${priceUSD.toFixed(2)}</span>
        </div>

        {quantity > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
            <span className="text-neutral-500">Cantidad:</span>
            <span className="text-neutral-200 font-medium">{quantity}x</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <span className="text-neutral-500">Total en USD:</span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <span className="text-amber-400 font-bold text-lg">
              ${totalUSD.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Total en DOP:</span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <span className="text-green-400 font-bold text-lg">
              RD${totalDOP.toFixed(2)}
            </span>
          )}
        </div>

        {loading && (
          <p className="text-xs text-neutral-600 text-center mt-2">
            Actualizando tasa de cambio...
          </p>
        )}
        {exchangeRate && !loading && (
          <p className="text-xs text-neutral-600 text-center mt-2">
            Tasa: 1 USD = RD${exchangeRate.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  )
}
