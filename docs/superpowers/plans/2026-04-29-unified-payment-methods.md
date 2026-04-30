# Manager Unificado de Métodos de Pago — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir al admin gestionar dinámicamente dos tipos de métodos de pago manuales (cuentas bancarias con cédula opcional y links de pago tipo PayPal/Stripe), y renderizarlos correctamente en el modal de transferencia bancaria del checkout.

**Architecture:** Se extiende la tabla `bank_accounts` con un discriminador `entry_type` (`bank` | `payment_link`) y campos opcionales por tipo (`cedula`, `username`, `payment_link`, `currency`). Las server actions validan según el tipo y persisten dejando NULL los campos del otro tipo. El admin manager (`bank-accounts-manager.tsx`) muestra un selector de tipo y campos condicionales. El modal de checkout (`bank-transfer-checkout.tsx`) ramifica el panel de detalle por `entry_type`. Se agrega upload de archivo de logo reusando el endpoint de Vercel Blob.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Postgres, Tailwind v4, shadcn/ui, Vercel Blob, SweetAlert2.

**Estado actual del spec:** Requisitos #1–#5 del spec `2026-04-27-sorteos-ui-changes-design.md` ya están implementados en código. Este plan cubre **únicamente el Requisito #6**.

**Sin tests automatizados:** El proyecto no tiene suite de testing (ver CLAUDE.md). Cada tarea termina en verificación manual + commit. No se escriben tests unitarios.

---

### Task 1: Migración de BD — extender `bank_accounts`

**Files:**
- Create: `scripts/032_payment_methods.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- Agrega soporte para entradas tipo "payment_link" (PayPal, Stripe Link, etc.)
-- y campos opcionales (cedula, currency) para cuentas bancarias.

ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'bank'
    CHECK (entry_type IN ('bank','payment_link')),
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS cedula TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS payment_link TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

ALTER TABLE bank_accounts
  ALTER COLUMN account_number DROP NOT NULL,
  ALTER COLUMN account_holder DROP NOT NULL,
  ALTER COLUMN account_type DROP NOT NULL;
```

- [ ] **Step 2: Aplicar la migración manualmente en Supabase SQL Editor**

Pegar el contenido de `scripts/032_payment_methods.sql` y ejecutar.
Esperado: "Success. No rows returned." y los nuevos columns visibles en `Database > Tables > bank_accounts`.

- [ ] **Step 3: Verificar schema con psql o Supabase Table Editor**

Confirmar columnas: `entry_type` (text, default 'bank'), `currency` (text, null), `cedula` (text, null), `username` (text, null), `payment_link` (text, null), `sort_order` (int, default 0).
Confirmar que `account_number`, `account_holder`, `account_type` ahora son NULLable.

- [ ] **Step 4: Commit**

```bash
git add scripts/032_payment_methods.sql
git commit -m "feat(db): add payment_link entry type and optional fields to bank_accounts"
```

---

### Task 2: Server actions — validación condicional por tipo

**Files:**
- Modify: `app/actions/payments.ts:261-389`

- [ ] **Step 1: Reemplazar `createBankAccount` con validación condicional**

Reemplazar el bloque actual (`payments.ts:261-299`):

