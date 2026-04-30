import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BankAccountsManager } from "@/components/bank-accounts-manager"
import { SiteSettingsManager } from "@/components/site-settings-manager"
import { getAllBankAccounts } from "@/app/actions/payments"
import { getSiteSettings } from "@/app/actions/site-settings"

export default async function AdminSettingsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const bankAccounts = await getAllBankAccounts()
  const siteSettings = await getSiteSettings()

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl space-y-10">
        <header data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Plataforma</p>
          <h1 className="editorial-heading">
            <span className="text-white">Configuración</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Gestiona la configuración general del sitio y los pagos</p>
        </header>

        <section className="editorial-card p-6 sm:p-8" data-aos="fade-up">
          <div className="mb-6">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Sitio</p>
            <h2 className="text-xl font-black text-white">Configuración general</h2>
            <p className="text-neutral-500 text-sm mt-1">Personaliza el nombre y logo de tu plataforma</p>
          </div>
          <SiteSettingsManager initialSettings={siteSettings} />
        </section>

        <section className="editorial-card p-6 sm:p-8" data-aos="fade-up">
          <div className="mb-6">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Cuentas</p>
            <h2 className="text-xl font-black text-white">Cuentas bancarias</h2>
            <p className="text-neutral-500 text-sm mt-1">Configura las cuentas para recibir transferencias</p>
          </div>
          <BankAccountsManager initialAccounts={bankAccounts} />
        </section>

        <section className="editorial-card p-6 sm:p-8" data-aos="fade-up">
          <div className="mb-6">
            <p className="editorial-eyebrow mb-2 text-neutral-400">Entorno</p>
            <h2 className="text-xl font-black text-white">Variables requeridas</h2>
            <p className="text-neutral-500 text-sm mt-1">
              Asegúrate de tener configuradas las API keys necesarias en Vercel
            </p>
          </div>
          <div className="space-y-2 text-sm font-mono">
            {[
              { name: "STRIPE_SECRET_KEY", state: "ok" },
              { name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", state: "ok" },
              { name: "NEXT_PUBLIC_PAYPAL_CLIENT_ID", state: "warn" },
              { name: "NOWPAYMENTS_API_KEY", state: "warn" },
              { name: "RESEND_API_KEY", state: "ok" },
            ].map(({ name, state }) => (
              <div
                key={name}
                className="flex items-center justify-between py-2 border-b border-white/[0.07] last:border-b-0"
              >
                <span className="text-neutral-300">{name}</span>
                <span style={{ color: state === "ok" ? "#22c55e" : "#f59e0b" }}>
                  {state === "ok" ? "✓ Configurada" : "⚠ Verificar"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
