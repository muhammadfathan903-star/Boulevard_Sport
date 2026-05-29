import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Shield, Truck, Star, PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { SizeRecommendation } from '@/components/ai/size-recommendation'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types/database'

const HERO_BG =
  'https://images.unsplash.com/photo-1651827052375-a19d322852e3?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export const metadata = {
  title: 'Beranda – Boulevard Sport',
  description:
    'Temukan koleksi sepatu, pakaian, dan aksesoris olahraga premium terbaik di Boulevard Sport.',
}

type ProductWithCategory = Product & {
  categories: { id: string; nama: string; created_at: string } | null
}

async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, nama, harga, foto_url, deskripsi, kategori_id, created_at, categories(id, nama, created_at)')
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching products:', error.message)
    return []
  }
  return (data ?? []) as unknown as ProductWithCategory[]
}

const features = [
  {
    icon: Zap,
    title: 'Kualitas Premium',
    desc: 'Produk orisinal dari brand ternama dunia.',
    color: 'from-[#ccff00] to-[#00f0ff]',
  },
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    desc: 'Dikirim ke seluruh Indonesia dalam 2–5 hari kerja.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Belanja Aman',
    desc: 'Transaksi terlindungi dan 100% terjamin.',
    color: 'from-green-500 to-emerald-500',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const products = await getFeaturedProducts()

  // Fetch dynamic stats
  const [
    { count: productCount },
    { count: userCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-40 md:pt-48 md:pb-56 border-b border-white/5">
        {/* Background Image */}
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={HERO_BG}
            alt="Sport athlete hero background"
            fill
            priority
            className="object-cover object-center opacity-55"
            sizes="100vw"
          />
          {/* Multi-layer overlay: dark base + neon lime tint top-left + cyan tint right */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/95 via-[#050505]/70 to-[#050505]/85" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#ccff00]/8 via-transparent to-[#00f0ff]/8" />
          {/* Bottom fade to match page bg */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-8 z-10">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
              <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.15)]">
                <Zap className="h-4 w-4 fill-current" />
                Future of Sports Gear
              </span>
            </div>

            <h1 
              className="font-heading animate-fade-up mb-8 max-w-5xl text-6xl font-black leading-[1.05] tracking-tight text-white md:text-[5rem] lg:text-[7rem]"
              style={{ animationDelay: '100ms' }}
            >
              UNLEASH YOUR
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00f0ff] drop-shadow-[0_0_30px_rgba(204,255,0,0.4)]">
                TRUE POTENTIAL
              </span>
            </h1>

            <p 
              className="animate-fade-up mb-12 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl font-medium"
              style={{ animationDelay: '200ms' }}
            >
              Equip yourself with the most advanced, high-performance sports gear. 
              Engineered for athletes who demand nothing but the absolute best.
            </p>

            <div 
              className="animate-fade-up flex flex-wrap items-center justify-center gap-5"
              style={{ animationDelay: '300ms' }}
            >
              <Link href="/produk">
                <Button size="lg" className="group">
                  EXPLORE COLLECTION
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  JOIN THE CLUB
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div 
              className="animate-fade-up mt-28 flex flex-wrap justify-center gap-10 md:gap-32 border-t border-white/10 pt-16 w-full max-w-4xl"
              style={{ animationDelay: '400ms' }}
            >
              {[
                { value: `${productCount ?? 0}+`, label: 'Premium Items' },
                { value: `${userCount ?? 0}`, label: 'Active Athletes' },
                { value: '4.9', label: 'Global Rating' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-2">
                  <span className="font-heading text-5xl font-black text-white md:text-6xl tracking-tighter">
                    {stat.value}
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="relative z-10 border-b border-white/5 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="animate-fade-up group relative overflow-hidden rounded-[32px] bg-[#0a0a0a] border border-white/5 p-10 transition-all duration-500 hover:border-[#ccff00]/50 hover:shadow-[0_0_40px_rgba(204,255,0,0.1)] hover:-translate-y-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Hover Glow */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#ccff00]/20 blur-[50px] transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
                
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#111] border border-white/10 text-white transition-all duration-500 group-hover:bg-[#ccff00] group-hover:text-black group-hover:border-[#ccff00] mb-6`}
                >
                  <feat.icon className="h-7 w-7" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">{feat.title}</h3>
                  <p className="text-base leading-relaxed text-gray-400">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#00f0ff]">
              Pilihan Kami
            </p>
            <h2 className="mt-1 text-3xl font-bold text-white">
              Produk Terpopuler
            </h2>
          </div>
          <Link
            href="/produk"
            className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Lihat semua
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass flex flex-col items-center justify-center gap-4 rounded-2xl py-20 text-center">
            <PackageSearch className="h-12 w-12 text-gray-600" />
            <div>
              <p className="font-semibold text-white">Produk belum tersedia</p>
              <p className="mt-1 text-sm text-gray-500">
                Pastikan Supabase sudah terkonfigurasi dan data produk telah
                dimasukkan.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-[#0a0a0a] p-12 text-center transition-all duration-500 hover:border-[#ccff00]/50 hover:shadow-[0_0_40px_rgba(204,255,0,0.1)] group">
          {/* Decorative Pattern / Glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ccff00]/5 to-[#00f0ff]/5 opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[#ccff00]/10 blur-[80px]" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[#00f0ff]/10 blur-[80px]" />
          
          <h2 className="font-heading relative mb-4 text-4xl font-black text-white md:text-5xl tracking-tight">
            UNLEASH <span className="text-[#ccff00] drop-shadow-[0_0_20px_rgba(204,255,0,0.3)]">YOUR POTENTIAL</span>
          </h2>
          <p className="relative mb-10 text-lg font-medium text-gray-400 max-w-2xl mx-auto">
            Daftar gratis dan nikmati pengalaman belanja olahraga dengan perlengkapan performa tertinggi.
          </p>
          <div className="relative z-10 flex justify-center">
            <Link href="/register">
              <button className="group/btn inline-flex items-center gap-3 rounded-full bg-[#ccff00] px-10 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all hover:bg-[#b3e600] hover:scale-105 hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] active:scale-95">
                DAFTAR SEKARANG
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
