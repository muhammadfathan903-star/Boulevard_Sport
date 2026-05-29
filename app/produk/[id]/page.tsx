import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Product, Inventory } from '@/types/database'
import { formatRupiah } from '@/lib/utils'
import { Tag, Package, ArrowLeft } from 'lucide-react'
import { AddToCart } from '@/components/product/add-to-cart'
import { ProductCard } from '@/components/product/product-card'
import { SizeRecommendation } from '@/components/ai/size-recommendation'

interface ProdukDetailPageProps {
  params: Promise<{ id: string }>
}

type ProductWithDetails = Product & {
  categories: { id: string; nama: string; created_at: string } | null
  inventory: Inventory[]
}

type ProductWithCategory = Product & {
  categories: { id: string; nama: string; created_at: string } | null
}

async function getProduct(id: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `id, nama, harga, foto_url, deskripsi, kategori_id, created_at,
       categories(id, nama, created_at),
       inventory(id, ukuran, stok, batas_minimum, product_id, created_at)`
    )
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as ProductWithDetails
}

async function getRelatedProducts(
  kategoriId: string | null,
  excludeId: string
): Promise<ProductWithCategory[]> {
  if (!kategoriId) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, nama, harga, foto_url, deskripsi, kategori_id, created_at, categories(id, nama, created_at)')
    .eq('kategori_id', kategoriId)
    .neq('id', excludeId)
    .limit(4)
  return (data ?? []) as unknown as ProductWithCategory[]
}

export async function generateMetadata({ params }: ProdukDetailPageProps) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Produk Tidak Ditemukan' }
  return {
    title: product.nama,
    description: product.deskripsi ?? `Beli ${product.nama} di Boulevard Sport.`,
  }
}

export default async function ProdukDetailPage({ params }: ProdukDetailPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const related = await getRelatedProducts(product.kategori_id, id)

  // Sort inventory by size
  const sortedInventory = [...product.inventory].sort((a, b) =>
    a.ukuran.localeCompare(b.ukuran, undefined, { numeric: true })
  )

  const inStock = sortedInventory.some((inv) => inv.stok > 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* Back */}
      <Link
        href="/produk"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Produk
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-800/50">
          {product.foto_url ? (
            <Image
              src={product.foto_url}
              alt={product.nama}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-600">
              <Tag className="h-12 w-12 opacity-30" />
              <span className="text-sm opacity-30">Tidak ada gambar</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          {product.categories && (
            <span className="w-fit rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              {product.categories.nama}
            </span>
          )}

          <div>
            <h1 className="font-heading text-4xl font-black leading-snug text-white md:text-5xl">
              {product.nama}
            </h1>
            {product.deskripsi && (
              <p className="mt-4 leading-relaxed text-gray-400">
                {product.deskripsi}
              </p>
            )}
          </div>

          <div className="font-heading text-4xl font-black text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            {formatRupiah(product.harga)}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span className={`text-sm font-medium ${inStock ? 'text-green-400' : 'text-red-400'}`}>
              {inStock ? 'Stok Tersedia' : 'Stok Habis'}
            </span>
          </div>

          {/* AddToCart client component */}
          <AddToCart inventory={sortedInventory} />

          {/* AI Size Guide Trigger */}
          <div className="mt-2">
            <SizeRecommendation />
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {[
              { icon: Package, label: 'Stok Real-Time' },
              { icon: Tag, label: 'Produk Original' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-gray-400"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-heading text-2xl font-bold text-white border-b border-white/10 pb-4">
            Produk Terkait
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
