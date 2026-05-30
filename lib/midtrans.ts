import crypto from 'crypto'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ''
const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const MIDTRANS_API_URL = isProduction
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

export interface MidtransItemDetails {
  id: string
  price: number
  quantity: number
  name: string
}

export interface MidtransCustomerDetails {
  first_name: string
  email: string
  shipping_address?: {
    first_name: string
    address: string
  }
}

export interface SnapTransactionPayload {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  item_details?: MidtransItemDetails[]
  customer_details?: MidtransCustomerDetails
  enabled_payments?: string[]
}

export async function createSnapTransaction(payload: SnapTransactionPayload): Promise<string> {
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')

  const response = await fetch(MIDTRANS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Midtrans Snap Error:', errorData)
    throw new Error('Gagal menghubungi Midtrans Snap API')
  }

  const data = await response.json()
  return data.token
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const hash = crypto.createHash('sha512')
  const payloadStr = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`
  hash.update(payloadStr)
  const calculatedSignature = hash.digest('hex')

  return calculatedSignature === signatureKey
}
