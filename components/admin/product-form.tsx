'use client'

import { useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProductAction, updateProductAction, type ProductFormState } from '@/features/admin/actions'
import type { Category, Product } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction

  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    action,
    null
  )

  if (state === null && !pending) {
    // will show errors from state
  }

  return (
    <form action={formAction} className="glass flex flex-col gap-5 rounded-2xl p-6">
      {state?.message && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.message}
        </div>
      )}

      <Input
        id="nama"
        name="nama"
        label="Nama Produk"
        placeholder="Nama produk"
        defaultValue={product?.nama ?? ''}
        error={state?.errors?.nama?.[0]}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="harga" className="text-sm font-medium text-gray-300">
          Harga (IDR)
        </label>
        <input
          id="harga"
          name="harga"
          type="number"
          min={0}
          step={1000}
          placeholder="0"
          defaultValue={product?.harga ?? ''}
          required
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20"
        />
        {state?.errors?.harga && (
          <p className="text-xs text-red-400">{state.errors.harga[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="kategori_id" className="text-sm font-medium text-gray-300">
          Kategori
        </label>
        <select
          id="kategori_id"
          name="kategori_id"
          defaultValue={product?.kategori_id ?? ''}
          className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20"
        >
          <option value="">— Tidak ada kategori —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="deskripsi" className="text-sm font-medium text-gray-300">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          placeholder="Deskripsi produk..."
          defaultValue={product?.deskripsi ?? ''}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="foto_file" className="text-sm font-medium text-gray-300">
          Foto Produk (Opsional jika ingin mengganti)
        </label>
        {product?.foto_url && (
          <div className="mb-2 w-32 h-32 rounded-xl overflow-hidden bg-gray-800 border border-white/10">
            <img src={product.foto_url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <input
          id="foto_file"
          name="foto_file"
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ccff00]/10 file:text-[#ccff00] hover:file:bg-[#ccff00]/20"
        />
        {/* Hidden input untuk menyimpan foto lama jika tidak ada file baru yang diupload */}
        <input type="hidden" name="foto_url" value={product?.foto_url ?? ''} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={() => router.push('/admin/products')}
        >
          Batal
        </Button>
        <Button type="submit" loading={pending} className="flex-1">
          {product ? 'Simpan Perubahan' : 'Buat Produk'}
        </Button>
      </div>
    </form>
  )
}
