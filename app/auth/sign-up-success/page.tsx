import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { getSiteSettings } from "@/app/actions/site-settings"
import { AuthBranding } from "@/components/auth-branding"

export default async function SignUpSuccessPage() {
  const settings = await getSiteSettings()
  const siteName = settings?.site_name || "Dinamica Pro"

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="editorial-card p-8 sm:p-10 text-center">
          <AuthBranding siteName={siteName} />

          <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center relative">
            <div className="absolute inset-0 blur-xl rounded-full bg-[#22c55e]/20" />
            <CheckCircle2 className="w-10 h-10 relative z-10" style={{ color: "#22c55e" }} />
          </div>

          <p className="editorial-eyebrow mb-3">Confirmación</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">Registro exitoso</h1>
          <p className="text-neutral-500 text-sm mb-8">
            Por favor revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.
          </p>

          <Link href="/auth/login" className="editorial-button-primary w-full">
            Ir al login
          </Link>
        </div>

        <p className="text-center text-neutral-600 text-xs mt-6 tracking-widest uppercase">
          © 2026 {siteName}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
