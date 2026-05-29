'use client'

import { useActionState, useState } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createCategoryAction, deleteCategoryAction, type CategoryFormState } from '@/features/admin/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { Trash2, Plus } from 'lucide-react'
import type { Category } from '@/types/database'
import { useTransition } from 'react'

interface AdminCategoriesClientProps {
  categories: Category[]
}

export function AdminCategoriesClient({ categories }: AdminCategoriesClientProps) {
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const { toast } = useToast()

  function handleDelete() {
    if (!deleteTarget) return
    startDelete(async () => {
      const result = await deleteCategoryAction(deleteTarget.id)
      if (result.error) toast(result.error, 'error')
      else toast('Kategori dihapus.', 'success')
      setDeleteTarget(null)
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Create form */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-base font-semibold text-white">
          <Plus className="mr-2 inline h-4 w-4 text-[#ccff00]" />
          Tambah Kategori
        </h2>
        {state?.message && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.message}
          </div>
        )}
        <form action={action} className="flex flex-col gap-4">
          <Input
            id="nama"
            name="nama"
            label="Nama Kategori"
            placeholder="Nama kategori..."
            error={state?.errors?.nama?.[0]}
          />
          <Button type="submit" loading={pending}>
            Tambah
          </Button>
        </form>
      </div>

      {/* Category list */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-base font-semibold text-white">
          Daftar Kategori ({categories.length})
        </h2>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <span className="font-medium text-white">{cat.nama}</span>
              <button
                onClick={() => setDeleteTarget(cat)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">Belum ada kategori.</p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus "${deleteTarget?.nama}"?`}
        description="Produk dalam kategori ini tidak akan terhapus, tapi kategorinya akan kosong."
        confirmLabel="Hapus"
        confirmVariant="danger"
        loading={isDeleting}
      />
    </div>
  )
}