```ts
type EntryType = "bank" | "payment_link"

interface PaymentMethodInput {
  entryType: EntryType
  bankName: string
  bankLogo?: string
  currency?: string | null
  // entry_type='bank'
  accountHolder?: string
  accountNumber?: string
  accountType?: string
  cedula?: string | null
  // entry_type='payment_link'
  username?: string
  paymentLink?: string
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export async function createBankAccount(data: PaymentMethodInput) {
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

  if (!data.bankName?.trim()) {
    throw new Error("El nombre es requerido")
  }

  const row: Record<string, any> = {
    entry_type: data.entryType,
    bank_name: data.bankName.trim(),
    bank_logo: data.bankLogo?.trim() || null,
    currency: data.currency?.trim() || null,
  }

  if (data.entryType === "bank") {
    if (!data.accountHolder?.trim()) throw new Error("El titular es requerido")
    if (!data.accountNumber?.trim()) throw new Error("El número de cuenta es requerido")
    row.account_holder = data.accountHolder.trim()
    row.account_number = data.accountNumber.trim()
    row.account_type = data.accountType?.trim() || "Cuenta Corriente"
    row.cedula = data.cedula?.trim() || null
    row.username = null
    row.payment_link = null
  } else if (data.entryType === "payment_link") {
    if (!data.username?.trim()) throw new Error("El usuario es requerido")
    if (!data.paymentLink?.trim()) throw new Error("El link de pago es requerido")
    if (!isValidUrl(data.paymentLink.trim())) throw new Error("El link de pago no es una URL válida")
    row.username = data.username.trim()
    row.payment_link = data.paymentLink.trim()
    row.account_holder = null
    row.account_number = null
    row.account_type = null
    row.cedula = null
  } else {
    throw new Error("Tipo de entrada inválido")
  }

  const { data: accountData, error } = await supabase
    .from("bank_accounts")
    .insert(row)
    .select()
    .single()

  if (error) {
    console.log("[v0] createBankAccount error:", error)
    throw new Error("Error al crear el método de pago")
  }

  return { success: true, account: accountData }
}
```

- [ ] **Step 2: Reemplazar `updateBankAccount` con la misma validación + `isActive`**

Reemplazar el bloque actual (`payments.ts:301-343`):

```ts
export async function updateBankAccount(
  id: string,
  data: PaymentMethodInput & { isActive: boolean },
) {
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

  if (!data.bankName?.trim()) {
    throw new Error("El nombre es requerido")
  }

  const row: Record<string, any> = {
    entry_type: data.entryType,
    bank_name: data.bankName.trim(),
    bank_logo: data.bankLogo?.trim() || null,
    currency: data.currency?.trim() || null,
    is_active: data.isActive,
  }

  if (data.entryType === "bank") {
    if (!data.accountHolder?.trim()) throw new Error("El titular es requerido")
    if (!data.accountNumber?.trim()) throw new Error("El número de cuenta es requerido")
    row.account_holder = data.accountHolder.trim()
    row.account_number = data.accountNumber.trim()
    row.account_type = data.accountType?.trim() || "Cuenta Corriente"
    row.cedula = data.cedula?.trim() || null
    row.username = null
    row.payment_link = null
  } else if (data.entryType === "payment_link") {
    if (!data.username?.trim()) throw new Error("El usuario es requerido")
    if (!data.paymentLink?.trim()) throw new Error("El link de pago es requerido")
    if (!isValidUrl(data.paymentLink.trim())) throw new Error("El link de pago no es una URL válida")
    row.username = data.username.trim()
    row.payment_link = data.paymentLink.trim()
    row.account_holder = null
    row.account_number = null
    row.account_type = null
    row.cedula = null
  } else {
    throw new Error("Tipo de entrada inválido")
  }

  const { error } = await supabase.from("bank_accounts").update(row).eq("id", id)

  if (error) {
    console.log("[v0] updateBankAccount error:", error)
    throw new Error("Error al actualizar el método de pago")
  }

  return { success: true }
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `npx tsc --noEmit`
Esperado: 0 errores en `app/actions/payments.ts`. (El proyecto tiene `ignoreBuildErrors: true`, pero queremos código sano.)

- [ ] **Step 4: Commit**

```bash
git add app/actions/payments.ts
git commit -m "feat(payments): validate bank_accounts payload by entry_type in server actions"
```

---

### Task 3: Endpoint de upload — permitir prefijo `bank-logos/`

**Files:**
- Modify: `app/api/upload-raffle-image/route.ts:11-18`

El endpoint actual solo acepta paths que empiecen con `raffles/`. Lo extendemos para aceptar también `bank-logos/`, sin crear un endpoint nuevo.

- [ ] **Step 1: Permitir prefijo `bank-logos/`**

Reemplazar el bloque `onBeforeGenerateToken` (`route.ts:11-19`):

```ts
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("raffles/") && !pathname.startsWith("bank-logos/")) {
          throw new Error("Ruta inválida para imagen")
        }
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
          maximumSizeInBytes: 5 * 1024 * 1024,
        }
      },
