'use server'

import { createClient } from '@/lib/supabase/server'
import { createSnapTransaction } from '@/lib/midtrans'
import { revalidatePath } from 'next/cache'

export async function getOrderSnapToken(orderId: string) {
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, total_harga, status, snap_token, alamat_pengiriman,
      profiles:user_id (nama, email),
      order_items (
        id, jumlah, harga_satuan_saat_dibeli,
        inventory:inventory_id (
          id, ukuran,
          products:product_id (nama)
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    throw new Error('Pesanan tidak ditemukan')
  }

  if (order.status !== 'Menunggu Pembayaran') {
    throw new Error('Pesanan ini sudah dibayar atau dibatalkan')
  }

  // If already has snap_token, return it
  if (order.snap_token) {
    return order.snap_token
  }

  // Generate new token if missing
  try {
    const snapToken = await createSnapTransaction({
      transaction_details: {
        order_id: order.id,
        gross_amount: order.total_harga,
      },
      item_details: (order.order_items as any[]).map((item) => ({
        id: item.inventory?.id,
        name: `${item.inventory?.products?.nama} (${item.inventory?.ukuran})`.substring(0, 50),
        price: item.harga_satuan_saat_dibeli,
        quantity: item.jumlah,
      })),
      customer_details: {
        first_name: (order.profiles as any)?.nama || 'User',
        email: (order.profiles as any)?.email || '',
        shipping_address: {
          first_name: (order.profiles as any)?.nama || 'User',
          address: order.alamat_pengiriman,
        },
      },
    })

    // Save token to DB
    await supabase
      .from('orders')
      .update({ snap_token: snapToken })
      .eq('id', order.id)

    revalidatePath(`/orders/${orderId}`)
    return snapToken
  } catch (err) {
    console.error('Error generating Midtrans token:', err)
    throw new Error('Gagal menghubungi sistem pembayaran Midtrans')
  }
}
