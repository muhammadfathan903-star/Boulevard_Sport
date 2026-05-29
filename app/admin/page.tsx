import { createClient } from '@/lib/supabase/server'
import { Package, Tag, Archive, ShoppingBag, TrendingUp } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: productCount },
    { count: categoryCount },
    { count: orderCount },
    { data: revenueData },
    { data: lowStockData },
    { data: recentOrdersData },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('total_harga')
      .in('status', ['Pembayaran Dikonfirmasi', 'Selesai']),
    supabase
      .from('inventory')
      .select('ukuran, stok, batas_minimum, products(nama)')
      .filter('stok', 'lte', 'batas_minimum')
      .limit(5),
    supabase
      .from('orders')
      .select('id, total_harga, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const revenueArray = (revenueData ?? []) as unknown as { total_harga: number | null }[]
  const totalRevenue = revenueArray.reduce(
    (sum, o) => sum + (o.total_harga ?? 0),
    0
  )

  const stats = [
    { icon: Package, label: 'Total Produk', value: (productCount ?? 0).toString(), color: 'from-[#ccff00]/20 to-[#ccff00]/5 text-[#ccff00]' },
    { icon: Tag, label: 'Kategori', value: (categoryCount ?? 0).toString(), color: 'from-[#00f0ff]/20 to-[#00f0ff]/5 text-[#00f0ff]' },
    { icon: ShoppingBag, label: 'Total Pesanan', value: (orderCount ?? 0).toString(), color: 'from-[#ff00ff]/20 to-[#ff00ff]/5 text-[#ff00ff]' },
    { icon: TrendingUp, label: 'Total Pendapatan', value: formatRupiah(totalRevenue), color: 'from-green-500/20 to-green-500/5 text-green-400' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-gray-400">Ringkasan statistik toko Boulevard Sport</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-[24px] p-6 border border-white/5 hover:border-[#ccff00]/30 transition-colors">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br border border-white/5 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400">{s.label}</span>
            </div>
            <p className="font-heading text-3xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Low stock warning */}
      {lowStockData && lowStockData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-yellow-400">
            <Archive className="h-5 w-5" />
            Peringatan Stok Menipis
          </h2>
          <div className="flex flex-col gap-2">
            {lowStockData.map((inv, i) => {
              const invTyped = inv as unknown as {
                ukuran: string
                stok: number
                batas_minimum: number
                products: { nama: string } | null
              }
              return (
                <div key={i} className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                  <span className="text-sm text-white">
                    {invTyped.products?.nama} – Ukuran {invTyped.ukuran}
                  </span>
                  <span className="text-sm font-bold text-yellow-400">
                    {invTyped.stok} pcs tersisa
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrdersData && recentOrdersData.length > 0 && (
        <div className="mt-8 glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-heading text-xl font-bold text-white uppercase tracking-widest">Pesanan Terbaru</h2>
            <a href="/admin/orders" className="text-xs font-bold uppercase tracking-widest text-[#ccff00] hover:text-[#b3e600] transition-colors">
              Lihat Semua
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">ID Pesanan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrdersData.map((order: any) => (
                  <tr key={order.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.status === 'Selesai' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        order.status === 'Menunggu Pembayaran' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        order.status === 'Dibatalkan' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {formatRupiah(order.total_harga)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
