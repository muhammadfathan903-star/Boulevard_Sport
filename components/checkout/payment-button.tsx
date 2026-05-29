'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { getOrderSnapToken } from '@/features/orders/actions'
import { useRouter } from 'next/navigation'

interface PaymentButtonProps {
  orderId: string
  initialSnapToken?: string
}

export function PaymentButton({ orderId, initialSnapToken }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)
    try {
      const snapToken = initialSnapToken || await getOrderSnapToken(orderId)
      
      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(snapToken, {
          onSuccess: function () {
            router.push(`/orders/${orderId}?success=1`)
            router.refresh()
          },
          onPending: function () {
            router.push(`/orders/${orderId}?success=1`)
            router.refresh()
          },
          onError: function () {
            alert('Pembayaran gagal, silakan coba lagi.')
          },
          onClose: function () {
            console.log('User closed the popup')
          }
        })
      } else {
        alert('Sistem pembayaran sedang dimuat, silakan tunggu sebentar.')
      }
    } catch (error: any) {
      alert(error.message || 'Gagal memproses pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full gap-2 py-6 text-lg font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <CreditCard className="h-5 w-5" />
      )}
      {loading ? 'Menghubungkan...' : 'Bayar Sekarang'}
    </Button>
  )
}
