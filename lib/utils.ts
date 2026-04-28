import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PRICE_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const COUNT_FORMATTER = new Intl.NumberFormat('en-US')

export function formatPrice(value: number | null | undefined): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return PRICE_FORMATTER.format(n)
}

export function formatCount(value: number | null | undefined): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return COUNT_FORMATTER.format(n)
}

// Compact: 1,234 → "1,234"; 12,345 → "12.3k"; 1,234,567 → "1.23M"; 1,234,567,890 → "1.23B"
export function formatCompact(value: number | null | undefined): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  const abs = Math.abs(n)
  if (abs < 1_000) return COUNT_FORMATTER.format(Math.round(n))

  const sign = n < 0 ? '-' : ''
  const trim = (num: number) => {
    const s = num.toFixed(2)
    return s.replace(/\.?0+$/, '')
  }

  if (abs < 1_000_000) return `${sign}${trim(abs / 1_000)}k`
  if (abs < 1_000_000_000) return `${sign}${trim(abs / 1_000_000)}M`
  if (abs < 1_000_000_000_000) return `${sign}${trim(abs / 1_000_000_000)}B`
  return `${sign}${trim(abs / 1_000_000_000_000)}T`
}

// For prices: under 1k → "999.50"; 1.2k+ → "1.2k", "3.5M", "1.23B", etc.
export function formatPriceCompact(value: number | null | undefined): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  if (Math.abs(n) < 1_000) return PRICE_FORMATTER.format(n)
  return formatCompact(n)
}
