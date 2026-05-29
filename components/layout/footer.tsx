import Link from 'next/link'
import { ShoppingBag, AtSign, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(204,255,0,0.6)]">
                <ShoppingBag className="h-5 w-5 text-black" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white transition-colors group-hover:text-gray-200">
                BOULEVARD
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Toko perlengkapan olahraga premium. Kualitas terbaik untuk
              performa tertinggi kamu.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Navigasi</h3>
            {[
              { href: '/', label: 'Beranda' },
              { href: '/produk', label: 'Produk' },
              { href: '/dashboard', label: 'Dashboard' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-[#ccff00] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Ikuti Kami</h3>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-gray-400 transition-all hover:border-[#ccff00]/50 hover:bg-[#ccff00]/10 hover:text-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-gray-400 transition-all hover:border-[#ccff00]/50 hover:bg-[#ccff00]/10 hover:text-[#ccff00] hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Boulevard Sport. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
