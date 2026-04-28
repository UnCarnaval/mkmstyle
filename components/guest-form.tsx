"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GuestFormProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void
  onCancel: () => void
}

export function GuestForm({ onSubmit, onCancel }: GuestFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido"
    }

    if (!phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({ name, email, phone })
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Información de contacto
        </h3>
        <p className="text-sm text-slate-400">Completa tus datos para continuar con la compra</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-200">
            Nombre completo
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            className="glass-input"
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@ejemplo.com"
            className="glass-input"
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-200">
            Teléfono
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="glass-input"
          />
          {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 glass-button">
            Continuar
          </Button>
        </div>
      </form>
    </div>
  )
}
