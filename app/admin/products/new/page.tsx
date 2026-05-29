import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types/database'
import { ProductForm } from '@/components/admin/product-form'

export const metadata = { title: 'Tambah Produk | Admin' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('id, nama, created_at').order('nama')
  const categories = (data ?? []) as unknown as Category[]

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Tambah Produk Baru</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
