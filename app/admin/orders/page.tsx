import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/badge'
import { AdminOrderStatusSelector } from '@/components/admin/admin-order-status'
import type { Order } from '@/types/database'

export const metadata = { title: 'Kelola Pesanan | Admin' }

type OrderRow = Order & {
  profiles: { nama: string; email: string } | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, profiles:user_id(nama, email)')
    .order('created_at', { ascending: false })

  const orders = (data ?? []) as unknown as OrderRow[]

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBag className="h-6 w-6 text-[#ccff00]" />
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Kelola Pesanan</h1>
          <p className="text-sm text-gray-400">{orders.length} pesanan</p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
              <th className="px-4 py-3">Order ID</th>
              <th className="hidden px-4 py-3 md:table-cell">Pelanggan</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 lg:table-cell">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  Belum ada pesanan.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <p className="font-medium text-white">{order.profiles?.nama ?? '—'}</p>
                  <p className="text-xs text-gray-500">{order.profiles?.email}</p>
                </td>
                <td className="px-4 py-3 font-bold text-white">
                  {formatRupiah(order.total_harga)}
                </td>
                <td className="px-4 py-3">
                  <AdminOrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </td>
                <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                  {formatDate(order.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
