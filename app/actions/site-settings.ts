"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getSiteSettings() {
  const supabase = await createServerClient()

  const { data } = await supabase.from("site_settings").select("*").limit(1).single()

  return data || { site_name: "Dinamica Pro", logo_url: null, hero_image_url: null }
}

export async function updateSiteSettings(data: {
  siteName: string
  logoUrl: string | null
  heroImageUrl: string | null
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No tienes permisos")
  }

  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single()

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({
        site_name: data.siteName,
        logo_url: data.logoUrl,
        hero_image_url: data.heroImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)

    if (error) {
      console.log("[v0] updateSiteSettings error:", error)
      throw new Error(error.message || "Error al guardar la configuración")
    }
  }

  revalidatePath("/")
  revalidatePath("/admin/settings")

  return { success: true }
}
