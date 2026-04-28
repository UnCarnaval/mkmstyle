import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RaffleForm } from "@/components/raffle-form"

export default async function NewRafflePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-10" data-aos="fade-up">
          <p className="editorial-eyebrow mb-2">Nuevo</p>
          <h1 className="editorial-heading">
            Crear <span className="text-white">Sorteo</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Completa los detalles del sorteo</p>
        </header>

        <RaffleForm />
      </div>
    </div>
  )
}
