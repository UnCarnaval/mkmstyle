import { getSiteSettings } from "@/app/actions/site-settings"
import { AuthBranding } from "@/components/auth-branding"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const settings = await getSiteSettings()
  const siteName = settings?.site_name || "Dinamica Pro"

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="editorial-card p-8 sm:p-10">
          <AuthBranding siteName={siteName} />

          <header className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Bienvenido
            </h1>
            <p className="text-neutral-500 text-sm">
              Inicia sesión para participar en sorteos
            </p>
          </header>

          <LoginForm />
        </div>

        <p className="text-center text-neutral-600 text-xs mt-6 tracking-widest uppercase">
          © 2026 {siteName}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
