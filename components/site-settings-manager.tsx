"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { updateSiteSettings, uploadSiteImage } from "@/app/actions/site-settings"
import { swal } from "@/lib/swal"
import { useRouter } from "next/navigation"

interface SiteSettingsManagerProps {
  initialSettings: {
    site_name: string
    logo_url: string | null
    hero_image_url: string | null
    hero_image_mobile_url?: string | null
  }
}

export function SiteSettingsManager({ initialSettings }: SiteSettingsManagerProps) {
  const router = useRouter()
  const [siteName, setSiteName] = useState(initialSettings.site_name)
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url || "")
  const [heroImageUrl, setHeroImageUrl] = useState(initialSettings.hero_image_url || "")
  const [heroImageMobileUrl, setHeroImageMobileUrl] = useState(initialSettings.hero_image_mobile_url || "")
  const [uploading, setUploading] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingHeroMobile, setUploadingHeroMobile] = useState(false)
  const [saving, setSaving] = useState(false)

  const uploadViaAction = async (file: File, prefix: "logo" | "hero" | "hero-mobile"): Promise<string> => {
    const fd = new FormData()
    fd.append("file", file)
    return uploadSiteImage(fd, prefix)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadViaAction(file, "logo")
      setLogoUrl(url)
      swal.success("Logo subido correctamente")
    } catch (error: any) {
      swal.error("Error al subir el logo", error?.message || "")
      console.error("[v0] Logo upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    try {
      const url = await uploadViaAction(file, "hero")
      setHeroImageUrl(url)
      swal.success("Portada desktop subida correctamente")
    } catch (error: any) {
      swal.error("Error al subir la portada", error?.message || "")
      console.error("[v0] Hero upload error:", error)
    } finally {
      setUploadingHero(false)
    }
  }

  const handleHeroMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHeroMobile(true)
    try {
      const url = await uploadViaAction(file, "hero-mobile")
      setHeroImageMobileUrl(url)
      swal.success("Portada mobile subida correctamente")
    } catch (error: any) {
      swal.error("Error al subir la portada mobile", error?.message || "")
      console.error("[v0] Hero mobile upload error:", error)
    } finally {
      setUploadingHeroMobile(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSiteSettings({
        siteName,
        logoUrl: logoUrl || null,
        heroImageUrl: heroImageUrl || null,
        heroImageMobileUrl: heroImageMobileUrl || null,
      })
      swal.success("Configuración guardada correctamente")
      router.refresh()
    } catch (error: any) {
      swal.error("Error al guardar configuración", error.message || "")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="editorial-eyebrow text-neutral-400 mb-2 block">Nombre del sitio</label>
        <input
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="MakingMoney Sorteos"
          className="editorial-input"
        />
      </div>

      <div>
        <label className="editorial-eyebrow text-neutral-400 mb-2 block">Logo del sitio</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="editorial-input flex-1"
          />
          <button
            type="button"
            onClick={() => document.getElementById("logoFile")?.click()}
            disabled={uploading}
            className="editorial-button-secondary"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir logo
              </>
            )}
          </button>
          <input id="logoFile" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </div>
        {logoUrl && (
          <div className="mt-4 p-4 border border-white/[0.07] bg-[#121212]">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Vista previa</p>
            <img src={logoUrl || "/placeholder.svg"} alt="Logo" className="h-16 object-contain" />
          </div>
        )}
      </div>

      {/* Desktop hero */}
      <div>
        <label className="editorial-eyebrow text-neutral-400 mb-2 block">Portada — Desktop</label>
        <p className="text-xs text-neutral-500 mb-3">
          Imagen principal en pantallas medianas y grandes (≥768 px). Si no configuras la versión mobile, esta imagen también se usará en móvil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder="https://example.com/portada-desktop.jpg"
            className="editorial-input flex-1"
          />
          <button
            type="button"
            onClick={() => document.getElementById("heroFile")?.click()}
            disabled={uploadingHero}
            className="editorial-button-secondary"
          >
            {uploadingHero ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Cambiar portada
              </>
            )}
          </button>
          <input id="heroFile" type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
        </div>
        {heroImageUrl && (
          <div className="mt-4 p-4 border border-white/[0.07] bg-[#121212]">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Vista previa</p>
            <img src={heroImageUrl || "/placeholder.svg"} alt="Portada desktop" className="w-full max-h-64 object-cover" />
          </div>
        )}
        {heroImageUrl && (
          <button
            type="button"
            onClick={() => setHeroImageUrl("")}
            className="text-xs text-neutral-500 hover:text-white mt-2 underline-offset-2 hover:underline transition-colors"
          >
            Quitar portada desktop
          </button>
        )}
      </div>

      {/* Mobile hero */}
      <div>
        <label className="editorial-eyebrow text-neutral-400 mb-2 block">Portada — Mobile</label>
        <p className="text-xs text-neutral-500 mb-3">
          Imagen exclusiva para móviles (&lt;768 px). Recomendado formato vertical (9:16 o 4:5).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={heroImageMobileUrl}
            onChange={(e) => setHeroImageMobileUrl(e.target.value)}
            placeholder="https://example.com/portada-mobile.jpg"
            className="editorial-input flex-1"
          />
          <button
            type="button"
            onClick={() => document.getElementById("heroMobileFile")?.click()}
            disabled={uploadingHeroMobile}
            className="editorial-button-secondary"
          >
            {uploadingHeroMobile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Cambiar portada
              </>
            )}
          </button>
          <input id="heroMobileFile" type="file" accept="image/*" onChange={handleHeroMobileUpload} className="hidden" />
        </div>
        {heroImageMobileUrl && (
          <div className="mt-4 p-4 border border-white/[0.07] bg-[#121212]">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Vista previa</p>
            <img src={heroImageMobileUrl || "/placeholder.svg"} alt="Portada mobile" className="w-full max-h-64 object-cover object-top" />
          </div>
        )}
        {heroImageMobileUrl && (
          <button
            type="button"
            onClick={() => setHeroImageMobileUrl("")}
            className="text-xs text-neutral-500 hover:text-white mt-2 underline-offset-2 hover:underline transition-colors"
          >
            Quitar portada mobile
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !siteName}
        className="editorial-button-primary w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar configuración"
        )}
      </button>
    </div>
  )
}
