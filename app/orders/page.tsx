import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types/database'
import { formatRupiah } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/badge'

export const metadata = {
  title: 'Pesanan Saya',
  description: 'Riwayat pesanan kamu di Boulevard Sport.',
}

async function getOrders(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        jumlah,
        inventory(
          products(nama)
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/orders')

  const orders = await getOrders(user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Package className="h-6 w-6 text-[#ccff00]" />
        <h1 className="font-heading text-3xl font-bold text-white">Pesanan Saya</h1>
        {orders.length > 0 && (
          <span className="rounded-full bg-[#ccff00]/20 border border-[#ccff00]/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ccff00]">
            {orders.length}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center gap-5 rounded-[32px] py-20 text-center">
          <Package className="h-14 w-14 text-gray-600" />
          <div>
            <p className="font-heading text-2xl font-bold text-white">Belum Ada Pesanan</p>
            <p className="mt-2 text-gray-500 font-medium">Mulai belanja dan pesanan kamu akan muncul di sini.</p>
          </div>
          <Link
            href="/produk"
            className="rounded-full bg-[#ccff00] px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all hover:bg-[#b3e600] hover:scale-105 hover:shadow-[0_0_25px_rgba(204,255,0,0.5)]"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="glass group flex items-center justify-between gap-4 rounded-2xl p-5 border border-white/5 transition-all hover:border-[#ccff00]/50 hover:shadow-[0_0_20px_rgba(204,255,0,0.1)]"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#00f0ff]">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm font-medium text-gray-400">{formatDate(order.created_at)}</p>
                
                {/* Item summary */}
                {order.order_items && order.order_items.length > 0 && (
                  <p className="mt-2 text-sm text-gray-300 line-clamp-1 font-semibold">
                    {order.order_items[0].jumlah}x {order.order_items[0].inventory?.products?.nama}
                    {order.order_items.length > 1 && (
                      <span className="text-gray-500 font-normal"> + {order.order_items.length - 1} produk lainnya</span>
                    )}
                  </p>
                )}
                
                <p className="mt-2 text-xs font-medium text-gray-500">Via {order.metode_pembayaran}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-right font-bold text-white text-lg">
                  {formatRupiah(order.total_harga)}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#ccff00] opacity-0 transition-opacity group-hover:opacity-100">
                  Lihat Detail <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
