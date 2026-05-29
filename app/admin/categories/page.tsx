import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types/database'
import { AdminCategoriesClient } from '@/components/admin/admin-categories-client'

export const metadata = { title: 'Kelola Kategori | Admin' }

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('nama')
  const categories = (data ?? []) as unknown as Category[]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Kelola Kategori</h1>
      <AdminCategoriesClient categories={categories} />
    </div>
  )
}
