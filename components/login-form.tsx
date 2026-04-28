"use client"

import type React from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const hostname = window.location?.hostname || ""
    if (hostname.includes("vusercontent.net") || hostname.includes("v0.dev")) {
      setIsPreview(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      router.push("/admin")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isPreview && (
        <div className="border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-4 mb-6">
          <p className="text-sm text-[#f59e0b] text-center">
            Estás en modo preview. El login funciona en{" "}
            <a href="https://dinamicapro.com" className="underline font-semibold hover:text-[#fbbf24]">
              dinamicapro.com
            </a>
          </p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="editorial-eyebrow text-neutral-400 mb-2 block">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="editorial-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="editorial-eyebrow text-neutral-400 mb-2 block">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="editorial-input"
          />
        </div>

        {error && (
          <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 p-3">
            <p className="text-sm text-[#ef4444] text-center">{error}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="editorial-button-primary w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>

        <p className="text-center text-sm text-neutral-500 pt-2">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/sign-up"
            className="text-white hover:text-neutral-200 transition-colors font-semibold tracking-wider uppercase text-xs"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </>
  )
}
