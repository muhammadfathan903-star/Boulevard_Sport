'use client'

import { useTransition, useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { updateCartQuantityAction, removeFromCartAction } from '@/features/cart/actions'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/ui/modal'

interface CartItemControlsProps {
  cartItemId: string
  jumlah: number
  maxStok: number
}

export function CartItemControls({ cartItemId, jumlah, maxStok }: CartItemControlsProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const { toast } = useToast()

  function handleQty(delta: number) {
    const newQty = jumlah + delta
    if (newQty < 1) return
    if (newQty > maxStok) {
      toast(`Stok tersedia hanya ${maxStok} pcs.`, 'warning')
      return
    }
    startTransition(async () => {
      const result = await updateCartQuantityAction(cartItemId, newQty)
      if (result.error) toast(result.error, 'error')
    })
  }

  function handleRemove() {
    setIsRemoving(true)
    startTransition(async () => {
      const result = await removeFromCartAction(cartItemId)
      if (result.error) {
        toast(result.error, 'error')
        setIsRemoving(false)
      }
      setShowConfirm(false)
    })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          disabled={isPending || jumlah <= 1}
          onClick={() => handleQty(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-[#ccff00]/30 hover:text-[#ccff00] disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[28px] text-center text-sm font-bold text-white">
          {jumlah}
        </span>
        <button
          disabled={isPending || jumlah >= maxStok}
          onClick={() => handleQty(1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-[#ccff00]/30 hover:text-[#ccff00] disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          disabled={isPending}
          onClick={() => setShowConfirm(true)}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleRemove}
        title="Hapus Item?"
        description="Item ini akan dihapus dari keranjang kamu."
        confirmLabel="Hapus"
        confirmVariant="danger"
        loading={isRemoving}
      />
    </>
  )
}
