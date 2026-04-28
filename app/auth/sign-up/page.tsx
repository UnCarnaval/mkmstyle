import { getSiteSettings } from "@/app/actions/site-settings"
import { AuthBranding } from "@/components/auth-branding"
import { SignUpForm } from "@/components/sign-up-form"

export default async function SignUpPage() {
  const settings = await getSiteSettings()
  const siteName = settings?.site_name || "Dinamica Pro"

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="editorial-card p-8 sm:p-10">
          <AuthBranding siteName={siteName} />

          <header className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Crear cuenta
            </h1>
            <p className="text-neutral-500 text-sm">
              Regístrate para empezar a participar
            </p>
          </header>

          <SignUpForm />
        </div>

        <p className="text-center text-neutral-600 text-xs mt-6 tracking-widest uppercase">
          © 2026 {siteName}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
