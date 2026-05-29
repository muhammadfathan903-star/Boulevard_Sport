import Link from 'next/link'
import { PackageSearch, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ccff00]/10 blur-[100px]" />
      </div>

      <div className="relative glass max-w-md rounded-[32px] p-12 text-center border border-white/5 shadow-[0_0_50px_rgba(204,255,0,0.05)]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#111] border border-[#ccff00]/30 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
            <PackageSearch className="h-10 w-10 text-[#ccff00]" />
          </div>
        </div>

        <p className="font-heading mb-2 text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">404</p>
        <h1 className="font-heading mb-3 text-2xl font-bold text-white uppercase tracking-widest">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-400">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ccff00] px-6 py-3 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all hover:bg-[#b3e600] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] active:scale-95"
          >
            <Home className="h-4 w-4" />
            Ke Beranda
          </Link>
          <Link
            href="/produk"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-widest text-gray-300 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Lihat Produk
          </Link>
        </div>
      </div>
    </div>
  )
}
