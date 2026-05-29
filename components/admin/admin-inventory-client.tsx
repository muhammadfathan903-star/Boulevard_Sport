'use client'

import { useActionState, useState, useTransition } from 'react'
import { upsertInventoryAction, deleteInventoryAction, updateStockAction, type InventoryFormState } from '@/features/admin/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { AlertTriangle, Plus, Trash2, Minus } from 'lucide-react'

type InventoryRow = {
  id: string; ukuran: string; stok: number; batas_minimum: number; product_id: string; created_at: string;
  products: { id: string; nama: string; harga: number } | null
}

interface Props {
  inventory: InventoryRow[]
  products: { id: string; nama: string }[]
}

export function AdminInventoryClient({ inventory, products }: Props) {
  const [state, action, pending] = useActionState<InventoryFormState, FormData>(upsertInventoryAction, null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryRow | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()

  function handleDelete() {
    if (!deleteTarget) return
    startDelete(async () => {
      const r = await deleteInventoryAction(deleteTarget.id)
      if (r.error) toast(r.error, 'error')
      else toast('Inventori dihapus.', 'success')
      setDeleteTarget(null)
    })
  }

  async function handleStockChange(inv: InventoryRow, delta: number) {
    const newStok = inv.stok + delta
    if (newStok < 0) return
    setUpdatingId(inv.id)
    const r = await updateStockAction(inv.id, newStok)
    if (r.error) toast(r.error, 'error')
    setUpdatingId(null)
  }

  const lowStock = inventory.filter((i) => i.stok <= i.batas_minimum)

  return (
    <div className="flex flex-col gap-6">
      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-400">
            <AlertTriangle className="h-4 w-4" />
            {lowStock.length} varian mendekati batas minimum
          </p>
          <div className="flex flex-col gap-1.5">
            {lowStock.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg bg-yellow-500/5 px-3 py-2 text-xs">
                <span className="text-yellow-300">{inv.products?.nama} — {inv.ukuran}</span>
                <span className="font-bold text-yellow-400">{inv.stok} pcs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add inventory form */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
          <Plus className="h-4 w-4 text-[#ccff00]" />
          Tambah / Update Varian
        </h2>
        {state?.message && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.message}
          </div>
        )}
        <form action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Produk</label>
            <select
              name="product_id"
              required
              className="rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20"
            >
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
            {state?.errors?.product_id && <p className="text-xs text-red-400">{state.errors.product_id[0]}</p>}
          </div>
          <Input id="ukuran" name="ukuran" label="Ukuran" placeholder="39 / M / XL" error={state?.errors?.ukuran?.[0]} required />
          <Input id="stok" name="stok" type="number" label="Stok" placeholder="0" defaultValue="0" error={state?.errors?.stok?.[0]} required />
          <Input id="batas_minimum" name="batas_minimum" type="number" label="Batas Minimum" placeholder="5" defaultValue="5" />
          <div className="sm:col-span-2">
            <Button type="submit" loading={pending} className="w-full">Simpan Varian</Button>
          </div>
        </form>
      </div>

      {/* Inventory table */}
      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Ukuran</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Min</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((inv) => {
              const isLow = inv.stok <= inv.batas_minimum
              return (
                <tr key={inv.id} className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${isLow ? 'bg-yellow-500/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-white">{inv.products?.nama ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{inv.ukuran}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={updatingId === inv.id || inv.stok <= 0}
                        onClick={() => handleStockChange(inv, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className={`w-8 text-center font-bold ${isLow ? 'text-yellow-400' : 'text-white'}`}>
                        {inv.stok}
                      </span>
                      <button
                        disabled={updatingId === inv.id}
                        onClick={() => handleStockChange(inv, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      {isLow && <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{inv.batas_minimum}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(inv)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Belum ada inventori.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus varian "${deleteTarget?.products?.nama} – ${deleteTarget?.ukuran}"?`}
        description="Data inventori ini akan dihapus permanen."
        confirmLabel="Hapus"
        confirmVariant="danger"
        loading={isDeleting}
      />
    </div>
  )
}