```

(Bajamos también el límite a 5 MB por consistencia con el resto del proyecto y con el spec.)

- [ ] **Step 2: Commit**

```bash
git add app/api/upload-raffle-image/route.ts
git commit -m "feat(upload): allow bank-logos/ path prefix and cap at 5MB"
```

---

### Task 4: Admin manager — selector de tipo y campos condicionales

**Files:**
- Modify: `components/bank-accounts-manager.tsx` (reescritura completa del componente)

- [ ] **Step 1: Reemplazar el componente completo**

Reemplazar todo el contenido de `components/bank-accounts-manager.tsx`:

```tsx
"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Plus, Edit, Trash2, Building2, Check, X, LinkIcon, Upload, Loader2 } from "lucide-react"
import { upload } from "@vercel/blob/client"
import { createBankAccount, updateBankAccount, deleteBankAccount } from "@/app/actions/payments"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"

type EntryType = "bank" | "payment_link"

interface BankAccount {
  id: string
  entry_type: EntryType
  bank_name: string
  bank_logo?: string | null
  currency?: string | null
  is_active: boolean
  // bank
  account_holder?: string | null
  account_number?: string | null
  account_type?: string | null
  cedula?: string | null
  // payment_link
  username?: string | null
  payment_link?: string | null
}

const EMPTY_FORM = {
  entryType: "bank" as EntryType,
  bankName: "",
  bankLogo: "",
  currency: "",
  accountHolder: "",
  accountNumber: "",
  accountType: "Cuenta Corriente",
  cedula: "",
  username: "",
  paymentLink: "",
}

