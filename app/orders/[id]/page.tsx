import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { Package, ArrowLeft, CheckCircle2, Tag } from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/badge'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}

type OrderItemFull = {
  id: string
  jumlah: number
  harga_satuan_saat_dibeli: number
  inventory: {
    ukuran: string
    products: { nama: string; foto_url: string | null } | null
  } | null
}

type OrderFull = {
  id: string
  total_harga: number
  alamat_pengiriman: string
  metode_pembayaran: string
  status: string
  created_at: string
  order_items: OrderItemFull[]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const { id } = await params
  const { success } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `id, total_harga, alamat_pengiriman, metode_pembayaran, status, created_at,
       order_items (
         id, jumlah, harga_satuan_saat_dibeli,
         inventory:inventory_id (
           ukuran,
           products:product_id ( nama, foto_url )
         )
       )`
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !order) notFound()

  const orderFull = order as unknown as OrderFull

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      {/* Success banner */}
      {success === '1' && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-400" />
          <div>
            <p className="font-semibold text-white">Pesanan Berhasil Dibuat!</p>
            <p className="text-sm text-gray-400">
              Pesanan kamu sedang diproses. Pantau statusnya di halaman ini.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/orders"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Semua Pesanan
        </Link>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sm font-bold text-[#00f0ff]">
              #{orderFull.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">{formatDate(orderFull.created_at)}</p>
          </div>
          <OrderStatusBadge status={orderFull.status as import('@/types/database').OrderStatus} />
        </div>

        {/* Order items */}
        <div className="mb-6 flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            <Package className="h-4 w-4" />
            Item Pesanan
          </h2>
          {orderFull.order_items.map((item) => {
            const product = item.inventory?.products
            return (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-800">
                  {product?.foto_url ? (
                    <Image src={product.foto_url} alt={product.nama ?? ''} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Tag className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 font-bold text-white">{product?.nama}</p>
                  <p className="text-xs font-medium text-gray-400">
                    Ukuran: <span className="text-[#00f0ff]">{item.inventory?.ukuran}</span> · Qty: {item.jumlah}
                  </p>
                  <p className="text-xs font-bold text-[#ccff00] mt-1">
                    {formatRupiah(item.harga_satuan_saat_dibeli)} /pcs
                  </p>
                </div>
                <p className="shrink-0 font-bold text-white">
                  {formatRupiah(item.harga_satuan_saat_dibeli * item.jumlah)}
                </p>
              </div>
            )
          })}
        </div>

        {/* Details */}
        <div className="mb-6 flex flex-col gap-3 border-t border-white/10 pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Metode Pembayaran</span>
            <span className="font-medium text-white">{orderFull.metode_pembayaran}</span>
          </div>
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-gray-500">Alamat Pengiriman</span>
            <span className="text-right text-sm text-white">{orderFull.alamat_pengiriman}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between rounded-2xl border border-[#ccff00]/30 bg-[#ccff00]/10 px-6 py-5 font-bold shadow-[0_0_15px_rgba(204,255,0,0.1)]">
          <span className="text-white uppercase tracking-widest text-sm self-center">Total Pembayaran</span>
          <span className="text-2xl font-black text-[#ccff00] drop-shadow-[0_0_10px_rgba(204,255,0,0.4)]">{formatRupiah(orderFull.total_harga)}</span>
        </div>

        {/* Timeline */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Status Pesanan</h3>
          <div className="flex flex-col gap-4">
            {['Menunggu Pembayaran', 'Pembayaran Dikonfirmasi', 'Selesai'].map((step, idx) => {
              const isActive = orderFull.status === step || 
                 (orderFull.status === 'Selesai') || 
                 (orderFull.status === 'Pembayaran Dikonfirmasi' && idx === 0);
              
              const isCancelled = orderFull.status === 'Dibatalkan';

              return (
                <div key={step} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${isCancelled ? 'border-red-500/50 bg-red-500/10' : isActive ? 'border-[#ccff00] bg-[#ccff00]/20 shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'border-white/10 bg-[#111]'}`}>
                    {isCancelled && idx === 0 ? (
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                    ) : isActive ? (
                      <CheckCircle2 className="h-5 w-5 text-[#ccff00]" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isCancelled ? 'text-red-400' : isActive ? 'text-white' : 'text-gray-500'}`}>
                      {isCancelled && idx === 0 ? 'Pesanan Dibatalkan' : step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
