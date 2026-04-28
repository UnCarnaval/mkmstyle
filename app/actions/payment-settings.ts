"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getPaymentMethodSettings() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("payment_method_settings").select("*").order("provider")

  if (error) {
    console.error("Error fetching payment methods:", error)
    return []
  }

  return data || []
}

export async function togglePaymentMethod(provider: string, isEnabled: boolean) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autorizado")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("No autorizado")
  }

  const { error } = await supabase
    .from("payment_method_settings")
    .update({ is_enabled: isEnabled })
    .eq("provider", provider)

  if (error) {
    console.error("Error updating payment method:", error)
    throw new Error("Error al actualizar método de pago")
  }

  return { success: true }
}
