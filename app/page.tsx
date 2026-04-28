import { createClient } from "@/lib/supabase/server"
import { RaffleCard } from "@/components/raffle-card"
import { Hero } from "@/components/hero"
import { FaqSection } from "@/components/faq-section"
import { VerifySection } from "@/components/verify-section"
import { getSiteSettings } from "@/app/actions/site-settings"
import Link from "next/link"
import { ShieldCheck, Eye, Zap } from "lucide-react"

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  const { data: raffles } = await supabase
    .from("raffles")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const activeRaffles = raffles ?? []
  const shuffled = [...activeRaffles].sort(() => Math.random() - 0.5)
  const featuredRaffles = shuffled.slice(0, 4)

  const siteSettings = await getSiteSettings()

  return (
    <div className="min-h-screen bg-[#080808]">

      <Hero heroImageUrl={siteSettings.hero_image_url} />

      <section id="sorteos" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="container mx-auto">

          <div className="flex items-end justify-between mb-12" data-aos="fade-up">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: "#ffffff" }}>
                Disponibles ahora
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Sorteos <span style={{ color: "#ffffff" }}>Destacados</span>
              </h2>
            </div>
            <Link
              href="/sorteos"
              className="text-neutral-400 hover:text-white transition-colors text-sm font-semibold tracking-widest uppercase flex items-center gap-2 group"
            >
              Ver todos
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {featuredRaffles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredRaffles.map((raffle, i) => (
                <div key={raffle.id} data-aos="fade-up" data-aos-delay={i * 100}>
                  <RaffleCard raffle={raffle} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/5 p-12 text-center" data-aos="fade-up">
              <p className="text-neutral-500 text-base">No hay sorteos disponibles en este momento</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 sm:py-28 px-4 sm:px-6 border-t border-white/5">
        <div className="container mx-auto">

          <div className="text-center mb-16" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: "#ffffff" }}>
              Por qué elegirnos
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tu confianza, nuestra <span style={{ color: "#ffffff" }}>prioridad</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {[
              {
                icon: ShieldCheck,
                label: "Seguridad",
                title: "100% Seguro",
                body: "Tus pagos están protegidos con encriptación de nivel bancario. Cada transacción es verificada y auditada en tiempo real.",
              },
              {
                icon: Eye,
                label: "Transparencia",
                title: "Transparente",
                body: "Todos los sorteos son verificables y públicos. La selección de ganadores es completamente aleatoria y auditable.",
              },
              {
                icon: Zap,
                label: "Velocidad",
                title: "Entrega Rápida",
                body: "Los ganadores reciben sus premios en tiempo récord. Coordinamos la entrega desde el primer momento tras el sorteo.",
              },
            ].map(({ icon: Icon, label, title, body }, i) => (
              <div key={title} className="bg-[#080808] p-10 group hover:bg-[#0d0d0d] transition-colors" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="w-12 h-12 flex items-center justify-center mb-8 relative">
                  <div
                    className="absolute inset-0 blur-xl rounded-full transition-opacity group-hover:opacity-100 opacity-60"
                    style={{ backgroundColor: "#ffffff22" }}
                  />
                  <Icon className="w-7 h-7 relative z-10" style={{ color: "#ffffff" }} />
                </div>
                <p className="text-xs tracking-[0.25em] uppercase font-semibold mb-3" style={{ color: "#ffffff" }}>
                  {label}
                </p>
                <h3 className="text-2xl font-black text-white mb-4">{title}</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{body}</p>
                <div
                  className="mt-8 h-px"
                  style={{ background: "linear-gradient(to right, #ffffff44, transparent)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <VerifySection />

      <FaqSection />

    </div>
  )
}
