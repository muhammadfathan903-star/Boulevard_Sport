import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyMidtransSignature } from '@/lib/midtrans'

// Initialize Supabase admin client to bypass RLS in the webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Note: SUPABASE_SERVICE_ROLE_KEY is required for webhook
)

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
      payment_type,
      settlement_time,
    } = payload

    // 1. Verify Signature Key
    if (!verifyMidtransSignature(order_id, status_code, gross_amount, signature_key)) {
      console.error('Invalid Midtrans signature for order:', order_id)
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
    }

    // 2. Determine mapped status
    let mappedStatus = 'Menunggu Pembayaran'
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      mappedStatus = 'Pembayaran Dikonfirmasi'
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire' ||
      transaction_status === 'failure'
    ) {
      mappedStatus = 'Dibatalkan'
    }

    // 3. Update order in database
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: mappedStatus,
        payment_status: transaction_status,
        midtrans_transaction_id: transaction_id,
        payment_type: payment_type,
        paid_at: settlement_time ? new Date(settlement_time).toISOString() : null,
      })
      .eq('id', order_id)

    if (error) {
      console.error('Failed to update order status:', error)
      return NextResponse.json({ message: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
