import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import type { Product } from '@/types/database'
import { formatRupiah } from '@/lib/utils'

interface ProductCardProps {
  product: Product & {
    categories?: { id: string; nama: string; created_at: string } | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/produk/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-[#ccff00] hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] hover:-translate-y-2 animate-fade-up relative"
    >
      {/* Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ccff00] to-[#00f0ff] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />

      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#111]">
        {product.foto_url ? (
          <Image
            src={product.foto_url}
            alt={product.nama}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover opacity-80 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-700">
            <Tag className="h-10 w-10 opacity-30" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Image</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-20" />

        {/* Category badge */}
        {product.categories?.nama && (
          <span className="absolute left-4 top-5 rounded-full bg-black/80 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ccff00] backdrop-blur-md border border-[#ccff00]/30 shadow-[0_0_10px_rgba(204,255,0,0.2)]">
            {product.categories.nama}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="line-clamp-2 font-heading text-xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-[#ccff00]">
            {product.nama}
          </h3>
          {product.deskripsi && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {product.deskripsi}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-5 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Price</span>
            <span className="text-xl font-black text-white tracking-tight">
              {formatRupiah(product.harga)}
            </span>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-gray-300 transition-all duration-300 group-hover:bg-[#ccff00] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-110">
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-45" />
          </span>
        </div>
      </div>
    </Link>
  )
}
