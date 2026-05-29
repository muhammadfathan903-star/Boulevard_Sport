'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  Archive,
  ShoppingBag,
  ChevronLeft,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produk', icon: Package },
  { href: '/admin/categories', label: 'Kategori', icon: Tag },
  { href: '/admin/inventory', label: 'Inventori', icon: Archive },
  { href: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
]

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-white/10 bg-gray-950/80 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ccff00] to-[#00f0ff]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Admin info */}
      {!collapsed && (
        <div className="border-b border-white/10 px-4 py-3">
          <p className="truncate text-xs text-gray-500">Login sebagai</p>
          <p className="truncate text-sm font-medium text-white">{adminName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#ccff00]/20 text-[#ccff00]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Back to site */}
      <div className="border-t border-white/10 p-2">
        <Link
          href="/"
          title={collapsed ? 'Ke Toko' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-gray-500 hover:text-white transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && 'Ke Toko'}
        </Link>
      </div>
    </aside>
  )
}
