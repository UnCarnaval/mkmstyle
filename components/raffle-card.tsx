import Link from "next/link"

interface RaffleCardProps {
  raffle: {
    id: string
    title: string
    description: string
    image_url: string
    ticket_price: number
    total_tickets: number
    tickets_sold: number
    draw_date: string
  }
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const progress = Math.round((raffle.tickets_sold / raffle.total_tickets) * 100)

  return (
    <Link href={`/raffle/${raffle.id}`} className="group block h-full">
      <div
        className="border transition-all duration-300 flex flex-col h-full"
        style={{ backgroundColor: "#0d0d0d", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {/* Image area — fills entire section */}
        <div className="relative overflow-hidden shrink-0" style={{ height: 240 }}>
          <img
            src={raffle.image_url || "/placeholder.svg"}
            alt={raffle.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle bottom gradient for info readability */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Info */}
        <div className="px-4 py-4 border-t flex flex-col flex-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {/* Name + price row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className="text-white font-bold text-sm leading-tight flex-1 min-w-0 overflow-hidden text-ellipsis"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: "2.6em",
              }}
            >
              {raffle.title}
            </h3>
            <span className="font-bold text-sm shrink-0" style={{ color: "#ffffff" }}>
              ${raffle.ticket_price.toFixed(2)}
            </span>
          </div>

          {/* Sold % row */}
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex-1 h-px bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: "#ffffff", opacity: 0.7 }}
              />
            </div>
            <span className="text-xs font-semibold shrink-0" style={{ color: "#ffffff" }}>
              {progress}% RIFADO
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
