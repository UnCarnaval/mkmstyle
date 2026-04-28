"use client"

import type React from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
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
            Estás en modo preview. El registro funciona en{" "}
            <a href="https://dinamicapro.com" className="underline font-semibold hover:text-[#fbbf24]">
              dinamicapro.com
            </a>
          </p>
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="editorial-eyebrow text-neutral-400 mb-2 block">
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Tu nombre"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="editorial-input"
          />
        </div>

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

        <div>
          <label htmlFor="repeat-password" className="editorial-eyebrow text-neutral-400 mb-2 block">
            Repetir contraseña
          </label>
          <input
            id="repeat-password"
            type="password"
            placeholder="••••••••"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
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
              Creando cuenta...
            </>
          ) : (
            "Crear cuenta"
          )}
        </button>

        <p className="text-center text-sm text-neutral-500 pt-2">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-white hover:text-neutral-200 transition-colors font-semibold tracking-wider uppercase text-xs"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </>
  )
}
