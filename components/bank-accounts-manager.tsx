"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Building2, Check, X } from "lucide-react"
import { createBankAccount, updateBankAccount, deleteBankAccount } from "@/app/actions/payments"
import { useRouter } from "next/navigation"
import { swal } from "@/lib/swal"

interface BankAccount {
  id: string
  bank_name: string
  account_holder: string
  account_number: string
  account_type: string
  is_active: boolean
  bank_logo?: string
}

export function BankAccountsManager({ initialAccounts }: { initialAccounts: BankAccount[] }) {
  const router = useRouter()
  const [accounts, setAccounts] = useState(initialAccounts)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    accountType: "Cuenta Corriente",
    bankLogo: "",
  })

  const resetForm = () => {
    setFormData({
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      accountType: "Cuenta Corriente",
      bankLogo: "",
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        const account = accounts.find((a) => a.id === editingId)
        await updateBankAccount(editingId, {
          ...formData,
          isActive: account?.is_active || true,
        })
        swal.success("Cuenta actualizada correctamente")
      } else {
        await createBankAccount(formData)
        swal.success("Cuenta agregada correctamente")
      }
      router.refresh()
      resetForm()
    } catch (error: any) {
      swal.error("Error", error.message)
    }
  }

  const handleEdit = (account: BankAccount) => {
    setFormData({
      bankName: account.bank_name,
      accountHolder: account.account_holder,
      accountNumber: account.account_number,
      accountType: account.account_type,
      bankLogo: account.bank_logo || "",
    })
    setEditingId(account.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirm(
      "¿Eliminar cuenta?",
      "Esta acción no se puede deshacer",
      "Eliminar",
      "Cancelar",
    )
    if (confirmed) {
      try {
        await deleteBankAccount(id)
        swal.success("Cuenta eliminada correctamente")
        router.refresh()
      } catch (error: any) {
        swal.error(`Error: ${error.message}`)
      }
    }
  }

  const handleToggleActive = async (account: BankAccount) => {
    try {
      await updateBankAccount(account.id, {
        bankName: account.bank_name,
        accountHolder: account.account_holder,
        accountNumber: account.account_number,
        accountType: account.account_type,
        bankLogo: account.bank_logo,
        isActive: !account.is_active,
      })
      swal.success(account.is_active ? "Cuenta desactivada" : "Cuenta activada")
      router.refresh()
    } catch (error: any) {
      swal.error(`Error: ${error.message}`)
    }
  }

  return (
    <div className="space-y-4">
      {accounts.length === 0 && !isAdding && (
        <div className="text-center py-10 border border-white/[0.07]">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center relative">
            <div className="absolute inset-0 blur-xl rounded-full bg-white/10" />
            <Building2 className="w-6 h-6 relative z-10 text-white" />
          </div>
          <p className="text-neutral-400 text-sm">No hay cuentas bancarias configuradas</p>
          <p className="text-neutral-500 text-xs mt-1">Agrega una cuenta para recibir transferencias</p>
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
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-white">{account.bank_name}</h4>
                  <button
                    onClick={() => handleToggleActive(account)}
                    className={account.is_active ? "badge badge-success" : "badge badge-danger"}
                  >
                    {account.is_active ? "Activa" : "Inactiva"}
                  </button>
                </div>
                <p className="text-sm text-neutral-300">{account.account_holder}</p>
                <p className="text-sm text-neutral-400 font-mono">{account.account_number}</p>
                <p className="text-xs text-neutral-500">{account.account_type}</p>
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
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Nombre del banco</label>
              <input
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Ej: Banco Nacional"
                required
                className="editorial-input"
              />
            </div>

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
              <label className="editorial-eyebrow text-neutral-400 mb-2 block">Logo del banco (URL)</label>
              <input
                value={formData.bankLogo}
                onChange={(e) => setFormData({ ...formData, bankLogo: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="editorial-input"
              />
              <p className="text-xs text-neutral-500 mt-2">Opcional: URL del logo del banco</p>
              {formData.bankLogo && (
                <div className="mt-3 p-2 bg-white w-24 h-24 flex items-center justify-center">
                  <img src={formData.bankLogo || "/placeholder.svg"} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="editorial-button-primary flex-1">
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
          Agregar Cuenta Bancaria
        </button>
      )}
    </div>
  )
}
