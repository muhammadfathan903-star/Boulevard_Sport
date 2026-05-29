import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product/product-card'
import { ProductGridSkeleton } from '@/components/product/product-card-skeleton'
import type { Product, Category } from '@/types/database'
import { PackageSearch } from 'lucide-react'

export const metadata = {
  title: 'Produk',
  description: 'Jelajahi semua koleksi produk olahraga premium di Boulevard Sport.',
}

type ProductWithCategory = Product & {
  categories: { id: string; nama: string; created_at: string } | null
}

interface ProdukPageProps {
  searchParams: Promise<{ kategori?: string }>
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('nama', { ascending: true })
  return (data ?? []) as unknown as Category[]
}

async function getProducts(kategoriId?: string): Promise<ProductWithCategory[]> {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select(
      'id, nama, harga, foto_url, deskripsi, kategori_id, created_at, categories(id, nama, created_at)'
    )
    .order('created_at', { ascending: false })

  if (kategoriId) {
    query = query.eq('kategori_id', kategoriId)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching products:', error.message)
    return []
  }
  return (data ?? []) as unknown as ProductWithCategory[]
}

async function ProductGrid({ kategoriId }: { kategoriId?: string }) {
  const products = await getProducts(kategoriId)

  if (products.length === 0) {
    return (
      <div className="glass col-span-full flex flex-col items-center justify-center gap-4 rounded-[24px] py-24 text-center border border-white/5 bg-[#0a0a0a]">
        <PackageSearch className="h-12 w-12 text-gray-700" />
        <div>
          <p className="font-heading text-xl font-bold text-white">Produk tidak ditemukan</p>
          <p className="mt-2 text-sm text-gray-500">
            Coba pilih kategori lain atau lihat semua produk.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  )
}

export default async function ProdukPage({ searchParams }: ProdukPageProps) {
  const params = await searchParams
  const selectedKategori = params.kategori
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ccff00]">
          Katalog
        </p>
        <h1 className="font-heading mt-3 text-4xl font-black text-white md:text-5xl">Semua Produk</h1>
        <p className="mt-3 text-gray-400 text-lg">
          Temukan perlengkapan olahraga terbaik untuk kamu.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            href="/produk"
            className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
              !selectedKategori
                ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)] border border-[#ccff00]'
                : 'border border-white/10 bg-[#111] text-gray-400 hover:border-[#ccff00]/50 hover:text-[#ccff00] hover:shadow-[0_0_10px_rgba(204,255,0,0.1)]'
            }`}
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produk?kategori=${cat.id}`}
              className={`rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                selectedKategori === cat.id
                  ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)] border border-[#ccff00]'
                  : 'border border-white/10 bg-[#111] text-gray-400 hover:border-[#ccff00]/50 hover:text-[#ccff00] hover:shadow-[0_0_10px_rgba(204,255,0,0.1)]'
              }`}
            >
              {cat.nama}
            </Link>
          ))}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <ProductGrid kategoriId={selectedKategori} />
        </Suspense>
      </div>
    </div>
  )
}
