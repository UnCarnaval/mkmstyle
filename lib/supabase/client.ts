import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

let supabaseInstance: SupabaseClient | null = null
let initAttempted = false

function canMakeFetchRequests(): boolean {
  if (typeof window === "undefined") return false

  // Check if we're in v0 preview environment which blocks fetch
  const isV0Preview =
    typeof window !== "undefined" &&
    (window.location?.hostname?.includes("vusercontent.net") || window.location?.hostname?.includes("v0.dev"))

  return !isV0Preview
}

export function getSupabase(): SupabaseClient | null {
  if (!canMakeFetchRequests()) {
    return null
  }

  if (!supabaseInstance && !initAttempted) {
    initAttempted = true
    try {
      supabaseInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    } catch (error) {
      console.error("[v0] Error creating Supabase client:", error)
      return null
    }
  }
  return supabaseInstance
}

export const supabase = {
  get auth() {
    const client = getSupabase()
    if (!client) {
      // Return a no-op auth object for v0 preview
      return {
        signInWithPassword: async () => ({ data: null, error: new Error("Auth not available in preview") }),
        signUp: async () => ({ data: null, error: new Error("Auth not available in preview") }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      } as any
    }
    return client.auth
  },
  get from() {
    const client = getSupabase()
    if (!client) return () => ({ select: () => ({ data: null, error: new Error("DB not available") }) }) as any
    return client.from.bind(client)
  },
  get storage() {
    const client = getSupabase()
    if (!client) return { from: () => ({}) } as any
    return client.storage
  },
}
