'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

interface SnapPopupProps {
  snapToken: string
  orderId: string
}

export function SnapPopup({ snapToken, orderId }: SnapPopupProps) {
  const router = useRouter()

  useEffect(() => {
    if (snapToken) {
      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(snapToken, {
          onSuccess: function () {
            router.push(`/orders/${orderId}?success=1`)
          },
          onPending: function () {
            router.push(`/orders/${orderId}?success=1`)
          },
          onError: function () {
            router.push(`/orders/${orderId}`)
          },
          onClose: function () {
            router.push(`/orders/${orderId}`)
          }
        })
      }
    }
  }, [snapToken, orderId, router])

  return (
    <Script 
      src={process.env.NODE_ENV === 'production' 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js'}
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      strategy="lazyOnload"
      onLoad={() => {
        // Option to manually trigger if script loads late
        if (snapToken) {
          // @ts-ignore
          window.snap?.pay(snapToken, {
            onSuccess: () => router.push(`/orders/${orderId}?success=1`),
            onPending: () => router.push(`/orders/${orderId}?success=1`),
            onError: () => router.push(`/orders/${orderId}`),
            onClose: () => router.push(`/orders/${orderId}`),
          })
        }
      }}
    />
  )
}
