'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProductAction } from '@/features/admin/actions'
import { ConfirmModal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProductAction(productId)
      if (result.error) {
        toast(result.error, 'error')
      } else {
        toast('Produk berhasil dihapus.', 'success')
      }
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Hapus
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={`Hapus "${productName}"?`}
        description="Produk yang dihapus tidak dapat dikembalikan. Inventori terkait juga akan ikut terhapus."
        confirmLabel="Hapus Produk"
        confirmVariant="danger"
        loading={isPending}
      />
    </>
  )
}
