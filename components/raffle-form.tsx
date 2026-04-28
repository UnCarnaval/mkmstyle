"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createRaffle, updateRaffle } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { X, ImageIcon } from "lucide-react"
import { swal } from "@/lib/swal"
import { upload } from "@vercel/blob/client"

interface RaffleFormProps {
  raffle?: any
}

export function RaffleForm({ raffle }: RaffleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(raffle?.image_url || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(raffle?.image_url || "")
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      swal.error("Error", "El archivo debe ser una imagen")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      swal.error("Error", "El archivo no puede superar los 5MB")
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview("")
    setImageUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget

    setLoading(true)

    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        setUploadingImage(true)
        const ext = imageFile.name.split(".").pop() || "png"
        const filename = `raffles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const blob = await upload(filename, imageFile, {
          access: "public",
          handleUploadUrl: "/api/upload-raffle-image",
          contentType: imageFile.type,
        })
        finalImageUrl = blob.url
        setUploadingImage(false)
      }

      if (!finalImageUrl) {
        swal.error("Error", "Debes subir una imagen para el sorteo")
        setLoading(false)
        return
      }

      const formData = new FormData(form)
      formData.set("image_url", finalImageUrl)

      const result = raffle ? await updateRaffle(raffle.id, formData) : await createRaffle(formData)

      if (result.error) {
        swal.error("Error", result.error)
        setLoading(false)
      } else {
        await swal.success("Éxito", raffle ? "Sorteo actualizado correctamente" : "Sorteo creado correctamente")
        router.push("/admin/raffles")
      }
    } catch (error) {
      console.error("Error:", error)
      swal.error("Error", error instanceof Error ? error.message : "Error al procesar el formulario")
      setLoading(false)
      setUploadingImage(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="editorial-card p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Título</label>
            <input
              type="text"
              name="title"
              defaultValue={raffle?.title}
              required
              className="editorial-input"
              placeholder="Ej: iPhone 15 Pro Max"
            />
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Imagen del sorteo</label>

            {imagePreview ? (
              <div className="relative w-full h-64 overflow-hidden border border-white/[0.07]">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 border border-white/20 hover:border-white bg-black/60 transition-colors"
                  aria-label="Quitar imagen"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border border-dashed border-white/15 hover:border-white/40 bg-[#121212] flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-neutral-500 mb-3" />
                <p className="text-neutral-400 text-sm mb-1">Click para subir una imagen</p>
                <p className="text-neutral-500 text-xs">PNG, JPG, WEBP (máx. 5MB)</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Precio del boleto ($)</label>
              <input
                type="number"
                name="ticket_price"
                defaultValue={raffle?.ticket_price}
                required
                min="0.01"
                step="0.01"
                className="editorial-input"
                placeholder="5.00"
              />
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Total de boletos</label>
              <input
                type="number"
                name="total_tickets"
                defaultValue={raffle?.total_tickets}
                required
                min="1"
                className="editorial-input"
                placeholder="10000"
              />
            </div>
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Mínimo por compra</label>
            <input
              type="number"
              name="min_tickets_per_purchase"
              defaultValue={raffle?.min_tickets_per_purchase || 1}
              required
              min="1"
              className="editorial-input"
              placeholder="1"
            />
            <p className="text-neutral-500 text-xs mt-2">
              Los usuarios no podrán comprar menos de esta cantidad. El máximo será el total de boletos disponibles.
            </p>
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Opciones de talla (opcional)</label>
            <p className="text-neutral-500 text-xs mb-3">
              Si el premio requiere talla (ropa, calzado), ingresa las opciones separadas por coma. Ej: XS, S, M, L, XL
            </p>
            <textarea
              name="size_options"
              defaultValue={Array.isArray(raffle?.size_options) ? raffle.size_options.join(", ") : raffle?.size_options || ""}
              rows={2}
              className="editorial-input"
              placeholder="XS, S, M, L, XL, XXL"
            />
          </div>

          <div>
            <label className="editorial-eyebrow text-neutral-400 mb-2 block">Fecha del sorteo</label>
            <input
              type="datetime-local"
              name="draw_date"
              defaultValue={raffle?.draw_date?.slice(0, 16)}
              required
              className="editorial-input"
            />
          </div>

          {raffle && (
            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Estado</label>
              <select name="status" defaultValue={raffle?.status} className="editorial-input">
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading || uploadingImage} className="editorial-button-primary flex-1">
              {uploadingImage ? "Subiendo imagen..." : loading ? "Guardando..." : raffle ? "Actualizar sorteo" : "Crear sorteo"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading || uploadingImage}
              className="editorial-button-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
