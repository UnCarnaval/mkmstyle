"use client"

import { useState, useMemo } from "react"
import { RaffleCard } from "@/components/raffle-card"
import { Search, SlidersHorizontal } from "lucide-react"

interface Raffle {
  id: string
  title: string
  description: string
  image_url: string
  ticket_price: number
  total_tickets: number
  tickets_sold: number
  draw_date: string
  created_at: string
}

type SortKey = "newest" | "price_asc" | "price_desc" | "most_sold" | "least_sold"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Recientes" },
  { key: "most_sold", label: "Más vendidos" },
  { key: "least_sold", label: "Menos vendidos" },
  { key: "price_asc", label: "Precio ↑" },
  { key: "price_desc", label: "Precio ↓" },
]

export function SorteosClient({ raffles }: { raffles: Raffle[] }) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("newest")

  const filtered = useMemo(() => {
    let result = [...raffles]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "price_asc":
          return a.ticket_price - b.ticket_price
        case "price_desc":
          return b.ticket_price - a.ticket_price
        case "most_sold": {
          const pctA = a.tickets_sold / a.total_tickets
          const pctB = b.tickets_sold / b.total_tickets
          return pctB - pctA
        }
        case "least_sold": {
          const pctA = a.tickets_sold / a.total_tickets
          const pctB = b.tickets_sold / b.total_tickets
          return pctA - pctB
        }
        default:
          return 0
      }
    })

    return result
  }, [raffles, search, sort])

  return (
    <div>
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">

        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600"
          />
          <input
            type="text"
            placeholder="Buscar sorteo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-transparent border text-white text-sm placeholder:text-neutral-600 outline-none focus:border-[#ffffff]/50 transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 border px-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <SlidersHorizontal className="w-4 h-4 text-neutral-600 mr-2 shrink-0" />
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className="h-11 px-3 text-xs font-semibold tracking-wide transition-colors whitespace-nowrap"
              style={{
                color: sort === opt.key ? "#ffffff" : "rgb(115,115,115)",
                borderBottom: sort === opt.key ? "1px solid #ffffff" : "1px solid transparent",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-neutral-600 text-xs tracking-widest uppercase mb-6">
        {filtered.length} {filtered.length === 1 ? "sorteo" : "sorteos"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      ) : (
        <div className="border border-white/5 p-16 text-center">
          <p className="text-neutral-500 text-sm">No se encontraron sorteos</p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-xs underline transition-colors"
              style={{ color: "#ffffff" }}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  )
}
