import { Ticket, Sparkles, Wallet } from "lucide-react"

interface DashboardStatsProps {
  totalTickets: number
  activeTickets: number
  totalSpent: number
}

export function DashboardStats({ totalTickets, activeTickets, totalSpent }: DashboardStatsProps) {
  const stats = [
    { label: "Boletos", title: "Total comprados", value: totalTickets.toString(), icon: Ticket },
    { label: "Sorteos", title: "Activos", value: activeTickets.toString(), icon: Sparkles },
    { label: "Inversión", title: "Total acumulado", value: `$${totalSpent.toFixed(2)}`, icon: Wallet },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
      {stats.map(({ label, title, value, icon: Icon }, i) => (
        <div
          key={label}
          className="bg-[#080808] p-8 group hover:bg-[#0d0d0d] transition-colors"
          data-aos="fade-up"
          data-aos-delay={i * 100}
        >
          <div className="w-12 h-12 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 blur-xl rounded-full opacity-60 bg-white/10 group-hover:opacity-100 transition-opacity" />
            <Icon className="w-6 h-6 relative z-10 text-white" />
          </div>
          <p className="editorial-eyebrow mb-2">{label}</p>
          <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
          <p className="text-neutral-500 text-sm">{title}</p>
          <div className="mt-6 h-px bg-gradient-to-r from-white/40 to-transparent" />
        </div>
      ))}
    </div>
  )
}
