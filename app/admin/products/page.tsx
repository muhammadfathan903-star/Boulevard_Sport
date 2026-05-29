import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { Plus, Pencil, Tag } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/delete-product-button'

export const metadata = { title: 'Kelola Produk | Admin' }

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, nama, harga, foto_url, kategori_id, categories(nama)')
    .order('created_at', { ascending: false })

  type ProductRow = {
    id: string
    nama: string
    harga: number
    foto_url: string | null
    categories: { nama: string } | null
  }

  const rows = (products ?? []) as unknown as ProductRow[]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Produk</h1>
          <p className="text-sm text-gray-400">{rows.length} produk terdaftar</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-[#ccff00] px-5 py-3 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all hover:bg-[#b3e600] hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Link>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
              <th className="px-4 py-3">Produk</th>
              <th className="hidden px-4 py-3 md:table-cell">Kategori</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  Belum ada produk.
                </td>
              </tr>
            )}
            {rows.map((product) => (
              <tr
                key={product.id}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                      {product.foto_url ? (
                        <Image src={product.foto_url} alt={product.nama} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Tag className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <span className="line-clamp-2 font-medium text-white">{product.nama}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                  {product.categories?.nama ?? '—'}
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {formatRupiah(product.harga)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:text-white transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.nama} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
