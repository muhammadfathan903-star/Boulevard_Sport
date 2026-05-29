import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { Archive } from 'lucide-react'
import { AdminInventoryClient } from '@/components/admin/admin-inventory-client'

export const metadata = { title: 'Kelola Inventori | Admin' }

type InventoryRow = {
  id: string
  ukuran: string
  stok: number
  batas_minimum: number
  product_id: string
  created_at: string
  products: { id: string; nama: string; harga: number } | null
}

export default async function AdminInventoryPage() {
  const supabase = await createClient()
  const { data: inventory } = await supabase
    .from('inventory')
    .select('id, ukuran, stok, batas_minimum, product_id, created_at, products:product_id(id, nama, harga)')
    .order('created_at', { ascending: false })

  const { data: products } = await supabase
    .from('products')
    .select('id, nama')
    .order('nama')

  const rows = (inventory ?? []) as unknown as InventoryRow[]
  const productOptions = (products ?? []) as { id: string; nama: string }[]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Archive className="h-6 w-6 text-[#00f0ff]" />
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Kelola Inventori</h1>
          <p className="text-sm text-gray-400">{rows.length} varian terdaftar</p>
        </div>
      </div>

      <AdminInventoryClient inventory={rows} products={productOptions} />
    </div>
  )
}
