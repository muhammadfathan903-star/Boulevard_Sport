import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'
import {
  User,
  Mail,
  Shield,
  ShoppingBag,
  CalendarDays,
  LogOut,
  ChevronRight,
  Package,
  CreditCard,
} from 'lucide-react'
import { logoutAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Dashboard',
  description: 'Dashboard akun Boulevard Sport kamu.',
}

async function getProfileAndStats(): Promise<{
  profile: Profile
  orderCount: number
  totalSpent: number
} | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch profile separately to avoid TypeScript narrowing issues with Promise.all
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profileData) return null

  const profile = profileData as Profile

  const { data: ordersData } = await supabase
    .from('orders')
    .select('total_harga')
    .eq('user_id', user.id)
    .in('status', ['Pembayaran Dikonfirmasi', 'Selesai'])

  const orders = (ordersData ?? []) as Array<{ total_harga: number | null }>
  const orderCount = orders.length
  const totalSpent = orders.reduce(
    (sum, o) => sum + (o.total_harga ?? 0),
    0
  )

  return { profile, orderCount, totalSpent }
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const data = await getProfileAndStats()

  if (!data) {
    redirect('/login')
  }

  const { profile, orderCount, totalSpent } = data

  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Pesanan',
      value: orderCount.toString(),
      sub: 'pesanan dikonfirmasi',
      color: 'from-[#ccff00]/20 to-[#ccff00]/5 text-[#ccff00]',
    },
    {
      icon: CreditCard,
      label: 'Total Belanja',
      value: formatRupiah(totalSpent),
      sub: 'dari pesanan selesai',
      color: 'from-[#00f0ff]/20 to-[#00f0ff]/5 text-[#00f0ff]',
    },
    {
      icon: Shield,
      label: 'Status Akun',
      value: profile.role === 'admin' ? 'Admin' : 'Pelanggan',
      sub: 'level akses',
      color: profile.role === 'admin' ? 'from-[#ff00ff]/20 to-[#ff00ff]/5 text-[#ff00ff]' : 'from-green-500/20 to-green-500/5 text-green-400',
    },
  ]

  const quickLinks = [
    {
      icon: Package,
      label: 'Pesanan Saya',
      desc: 'Lihat riwayat dan status pesanan',
      href: '/orders',
    },
    {
      icon: ShoppingBag,
      label: 'Toko',
      desc: 'Jelajahi produk terbaru',
      href: '/produk',
    },
    ...(profile.role === 'admin'
      ? [
          {
            icon: Shield,
            label: 'Panel Admin',
            desc: 'Kelola produk, stok, dan pesanan',
            href: '/admin',
          },
        ]
      : []),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest text-[#00f0ff]">
          Dashboard
        </p>
        <h1 className="mt-1 font-heading text-4xl font-black text-white">
          Halo,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00f0ff] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">{profile.nama}</span>! 👋
        </h1>
        <p className="mt-2 text-gray-400 font-medium">
          Selamat datang kembali. Ini ringkasan akun kamu.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-[24px] p-6 border border-white/5 hover:border-[#ccff00]/30 transition-colors">
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br border border-white/5 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400">{stat.label}</span>
            </div>
            <p className="font-heading text-3xl font-black text-white tracking-tight">{stat.value}</p>
            <p className="mt-1 text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="glass rounded-[32px] p-8 md:p-10 border border-white/5">
            <h2 className="mb-8 flex items-center gap-3 font-heading text-xl font-bold text-white uppercase tracking-widest">
              <User className="h-6 w-6 text-[#ccff00]" />
              Informasi Akun
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow
                icon={User}
                label="Nama Lengkap"
                value={profile.nama}
              />
              <InfoRow
                icon={User}
                label="Username"
                value={`@${profile.username}`}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={profile.email}
              />
              <InfoRow
                icon={Shield}
                label="Role"
                value={profile.role === 'admin' ? '👑 Admin' : '🛒 Pelanggan'}
              />
              <InfoRow
                icon={CalendarDays}
                label="Bergabung Sejak"
                value={formatDate(profile.created_at)}
                className="sm:col-span-2"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <form action={logoutAction}>
                <Button variant="danger" size="sm" type="submit" id="dashboard-logout">
                  <LogOut className="h-4 w-4" />
                  Keluar dari Akun
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">
            Menu Cepat
          </h2>
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass group flex items-center gap-4 rounded-2xl p-4 border border-white/5 transition-all hover:border-[#ccff00]/50 hover:shadow-[0_0_20px_rgba(204,255,0,0.1)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111] border border-white/10 text-[#ccff00] transition-all group-hover:bg-[#ccff00]/10 group-hover:border-[#ccff00]/30 group-hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white">{item.label}</p>
                <p className="truncate text-xs text-gray-500 font-medium">{item.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-[#ccff00]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 ${className ?? ''}`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 truncate font-medium text-white">{value}</p>
      </div>
    </div>
  )
}
