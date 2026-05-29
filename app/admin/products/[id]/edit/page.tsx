import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Category, Product } from '@/types/database'
import { ProductForm } from '@/components/admin/product-form'

export const metadata = { title: 'Edit Produk | Admin' }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, nama, created_at').order('nama'),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Produk</h1>
      <ProductForm
        categories={(categories ?? []) as unknown as Category[]}
        product={product as unknown as Product}
      />
    </div>
  )
}
