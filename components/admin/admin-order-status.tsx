'use client'

import { useTransition, useState } from 'react'
import { updateOrderStatusAction } from '@/features/admin/actions'
import { useToast } from '@/components/ui/toast'
import type { OrderStatus } from '@/types/database'

const statuses: OrderStatus[] = [
  'Menunggu Pembayaran',
  'Pembayaran Dikonfirmasi',
  'Selesai',
  'Dibatalkan',
]

export function AdminOrderStatusSelector({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as OrderStatus
    setStatus(newStatus)
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus)
      if (result.error) {
        toast(result.error, 'error')
        setStatus(currentStatus) // revert
      } else {
        toast('Status pesanan diperbarui.', 'success')
      }
    })
  }

  const colorMap: Record<OrderStatus, string> = {
    'Menunggu Pembayaran': 'text-yellow-400',
    'Pembayaran Dikonfirmasi': 'text-blue-400',
    Selesai: 'text-green-400',
    Dibatalkan: 'text-red-400',
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={`rounded-xl border border-white/10 bg-gray-900/80 px-3 py-1.5 text-xs font-semibold outline-none transition-all disabled:opacity-50 ${colorMap[status]}`}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
