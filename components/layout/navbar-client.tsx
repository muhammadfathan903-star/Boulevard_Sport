'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, ShoppingCart, User, Menu, X, Shield } from 'lucide-react'
import { useState, useTransition } from 'react'
import { logoutAction } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface NavbarClientProps {
  initialProfile: Profile | null
  cartCount: number
}

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/produk', label: 'Produk' },
]

export function NavbarClient({ initialProfile, cartCount }: NavbarClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
      router.refresh()
    })
  }

  const isLoggedIn = !!initialProfile

  return (
    <header className="sticky top-6 z-50 transition-all duration-300 w-full px-4 md:px-8 pointer-events-none">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full bg-[#0a0a0a]/80 px-4 py-3 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(204,255,0,0.6)]">
            <ShoppingBag className="h-5 w-5 text-black" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white transition-colors group-hover:text-gray-200">
            BOULEVARD
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-full',
                  isActive
                    ? 'text-[#ccff00] bg-[#ccff00]/10 shadow-[0_0_10px_rgba(204,255,0,0.1)] border border-[#ccff00]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                {/* Cart */}
                <Link
                  href="/cart"
                  aria-label="Keranjang belanja"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-white transition-all hover:border-[#ccff00]/50 hover:bg-[#ccff00]/10 hover:text-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ccff00] px-1 text-[10px] font-black text-black shadow-[0_0_10px_rgba(204,255,0,0.5)]">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Admin panel shortcut */}
                {initialProfile.role === 'admin' && (
                  <Link
                    href="/admin"
                    aria-label="Panel Admin"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] transition-all hover:bg-[#00f0ff]/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  >
                    <Shield className="h-4 w-4" />
                  </Link>
                )}

                {/* Profile button */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-[#111] py-1.5 pl-1.5 pr-4 text-sm font-bold text-white transition-all hover:border-[#ccff00]/50 hover:shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ccff00] text-xs font-black text-black shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                    {initialProfile.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{initialProfile.nama}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:bg-white/5 hover:text-white ml-2"
                >
                  KELUAR
                </button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm" className="rounded-full px-6 py-2">
                  Masuk
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-white transition-all hover:border-[#ccff00]/50 hover:text-[#ccff00] md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-gray-950/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-sm transition-colors',
                  pathname === link.href
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ccff00] to-[#00f0ff] text-xs font-bold text-white">
                      {initialProfile.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {initialProfile.nama}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {initialProfile.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/cart"
                    className="flex justify-between rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Keranjang</span>
                    {cartCount > 0 && (
                      <span className="rounded-full bg-[#ccff00] px-2 py-0.5 text-xs font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  {initialProfile.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="rounded-xl px-3 py-2.5 text-sm text-[#ccff00] hover:bg-[#ccff00]/10"
                      onClick={() => setMenuOpen(false)}
                    >
                      Panel Admin
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={isPending}
                    onClick={handleLogout}
                    className="w-full justify-start px-3"
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Daftar Gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
