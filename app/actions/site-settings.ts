"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { put } from "@vercel/blob"

export async function uploadSiteImage(formData: FormData, prefix: "logo" | "hero" | "hero-mobile"): Promise<string> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("No tienes permisos")

  const file = formData.get("file") as File | null
  if (!file || !file.size) throw new Error("No se seleccionó ningún archivo")

  const ext = file.name.split(".").pop() || "jpg"
  const filename = `site/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const blob = await put(filename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  console.log("[v0] uploadSiteImage:", blob.url)
  return blob.url
}

export async function getSiteSettings() {
  noStore()
  const supabase = await createServerClient()

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single()

  if (!data) {
    return { site_name: "Dinamica Pro", logo_url: null, hero_image_url: null, hero_image_mobile_url: null }
  }

  return {
    ...data,
    hero_image_mobile_url: (data as any).hero_image_mobile_url ?? null,
  }
}

export async function updateSiteSettings(data: {
  siteName: string
  logoUrl: string | null
  heroImageUrl: string | null
  heroImageMobileUrl: string | null
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
    // Update stable columns (always exist)
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

    // Update mobile hero URL separately (column added in migration 033)
    if (data.heroImageMobileUrl !== undefined) {
      const { error: mobileError } = await supabase
        .from("site_settings")
        .update({ hero_image_mobile_url: data.heroImageMobileUrl })
        .eq("id", existing.id)

      if (mobileError) {
        console.log("[v0] updateSiteSettings mobile url error (run migration 033):", mobileError.message)
      }
    }
  }

  revalidatePath("/")
  revalidatePath("/admin/settings")

  return { success: true }
}
