'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, CreditCard, ArrowRight } from 'lucide-react'
import { checkoutAction, type CheckoutFormState } from '@/features/checkout/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatRupiah } from '@/lib/utils'

interface CheckoutFormProps {
  items: Array<{
    id: string
    nama: string
    ukuran: string
    harga: number
    jumlah: number
  }>
  total: number
}

export function CheckoutForm({ items, total }: CheckoutFormProps) {
  const [state, action, pending] = useActionState<CheckoutFormState, FormData>(
    checkoutAction,
    null
  )
  const router = useRouter()

  useEffect(() => {
    if (state?.snapToken && state?.orderId) {
      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(state.snapToken, {
          onSuccess: function (result: any) {
            router.push(`/orders/${state.orderId}?success=1`)
          },
          onPending: function (result: any) {
            router.push(`/orders/${state.orderId}?success=1`)
          },
          onError: function (result: any) {
            router.push(`/orders/${state.orderId}`)
          },
          onClose: function () {
            router.push(`/orders/${state.orderId}`)
          }
        })
      }
    }
  }, [state, router])

  if (items.length === 0 && !state?.orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-white/5 p-6">
          <CreditCard className="h-12 w-12 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-white">Keranjang Kosong</h2>
        <p className="mt-2 text-gray-500">Silakan tambahkan produk sebelum melakukan checkout.</p>
        <Link href="/produk" className="mt-8 text-[#ccff00] hover:underline">
          Lihat Produk →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Form */}
      <div className="lg:col-span-2">
        <form action={action} className="flex flex-col gap-6">
          {/* Error message */}
          {state?.message && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.message}
            </div>
          )}

          {/* Shipping address */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <MapPin className="h-5 w-5 text-[#ccff00]" />
              Alamat Pengiriman
            </h2>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-300" htmlFor="alamat_pengiriman">
                Alamat Lengkap
              </label>
              <textarea
                id="alamat_pengiriman"
                name="alamat_pengiriman"
                rows={4}
                placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota, Kode Pos"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20 resize-none"
              />
              {state?.errors?.alamat_pengiriman && (
                <p className="text-xs text-red-400">{state.errors.alamat_pengiriman[0]}</p>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <CreditCard className="h-5 w-5 text-[#ccff00]" />
              Metode Pembayaran
            </h2>
            <div className="flex flex-col gap-3">
              {(['GoPay', 'Transfer Bank'] as const).map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all has-[:checked]:border-[#ccff00]/50 has-[:checked]:bg-[#ccff00]/10"
                >
                  <input
                    type="radio"
                    name="metode_pembayaran"
                    value={method}
                    className="accent-[#ccff00]"
                    defaultChecked={method === 'GoPay'}
                  />
                  <div>
                    <p className="font-semibold text-white">{method}</p>
                    <p className="text-xs text-gray-500">
                      {method === 'GoPay'
                        ? 'Bayar langsung via aplikasi GoPay'
                        : 'Transfer ke rekening bank yang tersedia'}
                    </p>
                  </div>
                </label>
              ))}
              {state?.errors?.metode_pembayaran && (
                <p className="text-xs text-red-400">
                  {state.errors.metode_pembayaran[0]}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={pending}
            className="w-full gap-2"
            id="place-order-btn"
          >
            Buat Pesanan
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Order summary */}
      <div className="glass sticky top-24 h-fit rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Ringkasan</h2>
        <div className="mb-4 flex flex-col gap-2.5">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between gap-2 text-sm">
              <span className="line-clamp-1 flex-1 text-gray-400">
                {item.nama}
                <span className="ml-1 text-gray-600">({item.ukuran}) ×{item.jumlah}</span>
              </span>
              <span className="shrink-0 text-gray-300">
                {formatRupiah(item.harga * item.jumlah)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-white/10 pt-4 text-base font-bold text-white">
          <span>Total</span>
          <span className="text-[#ccff00]">{formatRupiah(total)}</span>
        </div>
        <Link
          href="/cart"
          className="mt-4 block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Kembali ke Keranjang
        </Link>
      </div>
    </div>
  )
}
