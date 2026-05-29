import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { ShoppingCart, PackageSearch, ArrowRight, Tag } from 'lucide-react'
import { CartItemControls } from '@/components/cart/cart-item-controls'

export const metadata = {
  title: 'Keranjang',
  description: 'Keranjang belanja kamu di Boulevard Sport.',
}

type CartItemFull = {
  id: string
  jumlah: number
  inventory: {
    id: string
    ukuran: string
    stok: number
    products: {
      id: string
      nama: string
      harga: number
      foto_url: string | null
    } | null
  } | null
}

async function getCartItems(userId: string): Promise<CartItemFull[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cart_items')
    .select(
      `id, jumlah,
       inventory:inventory_id (
         id, ukuran, stok,
         products:product_id ( id, nama, harga, foto_url )
       )`
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []) as unknown as CartItemFull[]
}

export default async function CartPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/cart')

  const items = await getCartItems(user.id)

  const total = items.reduce((sum, item) => {
    const harga = item.inventory?.products?.harga ?? 0
    return sum + harga * item.jumlah
  }, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-8 flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-[#ccff00]" />
        <h1 className="font-heading text-3xl font-bold text-white">Keranjang Belanja</h1>
        {items.length > 0 && (
          <span className="rounded-full bg-[#ccff00]/20 border border-[#ccff00]/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ccff00]">
            {items.length} item
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center gap-5 rounded-[32px] py-24 text-center">
          <PackageSearch className="h-16 w-16 text-gray-600" />
          <div>
            <p className="font-heading text-2xl font-bold text-white">Keranjang Kosong</p>
            <p className="mt-2 text-gray-500 font-medium">
              Tambahkan produk ke keranjang untuk mulai belanja.
            </p>
          </div>
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 rounded-full bg-[#ccff00] px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all hover:bg-[#b3e600] hover:scale-105"
          >
            Lihat Produk
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items list */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {items.map((item) => {
              const product = item.inventory?.products
              const harga = product?.harga ?? 0
              const subtotal = harga * item.jumlah

              return (
                <div
                  key={item.id}
                  className="glass flex gap-4 rounded-2xl p-4 transition-all"
                >
                  {/* Image */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-800">
                    {product?.foto_url ? (
                      <Image
                        src={product.foto_url}
                        alt={product.nama ?? 'Produk'}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <Link
                      href={`/produk/${product?.id ?? ''}`}
                      className="line-clamp-2 font-heading text-lg font-bold text-white hover:text-[#ccff00] transition-colors"
                    >
                      {product?.nama ?? 'Produk'}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Ukuran: <span className="text-[#00f0ff] font-bold">{item.inventory?.ukuran}</span>
                    </p>
                    <p className="text-sm font-bold text-[#ccff00] mt-1">
                      {formatRupiah(harga)}
                    </p>
                  </div>

                  {/* Controls + subtotal */}
                  <div className="flex flex-col items-end justify-between gap-2">
                    <CartItemControls
                      cartItemId={item.id}
                      jumlah={item.jumlah}
                      maxStok={item.inventory?.stok ?? 0}
                    />
                    <p className="text-sm font-bold text-white">
                      {formatRupiah(subtotal)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass sticky top-24 rounded-2xl p-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                Ringkasan Pesanan
              </h2>

              <div className="mb-4 flex flex-col gap-2 text-sm">
                {items.map((item) => {
                  const harga = item.inventory?.products?.harga ?? 0
                  return (
                    <div key={item.id} className="flex justify-between gap-2 text-gray-400">
                      <span className="line-clamp-1 flex-1">
                        {item.inventory?.products?.nama} ×{item.jumlah}
                      </span>
                      <span className="shrink-0">{formatRupiah(harga * item.jumlah)}</span>
                    </div>
                  )
                })}
              </div>

              <div className="mb-6 flex justify-between border-t border-white/10 pt-4 text-base font-bold text-white">
                <span>Total</span>
                <span className="text-[#ccff00] text-xl font-black">{formatRupiah(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ccff00] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all hover:bg-[#b3e600] active:scale-95 hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] hover:scale-[1.02]"
              >
                Checkout Sekarang
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/produk"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-white/20 py-3 text-sm font-bold uppercase tracking-widest text-gray-400 transition-all hover:text-white hover:bg-white/5"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