export function BankAccountsManager({ initialAccounts }: { initialAccounts: BankAccount[] }) {
  const router = useRouter()
  const [accounts] = useState(initialAccounts)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        const account = accounts.find((a) => a.id === editingId)
        await updateBankAccount(editingId, {
          entryType: formData.entryType,
          bankName: formData.bankName,
          bankLogo: formData.bankLogo,
          currency: formData.currency || null,
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
          accountType: formData.accountType,
          cedula: formData.cedula || null,
          username: formData.username,
          paymentLink: formData.paymentLink,
          isActive: account?.is_active ?? true,
        })
        swal.success("Método actualizado correctamente")
      } else {
        await createBankAccount({
          entryType: formData.entryType,
          bankName: formData.bankName,
          bankLogo: formData.bankLogo,
          currency: formData.currency || null,
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
          accountType: formData.accountType,
          cedula: formData.cedula || null,
          username: formData.username,
          paymentLink: formData.paymentLink,
        })
        swal.success("Método agregado correctamente")
      }
      router.refresh()
      resetForm()
    } catch (error: any) {
      swal.error("Error", error.message)
    }
  }

  const handleEdit = (account: BankAccount) => {
    setFormData({
      entryType: account.entry_type,
      bankName: account.bank_name,
      bankLogo: account.bank_logo || "",
      currency: account.currency || "",
      accountHolder: account.account_holder || "",
      accountNumber: account.account_number || "",
      accountType: account.account_type || "Cuenta Corriente",
      cedula: account.cedula || "",
      username: account.username || "",
      paymentLink: account.payment_link || "",
    })
    setEditingId(account.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirm(
      "¿Eliminar método de pago?",
      "Esta acción no se puede deshacer",
      "Eliminar",
      "Cancelar",
    )
    if (confirmed) {
      try {
        await deleteBankAccount(id)
        swal.success("Método eliminado correctamente")
        router.refresh()
      } catch (error: any) {
        swal.error(`Error: ${error.message}`)
      }
    }
  }

  const handleToggleActive = async (account: BankAccount) => {
    try {
      await updateBankAccount(account.id, {
        entryType: account.entry_type,
        bankName: account.bank_name,
        bankLogo: account.bank_logo || "",
        currency: account.currency || null,
        accountHolder: account.account_holder || "",
        accountNumber: account.account_number || "",
        accountType: account.account_type || "",
        cedula: account.cedula || null,
        username: account.username || "",
        paymentLink: account.payment_link || "",
        isActive: !account.is_active,
      })
      swal.success(account.is_active ? "Método desactivado" : "Método activado")
      router.refresh()
    } catch (error: any) {
      swal.error(`Error: ${error.message}`)
    }
  }

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploadingLogo(true)
    try {
      const ext = file.name.split(".").pop() || "png"
      const filename = `bank-logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const blob = await upload(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload-raffle-image",
        contentType: file.type,
      })
      setFormData((prev) => ({ ...prev, bankLogo: blob.url }))
    } catch (err: any) {
      console.error("[v0] Error uploading bank logo:", err)
      swal.error("Error", err?.message || "No se pudo subir el logo")
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const isBank = formData.entryType === "bank"

  return (
    <div className="space-y-4">
      {accounts.length === 0 && !isAdding && (
        <div className="text-center py-10 border border-white/[0.07]">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center relative">
            <div className="absolute inset-0 blur-xl rounded-full bg-white/10" />
            <Building2 className="w-6 h-6 relative z-10 text-white" />
          </div>
          <p className="text-neutral-400 text-sm">No hay métodos de pago configurados</p>
          <p className="text-neutral-500 text-xs mt-1">Agrega un banco o un link de pago</p>
        </div>
      )}

      {accounts.map((account) => (
        <div key={account.id} className="border border-white/[0.07] bg-[#0d0d0d] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {account.bank_logo ? (
                <div className="w-14 h-14 bg-white p-2 flex items-center justify-center flex-shrink-0">
                  <img
                    src={account.bank_logo || "/placeholder.svg"}
                    alt={account.bank_name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 border border-white/[0.07] bg-[#121212] flex items-center justify-center flex-shrink-0">
                  {account.entry_type === "payment_link" ? (
                    <LinkIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Building2 className="w-5 h-5 text-white" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-white">{account.bank_name}</h4>
                  {account.currency && (
                    <span className="text-[10px] font-bold tracking-wider text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                      {account.currency}
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 border border-white/10 px-2 py-0.5 rounded">
                    {account.entry_type === "payment_link" ? "Link de pago" : "Banco"}
                  </span>
                  <button
                    onClick={() => handleToggleActive(account)}
                    className={account.is_active ? "badge badge-success" : "badge badge-danger"}
                  >
                    {account.is_active ? "Activa" : "Inactiva"}
                  </button>
                </div>
                {account.entry_type === "bank" ? (
                  <>
                    <p className="text-sm text-neutral-300">{account.account_holder}</p>
                    <p className="text-sm text-neutral-400 font-mono">{account.account_number}</p>
                    <p className="text-xs text-neutral-500">{account.account_type}</p>
                    {account.cedula && (
                      <p className="text-xs text-neutral-500">Cédula: {account.cedula}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-neutral-300">Usuario: {account.username}</p>
                    <p className="text-xs text-neutral-500 break-all">{account.payment_link}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => handleEdit(account)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                aria-label="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(account.id)}
                className="p-2 text-neutral-400 hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {isAdding ? (
        <div className="border border-white/[0.07] bg-[#0d0d0d] p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Tipo de método</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, entryType: "bank" })}
                  className={`p-3 border text-sm font-semibold transition-colors ${
                    isBank
                      ? "border-cyan-400 text-white bg-cyan-500/10"
                      : "border-white/10 text-neutral-400 hover:border-white/30"
                  }`}
                >
                  <Building2 className="w-4 h-4 inline-block mr-2" />
                  Banco
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, entryType: "payment_link" })}
                  className={`p-3 border text-sm font-semibold transition-colors ${
                    !isBank
                      ? "border-cyan-400 text-white bg-cyan-500/10"
                      : "border-white/10 text-neutral-400 hover:border-white/30"
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline-block mr-2" />
                  Link de pago
                </button>
              </div>
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">
                {isBank ? "Nombre del banco" : "Nombre del método"}
              </label>
              <input
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder={isBank ? "Ej: Banco Popular" : "Ej: PayPal"}
                required
                className="editorial-input"
              />
            </div>

            {isBank ? (
              <>
                <div>
                  <label className="editorial-eyebrow text-neutral-400 mb-2 block">Titular de la cuenta</label>
                  <input
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                    placeholder="Nombre completo"
                    required
                    className="editorial-input"
                  />
                </div>

                <div>
                  <label className="editorial-eyebrow text-neutral-400 mb-2 block">Número de cuenta</label>
                  <input
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="1234567890"
                    required
                    className="editorial-input"
                  />
                </div>

                <div>
                  <label className="editorial-eyebrow text-neutral-400 mb-2 block">Tipo de cuenta</label>
                  <input
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    placeholder="Cuenta Corriente / Cuenta de Ahorros"
                    className="editorial-input"
                  />
                </div>

                <div>
                  <label className="editorial-eyebrow text-neutral-400 mb-2 block">Cédula (opcional)</label>
                  <input
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    placeholder="000-0000000-0"
                    className="editorial-input"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="editorial-eyebrow text-neutral-400 mb-2 block">Usuario</label>
                  <input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ej: makingmoney"
                    required
                    className="editorial-input"
                  />
                </div>

                <div>
                  <label className="editorial-eyebrow text-neutral-400 mb-2 block">Link de pago</label>
                  <input
                    type="url"
                    value={formData.paymentLink}
                    onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
                    placeholder="https://paypal.me/makingmoney"
                    required
                    className="editorial-input"
                  />
                </div>
              </>
            )}

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Moneda (opcional)</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="editorial-input"
              >
                <option value="">Sin moneda</option>
                <option value="DOP">DOP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Logo</label>
              <input
                value={formData.bankLogo}
                onChange={(e) => setFormData({ ...formData, bankLogo: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="editorial-input"
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="editorial-button-secondary !flex-none"
                >
                  {uploadingLogo ? (
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
                <p className="text-xs text-neutral-500">PNG, JPG o WEBP (máx. 5MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
              />
              {formData.bankLogo && (
                <div className="mt-3 p-2 bg-white w-24 h-24 flex items-center justify-center">
                  <img
                    src={formData.bankLogo || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="editorial-button-primary flex-1" disabled={uploadingLogo}>
                <Check className="w-4 h-4" />
                {editingId ? "Actualizar" : "Agregar"}
              </button>
              <button type="button" onClick={resetForm} className="editorial-button-secondary flex-1">
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full border border-dashed border-white/15 hover:border-white/40 text-neutral-400 hover:text-white transition-colors py-4 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Método de Pago
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar que los datos en `app/admin/settings/page.tsx` (consumidor) se carguen igual**

Run: `grep -n "BankAccountsManager\|getAllBankAccounts" app/admin/settings/page.tsx`
Esperado: pasa `initialAccounts={accounts}` y `accounts` viene de `getAllBankAccounts()` o equivalente. Como `getAllBankAccounts` devuelve `*` sin cambios, los nuevos campos llegan automáticamente.

Si la prop tiene un tipo más estricto que omite los nuevos campos, ajustar el tipo (ampliar el cast). Probable: el tipo está inline o como `BankAccount[]` importado del propio manager — al exportar el nuevo `BankAccount` los tipos se alinean.

- [ ] **Step 3: Iniciar el dev server y probar el manager**

```bash
npm run dev
```

Ir a `http://localhost:3000/admin/settings`. Confirmar:
- Click en "Agregar Método de Pago" → aparece el form con tabs `Banco` / `Link de pago`.
- Tab `Banco` muestra: Nombre del banco, Titular, Número de cuenta, Tipo, **Cédula (opcional)**, Moneda, Logo.
- Tab `Link de pago` muestra: Nombre del método, **Usuario**, **Link de pago**, Moneda, Logo.
- Cambiar de tab actualiza el render condicional sin romper el form.
- Click en "Subir logo" abre el file picker y al subir popula la URL automáticamente.
- Crear un banco con cédula y moneda USD → aparece en el listado con badge USD y "Cédula: ...".
- Crear un link de pago (ej. PayPal/paypal.me) → aparece en el listado con badge "Link de pago".

Si la migración no está aplicada en Supabase, los inserts fallarán con error de columna no encontrada — aplicar la migración primero.

- [ ] **Step 4: Commit**

```bash
git add components/bank-accounts-manager.tsx
git commit -m "feat(admin): unified bank/payment-link manager with file upload for logo"
```

---

### Task 5: Modal de checkout — panel de detalle ramificado por `entry_type`

**Files:**
- Modify: `components/bank-transfer-checkout.tsx:265-342`

- [ ] **Step 1: Reemplazar el bloque del panel del banco seleccionado**

En `components/bank-transfer-checkout.tsx`, dentro del `{!loadingBanks && bankAccounts.length > 0 && (...)}`, reemplazar el bloque actual `selectedBank && (<Card>...)` (líneas 265-342) por:

```tsx
{selectedBank && (
  <Card className="p-3 sm:p-4 bg-slate-800/50 border-slate-700">
    <div className="flex items-center gap-2 sm:gap-3 mb-3">
      {selectedBank.bank_logo ? (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
          <img
            src={selectedBank.bank_logo || "/placeholder.svg"}
            alt={selectedBank.bank_name}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
      )}
      <h3 className="font-semibold text-white text-sm sm:text-base flex-1 break-words">
        {selectedBank.bank_name}
      </h3>
      {selectedBank.currency && (
        <span className="text-[10px] font-bold tracking-wider text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded flex-shrink-0">
          {selectedBank.currency}
        </span>
      )}
    </div>

    {selectedBank.entry_type === "payment_link" ? (
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Usuario:</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm flex-1 break-words">{selectedBank.username}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(selectedBank.username, `user-${selectedBank.id}`)}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              {copiedField === `user-${selectedBank.id}` ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <a
          href={selectedBank.payment_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-md text-sm transition-colors"
        >
          Pagar en {selectedBank.bank_name}
        </a>
      </div>
    ) : (
      <div className="space-y-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Titular:</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm flex-1 break-words">{selectedBank.account_holder}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(selectedBank.account_holder, `holder-${selectedBank.id}`)}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              {copiedField === `holder-${selectedBank.id}` ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Número de cuenta:</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono text-sm flex-1 break-all">{selectedBank.account_number}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(selectedBank.account_number, `account-${selectedBank.id}`)}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              {copiedField === `account-${selectedBank.id}` ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Tipo:</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm flex-1">{selectedBank.account_type}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(selectedBank.account_type, `type-${selectedBank.id}`)}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              {copiedField === `type-${selectedBank.id}` ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {selectedBank.cedula && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Cédula:</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm flex-1 break-all">{selectedBank.cedula}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(selectedBank.cedula!, `cedula-${selectedBank.id}`)}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                {copiedField === `cedula-${selectedBank.id}` ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    )}
  </Card>
)}
```

- [ ] **Step 2: Verificar el dev server y los flujos del modal**

Con `npm run dev` corriendo:

1. Crear (desde admin) al menos un Banco con cédula y moneda USD, y al menos un Link de pago.
2. Ir a un sorteo activo y abrir el modal de transferencia bancaria.
3. Confirmar:
   - La fila de logos arriba muestra todos los items activos (banco + link).
   - Al seleccionar el Banco: aparece el panel con titular, número de cuenta, tipo, **Cédula** (con copy button), badge **USD** en la cabecera.
   - Al seleccionar el Link de pago: aparece "Usuario: ..." con copy + botón **"Pagar en {nombre}"** que abre el link en nueva pestaña (con `target="_blank"` y `rel="noopener noreferrer"`).
   - El form de comprobante (referencia + screenshot) sigue funcionando para ambos tipos.
   - El submit limpia el form pero no cierra el modal (regresión check del Requisito #4).

- [ ] **Step 3: Commit**

```bash
git add components/bank-transfer-checkout.tsx
git commit -m "feat(checkout): branch detail panel by entry_type with currency badge and cedula"
```

---

### Task 6: Verificación manual integral

- [ ] **Step 1: Validación servidor (errores)**

Con dev server corriendo, en `/admin/settings`:
- Intentar guardar un Banco sin titular → confirmar SweetAlert con "El titular es requerido" (en español).
- Intentar guardar un Banco sin número de cuenta → confirmar "El número de cuenta es requerido".
- Intentar guardar un Link de pago sin usuario → confirmar "El usuario es requerido".
- Intentar guardar un Link de pago sin URL → confirmar "El link de pago es requerido".
- Intentar guardar un Link de pago con `paymentLink="hola"` (no URL) → confirmar "El link de pago no es una URL válida".

- [ ] **Step 2: Persistencia y edición**

- Editar un banco existente → cambiar el tipo a Link de pago → confirmar que al guardar los campos del banco quedan NULL en BD y los del link se guardan.
- Editar un link de pago → cambiar el tipo a Banco → confirmar que `username` y `payment_link` quedan NULL.
- Verificar en Supabase Table Editor que los rows muestran NULL en los campos del tipo opuesto.

- [ ] **Step 3: Compatibilidad con datos previos**

- Confirmar que los rows que existían antes de la migración aparecen en el listado con tipo "Banco" (default).
- Confirmar que su detalle en el modal de checkout sigue funcionando igual que antes (titular, número, tipo, copy buttons).

- [ ] **Step 4: Toggle activa/inactiva y eliminación**

- Click en el badge "Activa" / "Inactiva" → confirmar que el cambio se persiste.
- Una entrada inactiva NO debe aparecer en la fila de logos del modal de checkout (`getBankAccounts` filtra por `is_active = true`).
- Eliminar una entrada → confirmar que desaparece del listado y de la BD.

- [ ] **Step 5: Commit final**

Si hay ajustes menores producto de la verificación, commitearlos. Si todo pasa sin cambios, no hace falta commit adicional.

---

## Archivos finales tocados

**Creados:**
- `scripts/032_payment_methods.sql`

**Modificados:**
- `app/actions/payments.ts` (createBankAccount, updateBankAccount)
- `app/api/upload-raffle-image/route.ts` (allowed prefixes, max size)
- `components/bank-accounts-manager.tsx` (reescritura)
- `components/bank-transfer-checkout.tsx` (panel de detalle ramificado)

**Sin tocar (ya implementados según el spec):**
- `components/raffle-form.tsx` (descripción ya removida)
- `app/actions/admin.ts` (`description = ""` ya aplicado)
- `app/admin/raffles/page.tsx` (fallback al título ya aplicado)
- `app/actions/stripe.ts` (fallback al título ya aplicado)
- `app/actions/site-settings.ts` (heroImageUrl ya soportado)
- `components/site-settings-manager.tsx` ("Cambiar portada" ya implementado)
- `components/whatsapp-bubble.tsx` (número actualizado)
- `components/hero.tsx` y `app/page.tsx` (HeroRotator ya reemplazado)
- `components/bank-transfer-checkout.tsx` Requisito #4 (no auto-cierre) y #5 (fila de logos) ya aplicados; este plan solo agrega la rama por `entry_type` y el badge de moneda.
