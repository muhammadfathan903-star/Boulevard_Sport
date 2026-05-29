'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PaymentMethod } from '@/types/database'
import { createSnapTransaction } from '@/lib/midtrans'

const checkoutSchema = z.object({
  alamat_pengiriman: z
    .string()
    .min(10, { message: 'Alamat minimal 10 karakter.' })
    .trim(),
  metode_pembayaran: z.enum(['GoPay', 'Transfer Bank'], {
    error: 'Pilih metode pembayaran yang valid.',
  }),
})

export type CheckoutFormState = {
  errors?: Record<string, string[]>
  message?: string
  snapToken?: string
  orderId?: string
} | null

export async function checkoutAction(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const validated = checkoutSchema.safeParse({
    alamat_pengiriman: formData.get('alamat_pengiriman'),
    metode_pembayaran: formData.get('metode_pembayaran'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { alamat_pengiriman, metode_pembayaran } = validated.data
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get cart items with inventory & product prices
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select(
      `
      id, jumlah,
      inventory:inventory_id (
        id, stok,
        products:product_id ( harga )
      )
    `
    )
    .eq('user_id', user.id)

  if (cartError || !cartItems || cartItems.length === 0) {
    return { message: 'Keranjang kosong. Tambahkan produk terlebih dahulu.' }
  }

  type CartItemRaw = {
    id: string
    jumlah: number
    inventory: {
      id: string
      stok: number
      ukuran: string
      products: { nama: string, harga: number } | null
    } | null
  }

  const items = cartItems as unknown as CartItemRaw[]

  // Validate stock for each item
  for (const item of items) {
    if (!item.inventory) {
      return { message: 'Beberapa produk tidak lagi tersedia.' }
    }
    if (item.jumlah > item.inventory.stok) {
      return {
        message: `Stok tidak mencukupi untuk salah satu produk (tersedia: ${item.inventory.stok} pcs).`,
      }
    }
  }

  // Calculate total
  const total_harga = items.reduce((sum, item) => {
    const harga = item.inventory?.products?.harga ?? 0
    return sum + harga * item.jumlah
  }, 0)

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_harga,
      alamat_pengiriman,
      metode_pembayaran: metode_pembayaran as PaymentMethod,
      status: 'Menunggu Pembayaran',
    } as any)
    .select('id')
    .single()

  if (orderError || !order) {
    return { message: 'Gagal membuat pesanan. Silakan coba lagi.' }
  }

  // Create order items (trigger akan kurangi stok)
  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    inventory_id: item.inventory!.id,
    jumlah: item.jumlah,
    harga_satuan_saat_dibeli: item.inventory?.products?.harga ?? 0,
  }))

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload as any)

  if (orderItemsError) {
    // Rollback order
    await supabase.from('orders').delete().eq('id', order.id)
    return { message: 'Gagal menyimpan detail pesanan.' }
  }

  // Clear cart
  await supabase.from('cart_items').delete().eq('user_id', user.id)

  revalidatePath('/cart')
  revalidatePath('/orders')

  // Generate Midtrans Snap Token
  try {
    const snapToken = await createSnapTransaction({
      transaction_details: {
        order_id: order.id,
        gross_amount: total_harga,
      },
      item_details: items.map((item) => ({
        id: item.inventory!.id,
        name: `${item.inventory?.products?.nama} (${item.inventory?.ukuran})`.substring(0, 50),
        price: item.inventory?.products?.harga ?? 0,
        quantity: item.jumlah,
      })),
      customer_details: {
        first_name: user.user_metadata?.full_name || 'User',
        email: user.email || '',
        shipping_address: {
          first_name: user.user_metadata?.full_name || 'User',
          address: alamat_pengiriman,
        },
      },
      enabled_payments: metode_pembayaran === 'GoPay' ? ['gopay'] : ['bank_transfer'],
    })

    // Update order with snap token
    await supabase
      .from('orders')
      .update({ snap_token: snapToken })
      .eq('id', order.id)

    return { snapToken, orderId: order.id }
  } catch (error) {
    console.error('Midtrans error:', error)
    return { message: 'Berhasil membuat pesanan, namun gagal menghubungi sistem pembayaran.' }
  }
}
