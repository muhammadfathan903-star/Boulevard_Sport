import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'orange'

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  success: 'bg-green-500/15 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  danger: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  orange: 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/20',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
    'Menunggu Pembayaran': { label: 'Menunggu Pembayaran', variant: 'warning' },
    'Pembayaran Dikonfirmasi': { label: 'Dikonfirmasi', variant: 'info' },
    Selesai: { label: 'Selesai', variant: 'success' },
    Dibatalkan: { label: 'Dibatalkan', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}
