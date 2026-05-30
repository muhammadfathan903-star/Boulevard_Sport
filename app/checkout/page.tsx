import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'Checkout',
  description: 'Selesaikan pembelian kamu di Boulevard Sport.',
}

type CartItemForCheckout = {
  id: string
  jumlah: number
  inventory: {
    ukuran: string
    products: { nama: string; harga: number } | null
  } | null
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/checkout')

  const { data } = await supabase
    .from('cart_items')
    .select(
      `id, jumlah,
       inventory:inventory_id (
         ukuran,
         products:product_id ( nama, harga )
       )`
    )
    .eq('user_id', user.id)

  const cartItems = (data ?? []) as unknown as CartItemForCheckout[]

  const items = cartItems.map((item) => ({
    id: item.id,
    nama: item.inventory?.products?.nama ?? 'Produk',
    ukuran: item.inventory?.ukuran ?? '-',
    harga: item.inventory?.products?.harga ?? 0,
    jumlah: item.jumlah,
  }))

  const total = items.reduce((sum, i) => sum + i.harga * i.jumlah, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-8 flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-[#ccff00]" />
        <h1 className="font-heading text-3xl font-bold text-white">Checkout</h1>
      </div>

      <CheckoutForm items={items} total={total} />

      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
          ? 'https://app.midtrans.com/snap/snap.js' 
          : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  )
}
